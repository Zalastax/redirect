import Joi from 'joi'
import Boom from 'boom'
import uuid from 'uuid'
import {
    uri_identifier
    , redirect_uri
    , resource_token
    , not_robot_token
    , updateable_methods
} from './validations'

export default (server, store, logger) => {
    const redirects = store.getCollection('redirects')
    const tokens = store.getCollection('tokens')

    logger.info('Adding redirect routes to server...')
    server.route({
        method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
        , path: '/{identifier}'
        , config: {
            description: 'redirect to the URi matching the identifier'
            , tags: ['api']
            , validate: {
                params: {
                    identifier: uri_identifier.required()
                }
            }
        }, handler: (req, reply) => {
            const identifier = req.params.identifier
            const doc = redirects.findOne({ identifier: identifier })

            if (!doc) {
                return reply(Boom.notFound('method+identifier combination not found'))
            }

            reply().redirect(doc.uri).code(doc.method)
        }
    })

    server.route({
        method: 'POST'
        , path: '/{identifier}/create'
        , config: {
            description: 'take control of an identifier'
            , tags: ['api']
            , validate: {
                params: {
                    identifier: uri_identifier.required()
                }
                , payload: {
                    uri: redirect_uri.required()
                    , method: Joi.number().allow(301, 302, 307, 308).required()
                        .description('HTTP method to redirect using')
                    , token: not_robot_token.required()
                }
            }
        }, handler: (req, reply) => {
            const identifier = req.params.identifier
            const { uri, method } = req.payload
            const passwordToken = req.payload.token

            const accessGranted = tokens.findOne({ token: passwordToken })

            if (!accessGranted) {
                return reply(Boom.forbidden('You seem to be a robot. Please validate using /recaptcha and use that response token here.'))
            }

            tokens.remove(accessGranted)
            const documentToken = uuid.v4()
            const doc = redirects.insert({ identifier, uri, token: documentToken, method })
            if (Array.isArray(doc)) {
                return reply(Boom.conflict('Redirect already exists for the given identifier'))
            }

            reply(doc)
        }
    })

    function findUpdateableRedirect(identifier, token) {
        return new Promise((resolve, reject) => {
            const result = redirects.findOne({ identifier: identifier })

            if (!result) {
                return reject(Boom.notFound('No document exists for the given identifier'))
            }

            if (result.method !== 302 && result.method !== 307) {
                return reject(Boom.forbidden(`Method ${ result.method } is permanent. Only updateable methods (302/307) are allowed to be updated.`))
            }

            if (token !== result.token) {
                return reject(Boom.forbidden('Invalid token for the given identifier'))
            }

            resolve(result)
        })
    }

    server.route({
        method: 'PATCH'
        , path: '/{identifier}/update'
        , config: {
            description: 'Update an identifier. '
            , tags: ['api']
            , validate: {
                params: {
                    identifier: uri_identifier.required()
                }
                , payload: {
                    uri: redirect_uri
                    , token: resource_token.required()
                    , method: updateable_methods.description('Change HTTP method. Only updateable methods allowed (302 and 307)')
                }
            }
        }, handler: (req, reply) => {
            const identifier = req.params.identifier
            const { uri, token, method } = req.payload


            findUpdateableRedirect(identifier, token)
            .then(record => {
                if (method || uri) {
                    record.uri = uri || record.uri
                    record.method = method || record.method
                    redirects.update(record)
                }
                return record
            })
            .then(reply, reply)
        }
    })

    server.route({
        method: 'DELETE'
        , path: '/{identifier}/delete'
        , config: {
            description: 'Delete an identifier.'
            , tags: ['api']
            , validate: {
                params: {
                    identifier: uri_identifier.required()
                }
                , payload: {
                    token: resource_token.required()
                }
            }
        }, handler: (req, reply) => {
            const identifier = req.params.identifier
            const { token } = req.payload

            findUpdateableRedirect(identifier, token)
            .then(record => {
                redirects.remove(record)
            })
            .then(() => reply().code(204), reply)
        }
    })

    logger.info('Redirect routes added to server!')
}
