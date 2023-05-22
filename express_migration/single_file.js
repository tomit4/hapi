'use strict'
const Hapi = require('@hapi/hapi')
const Path = require('path')

// You can use @hapi/inert plugin to serve static files
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

    await server.register(require('@hapi/inert'))

    server.route({
        method: 'GET',
        path: '/image',
        // handler: (request, h) => {
        // return h.file('image.jpg')
        // },
        handler: {
            file: 'image.jpg',
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
