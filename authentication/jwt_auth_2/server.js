'use strict'
const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const Path = require('path')

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public'),
            },
        },
    })

    await server.register(Jwt)
    await server.register(require('@hapi/inert'))

    server.auth.strategy('my_jwt_strategy', 'jwt', {
        keys: 'some_shared_secret',
        verify: {
            aud: 'urn:audience:test',
            iss: 'urn:issuer:test',
            sub: false,
            nbf: true,
            exp: true,
            maxAgeSec: 30,
            timeSkewSec: 15,
        },
        validate: (artifacts, request, h) => {
            return {
                isValid: true,
                credentials: { user: artifacts.decoded.payload.user },
            }
        },
    })

    server.auth.default('my_jwt_strategy')

    await server.start()
    console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', err => {
    console.error('ERROR :=>', err)
    process.exit(1)
})

init()
