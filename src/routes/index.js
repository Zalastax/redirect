import redirectRoutes from './redirect'
import recaptchaRoutes from './recaptcha'

export default (server, store, logger) => {
    logger.info('Adding routes to server...')
    redirectRoutes(server, store, logger)
    recaptchaRoutes(server, store, logger)
    logger.info('Routes added to server!')
}
