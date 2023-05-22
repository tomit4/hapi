'use strict'
const Hapi = require('@hapi/hapi')
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

    await server.register(require('@hapi/inert'))
    // by passing the filenames image.jpg or image2.jpg after localhost:3000/
    // you can view them by name now
    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: '.',
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
