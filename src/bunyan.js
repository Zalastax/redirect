import bunyan from 'bunyan'
import get_env from 'get-env'

if (bunyan.prototype.log === undefined) {
    bunyan.prototype.log = bunyan.prototype.info
}

const BUNYAN_DEFAULT_PARAMS = {
    name: 'redirect'
}

const BUNYAN_DEVELOP_PARAMS = Object.assign({}, BUNYAN_DEFAULT_PARAMS, {
    level: 'trace'
    , src: true
})

const BUNYAN_PRODUCTION_PARAMS = Object.assign({}, BUNYAN_DEFAULT_PARAMS, {
    level: 'info'
    , src: false
})

export function create_logger(option_overrider) {
    const BUNYAN_BASE_PARAMS = get_env() === 'prod' ? BUNYAN_PRODUCTION_PARAMS : BUNYAN_DEVELOP_PARAMS
    const logger = bunyan.createLogger(Object.assign({}, BUNYAN_BASE_PARAMS, option_overrider))
    return logger
}

export default create_logger()
