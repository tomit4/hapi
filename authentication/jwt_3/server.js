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

    // Route for "/"
    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            if (request.state.token) {
                const token = request.state.token
                const decodedToken = Jwt.token.decode(token)

                const verifyToken = (artifact, secret, options = {}) => {
                    try {
                        Jwt.token.verify(artifact, secret, options)
                        return { isValid: true }
                    } catch (err) {
                        return {
                            isValid: false,
                            error: err.message,
                        }
                    }
                }

                const isValid = verifyToken(
                    decodedToken,
                    'some_shared_secret',
                ).isValid
                if (isValid) {
                    return '<h1>Welcome to the restricted page, you have 1 min to bask in its glory</h1>'
                } else {
                    return h.redirect('/signup')
                }
            }
            return { requestAuthCredentials: request.auth.credentials }
        },
        options: {
            auth: {
                mode: 'try',
                strategy: 'my_jwt_strategy',
            },
        },
    })

    // Route for "/signup"
    server.route({
        method: 'GET',
        path: '/signup',
        handler: (request, h) => {
            return '<html><body><form method="POST" action="/"><input type="text" name="name"><input type="submit" value="Submit"></form></body></html>'
        },
        options: {
            auth: false,
        },
    })

    // Route for "/" (POST)
    server.route({
        method: 'POST',
        path: '/',
        handler: (request, h) => {
            const { name } = request.payload
            const token = Jwt.token.generate(
                {
                    aud: 'urn:audience:test',
                    iss: 'urn:issuer:test',
                    user: 'some_user_name',
                    group: 'hapi_community',
                },
                {
                    key: 'some_shared_secret',
                    algorithm: 'HS512',
                },
                {
                    ttlSec: 60, // 1 minute
                },
            )
            return h.redirect('/').state('token', token)
        },
        options: {
            auth: false,
        },
    })

    await server.start()
    console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', err => {
    console.error('ERROR :=>', err)
    process.exit(1)
})

init()
