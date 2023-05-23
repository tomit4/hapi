const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')

const internals = {}

internals.start = async function () {
    const server = Hapi.server({ port: 8000 })

    await server.register(Jwt)

    server.auth.strategy('my_jwt_strategy', 'jwt', {
        keys: 'some_shared_secret',
        verify: {
            aud: 'urn:audience:test',
            iss: 'urn:issuer:test',
            sub: false,
            nbf: true,
            exp: true,
            maxAgeSec: 30, // 30 seconds
            timeSkewSec: 15,
        },
        validate: (artifacts, request, h) => {
            return {
                isValid: true,
                all_info: artifacts,
                credentials: { user: artifacts.decoded.payload.user },
            }
        },
    })

    server.auth.default('my_jwt_strategy')

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return '<h1>Welcome to restricted!</h1>'
        },
        options: {
            auth: 'my_jwt_strategy',
        },
    })

    await server.start()
    console.log('Server running on %s', server.info.uri)
}

internals.start()
