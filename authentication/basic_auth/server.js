'use strict'
const Hapi = require('@hapi/hapi')
const Bcrypt = require('bcrypt')

// dummy database
const users = {
    john: {
        username: 'john',
        password:
            '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm', // 'secret'
        name: 'John Doe',
        id: '2133d32a',
    },
}

// validation logic (usually Joi)
const validate = async (request, username, password) => {
    const user = users[username]
    if (!user) {
        return { isValid: false, credentials: null }
    }

    const isValid = await Bcrypt.compare(password, user.password)
    const credentials = { id: user.id, name: user.name }

    return { isValid, credentials }
}

const init = async () => {
    const server = Hapi.server({
        port: 4000,
        host: 'localhost',
    })

    await server.register(require('@hapi/basic'))
    server.auth.strategy('simple', 'basic', { validate })

    server.route({
        method: 'GET',
        path: '/',
        options: {
            auth: 'simple',
        },
        handler: (request, h) => {
            return '<h1>welcome past the login, my verified friend</h1>'
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
