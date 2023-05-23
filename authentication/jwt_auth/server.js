'use strict'
const Hapi = require('@hapi/hapi')
const Bcrypt = require('bcrypt')
const Path = require('path')
const Jwt = require('@hapi/jwt')

const generatePasswd = async (passwd, salt) => {
    return await Bcrypt.hash(passwd, salt)
}

// Dummy database
const users = [
    {
        username: 'john',
        password: '',
        name: 'John Doe',
        id: '2133d32a',
    },
    {
        username: 'brian',
        password: '',
        name: 'Brian Brianson',
        id: '1715a32e',
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

    const unhashedPasswords = ['secret', 'mysecret']
    users.forEach(async (user, i) => {
        user.password = await generatePasswd(unhashedPasswords[i], 10)
    })

    await server.register(Jwt)
    await server.register(require('@hapi/inert'))

    server.auth.strategy('my_jwt_strategy', 'jwt', {
        keys: {
            key: 'some_shared_secret',
            algorithms: ['HS256'],
        },
        verify: {
            aud: 'urn:audience:test',
            iss: 'urn:issuer:test',
            sub: false,
            nbf: true,
            exp: true,
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
            handler: async (request, h) => {
                console.log('headers :=>', request.headers)
                if (request.state.token) {
                    const token = request.state.token
                    const validationResult = server.methods.jwt.decode(token)

                    const payloadId = validationResult.decoded.payload.id
                    const account = users.find(user => user.id === payloadId)
                    if (validationResult && account) {
                        return `<h1>Welcome to the restricted home page, here's your user info!</h1>\n
                            <p>${JSON.stringify(account)}</p>`
                    }
                } else {
                    return h.redirect('/login')
                }
            },
            options: {
                auth: false,
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

                const token = server.methods.jwt.sign(
                    { id: account.id },
                    'some_shared_secret',
                    { expiresIn: 15 },
                )
                // console.log('token :=>', token)
                return h.redirect('/').state('token', token, {
                    isSecure: true,
                    isHttpOnly: true,
                })
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
