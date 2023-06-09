'use strict'
const Hapi = require('@hapi/hapi')

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
    })

    await server.start()
    console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', err => {
    console.error('ERROR :=>', err)
    process.exit(1)
})

init()
