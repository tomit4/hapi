'use strict'
const Hapi = require('@hapi/hapi')

// our "user database"
const people = {
    1: {
        id: 1,
        name: 'Jen Jones',
    },
}

// bring your own validation function
const validate = async function (decoded, request, h) {
    // do your checks to see if the person is valid
    if (!people[decoded.id]) {
        return { isValid: false }
    } else {
        return { isValid: true }
    }
}

const init = async () => {
    const server = Hapi.server({
        port: 8000,
        host: 'localhost',
    })
    await server.register(require('hapi-auth-jwt2'))
    server.auth.strategy('jwt', 'jwt', {
        key: 'NeverShareYourSecret',
        validate: validate,
    })
    server.auth.default('jwt')

    server.route([
        {
            method: 'GET',
            path: '/',
            config: { auth: false },
            handler: function (request, h) {
                return { text: 'Token not required' }
            },
        },
        {
            method: 'GET',
            path: '/restricted',
            config: { auth: 'jwt' },
            handler: function (request, h) {
                const response = h.response({ text: 'You used a Token!' })
                response.header('Authorization', request.headers.authorization)
                return response
            },
        },
    ])

    await server.start()
    return server
}

process.on('unhandledRejection', err => {
    console.error('ERROR :=>', err)
    process.exit(1)
})

init()
    .then(server => console.log('Server running on %s', server.info.uri))
    .catch(err => console.error('ERROR :=>', err))
