import Joi from 'joi'
import Boom from 'boom'
import uuid from 'uuid'
import request from 'request'
import { not_robot_token } from './validations'

/**
* Validates recaptcha answers and ads tokens on success
*/
export default (server, store, logger) => {
    const tokens = store.getCollection('tokens')

    logger.info('Adding recaptcha routes to server...')

    server.route({
        method: 'GET'
        , path: '/recaptcha'
        , config: {
            description: 'Get the recaptcha sitekey'
            , tags: ['api']
            , validate: {
            }
        }, handler: (req, reply) => {
            reply({ sitekey: process.env.RECAPTCHA_SITEKEY })
        }
    })

    server.route({
        method: 'POST'
        , path: '/recaptcha'
        , config: {
            description: 'Submit the reCAPTCHA response to get an access token'
            , tags: ['api']
            , validate: {
                payload: {
                    'g-recaptcha-response': Joi.string().required()
                        .description('Response from the reCAPTCHA validation')
                }
            }
            , response: {
                schema: Joi.object({
                    success: Joi.boolean().required()
                    , token: not_robot_token
                    , created: Joi.date()
                    , 'error-codes': Joi.array().items(Joi.string())
                }).options({ allowUnknown: true })
            }
        }, handler: (req, reply) => {
            request.post({
                url: 'https://www.google.com/recaptcha/api/siteverify'
                , form: {
                    secret: process.env.RECAPTCHA_SECRET
                    , response: req.payload['g-recaptcha-response']
                    , remoteip: req.info.remoteAddress
                }
            }, (err, http_response, body) => {
                if (err) return reply(Boom.serverTimeout('Error when talking to Google'))

                try {
                    let response = JSON.parse(body)
                    if (response.success) {
                        const doc = tokens.insert({ token: uuid.v4(), created: Date.now() })
                        response = Object.assign(response, { token: doc.token, created: doc.created })
                    }

                    return reply(response)
                } catch (parse_error) {
                    return reply(Boom.serverTimeout('Google gave not JSON', parse_error))
                }
            })
        }
    })
    logger.info('Recaptcha routes added to server!')
}
