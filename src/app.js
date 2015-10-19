import logger from './bunyan'
import Hapi from 'hapi'
import Inert from 'inert'
import Vision from 'vision'
import HapiSwagger from 'hapi-swagger'
import ExitHandler from './ExitHandler'
import TokenCleaner from './TokenCleaner'
import db from './db'
import initRoutes from './routes'


const server = new Hapi.Server({
    connections: {
        routes: {
            cors: true
        }
    }
})

function registerSwagger() {
    return new Promise((resolve, reject) => {
        server.register([
            Inert
            , Vision
            , {
                register: HapiSwagger
                , options: {
                    protocol: process.env.protocol || 'http'
                    , basePath: ''
                    , documentationPath: '/'
                    , apiVersion: require('../package').version
                }
            }
        ], (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}

function startServer() {
    return new Promise((resolve, reject) => {
        server.start((err) => {
            if (err) {
                return reject(err)
            }
            resolve(server.info.uri)
        })
    })
}

const exitHandler = new ExitHandler(logger)

// If a Promise rejection isn't handled
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise })
})

server.connection({ port: 8080 })
logger.info('Initializing server!')
logger.info('Loading database...')
db('db/store.json')
.then(store => {
    exitHandler.cleanupMethods.add(() => store.close())
    logger.info('Database loaded!')
    logger.info('Initializing routes...')
    initRoutes(server, store, logger)
    new TokenCleaner(logger, store)
        .setClearingInterval({ hours: 3 }, 600000)
})
.then(() => {
    logger.info('Routes initialized!')
    logger.info('Registering swagger...')
})
.then(registerSwagger)
.then(() => {
    logger.info('Swagger registered!')
    logger.info('Starting server...')
})
.then(startServer)
.then((uri) => {
    logger.info({ uri }, 'Server started!')
})
.catch(err => {
    logger.error(err, 'Failed to initialize server.')
})

