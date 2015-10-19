import Joi from 'joi'

export const resource_token = Joi.string().guid()
    .description('Password token to show that you own this method+identifier pair')

export const not_robot_token = Joi.string().guid()
    .description('Token that validates that you are not a robot')

export const uri_identifier = Joi.string().token().min(1).max(50).description('Used to lookup the URI to redirect to. 1-50 characters (a-Z, 0-9, and underscore _)')

export const redirect_uri = Joi.string().uri().description('URI to redirect to if a request is made to /{identifier}')

export const updateable_methods = Joi.number().allow(302, 307)
