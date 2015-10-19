import init_routes from '../src/routes'

const server = {
    route: () => {}
}


describe('routes', () => {
    it('should return a promise that fulfills given a basic server and logger', () => {
        return init_routes(server, console)
    })
})
