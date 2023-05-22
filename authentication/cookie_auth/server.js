'use strict'
// TODO: look at line 98 for notes on what to do next
const Hapi = require('@hapi/hapi')
const Bcrypt = require('bcrypt')
const Path = require('path')

// dummy database
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
        port: 4000,
        host: 'localhost',
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public'),
            },
        },
    })

    await server.register(require('@hapi/cookie'))
    await server.register(require('@hapi/inert'))

    server.auth.strategy('session', 'cookie', {
        // once logged in you can see this under
        // storage/cookies in browser dev tools
        cookie: {
            name: 'sid-example',
            password: '!wsYhFA*C2U6nz=Bu^%A@^F#SF3&kSR6',
            isSecure: false,
        },
        redirectTo: '/login',
        validate: async (request, session) => {
            const account = await users.find(user => user.id === session.id)

            if (!account) return { isValid: false }

            return { isValid: true, credentials: account }
        },
    })

    server.auth.default('session')

    server.route([
        {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                return '<h1>Welcome to the restricted home page</h1>'
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

                request.cookieAuth.set({ id: account.id })

                return h.redirect('/')
            },
            options: {
                auth: {
                    mode: 'try',
                },
            },
        },
    ])

    await server.start()
    console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', err => {
    console.error('ERROR :=>', err)
    process.exit(1)
})

init()
