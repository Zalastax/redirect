/**
* Calls all methods in cleanupMethods once on exit
* Logs unhandled errors
*/
export default class ExitHandler {
    constructor( logger) {
        this.cleanupMethods = new Set()
        this.logger = logger

        // cleanup when app is closing
        process.on('exit', this.exitHandler.bind(this,{ cleanup: true }))

        // catches ctrl+c event
        process.on('SIGINT', this.exitHandler.bind(this, { exit: true }))

        // catches SIGTERM
        process.on('SIGTERM', this.exitHandler.bind(this, { exit: true }))

        // catches uncaught exceptions
        process.on('uncaughtException', this.exitHandler.bind(this, { exit: true }))

        logger.info('ExitHandler attached!')
    }

    /**
    * options = {
    *    exit: boolean // Call process.exit(), which triggers process.on('exit')
    *    cleanup: boolean // Call the methods in cleanupMethods
    * }
    */
    exitHandler(options, err) {
        if (options.cleanup) {
            for (const cleanupMethod of this.cleanupMethods) {
                cleanupMethod()
            }
        }
        if (err) {
            this.logger.error('Exit because of uncaught exception', err)
        }
        if (options.exit) {
            process.exit()
        }
    }
}
