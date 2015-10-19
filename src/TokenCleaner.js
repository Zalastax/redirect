import { subtract as dateSubtract } from './dateUtil'

function getOldestDate(maxAgeConfig) {
    return dateSubtract.multiple(new Date(), maxAgeConfig)
}


export default class TokenCleaner {
    constructor(logger, store) {
        this.logger = logger
        this.tokens = store.getCollection('tokens')
    }

    removeTokensOlderThanTimestamp(unixtimestamp) {
        this.tokens.removeWhere({ created: { $lt: unixtimestamp } })
    }

    removeTokensOlderThan(maxAgeConfig) {
        this.removeTokensOlderThanTimestamp(getOldestDate(maxAgeConfig).getTime())
    }

    setClearingInterval(maxAgeConfig, milliseconds) {
        if (this.interval) {
            clearInterval(this.interval)
            this.interval = null
        }
        if (milliseconds > 0) {
            this.interval = setInterval(() => {
                this.logger.trace('Clearing old tokens')
                this.removeTokensOlderThan(maxAgeConfig)
                this.logger.trace('Old tokens cleared')
            }, milliseconds)
        }
    }

}
