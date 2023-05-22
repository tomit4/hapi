// TODO: Complete this, look at note on line 98

'use strict'
const Hapi = require('@hapi/hapi')
const Bcrypt = require('bcrypt')
const Path = require('path')
const Jwt = require('@hapi/jwt')

// Dummy database
const users = [
    {
        username: 'john',
        password:
            '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm', // 'secret'
        name: 'John Doe',
        id: '2133d32a',
    },
]

const init = async () => {
    const server = Hapi.server({
        port: 8000,
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
            // maxAgeSec: 14400, // 4 hours
            maxAgeSec: 60, // 1 minute
            timeSkewSec: 15,
        },
        validate: (artifacts, request, h) => {
            const { id } = artifacts.decoded.payload
            const account = users.find(user => user.id === id)

            if (!account) {
                return { isValid: false }
            }

            return {
                isValid: true,
                credentials: { user: account },
            }
        },
    })

    server.auth.default('my_jwt_strategy')
    server.route([
        {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                return '<h1>Welcome to the restricted home page</h1>'
            },
            options: {
                auth: 'my_jwt_strategy',
            },
        },
        {
            method: 'GET',
            path: '/login',
            handler: (request, h) => {
                return h.file('index.html')
            },
            options: {
                auth: false,
            },
        },
        {
            method: 'POST',
            path: '/login',
            handler: async (request, h) => {
                const { username, password } = request.payload
                const account = users.find(user => user.username === username)

                if (
                    !account ||
                    !(await Bcrypt.compare(password, account.password))
                ) {
                    return h.redirect('/login')
                }

                const token = server.methods.jwt.sign({ id: account.id })
                // stores token as cookie to be read later...
                // currently redirecting still gives 401 error as / is not yet set up properly...
                // return to this next
                return h.redirect('/').state('token', token)

                // simply reads token back to you
                // return h.response({ token }).code(200)
            },
            options: {
                auth: {
                    mode: 'try',
                    strategy: 'my_jwt_strategy',
                },
            },
        },
    ])

    server.method('jwt.sign', payload => {
        const token = Jwt.token.generate(payload, 'some_shared_secret')
        return token
    })

    server.method('jwt.decode', token => {
        const decoded = Jwt.token.decode(token)
        return decoded
    })

    await server.start()
    console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', err => {
    console.error('ERROR :=>', err)
    process.exit(1)
})

init()
