'use strict'
const Hapi = require('@hapi/hapi')

// registering view engines like pug is easy with @hapi/vision
const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
    })

    // register vision plugin for template engine
    await server.register(require('@hapi/vision'))

    server.views({
        engines: {
            pug: require('pug'),
        },
        relativeTo: __dirname,
        path: 'views',
    })

    server.route({
        method: 'GET',
        path: '/',
        // handler: (request, h) => {
        // return h.view('index', { title: 'Homepage', message: 'Welcome' })
        // },
        handler: {
            view: {
                template: 'index',
                context: {
                    title: 'Homepage',
                    message: 'Welcome',
                },
            },
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
