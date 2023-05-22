'use strict'
const Hapi = require('@hapi/hapi')
const Joi = require('joi')
const bookSchema = require('./bookSchema')
const { getBooks, getBooks2 } = require('./getBooks')

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
    })

    server.route({
        method: 'POST',
        path: '/post',
        handler: (request, h) => {
            return 'Blog post added!\n'
        },
        options: {
            validate: {
                payload: Joi.object({
                    post: Joi.string().max(140),
                }),
            },
        },
    })

    server.route({
        method: 'GET',
        path: '/books',
        handler: async (request, h) => {
            // succeeds bookSchema validation
            return await getBooks()
            // fails bookSchema validation
            return await getBooks2()
        },
        options: {
            response: {
                schema: Joi.array().items(bookSchema),
                failAction: (request, h, err) => {
                    request.log('error', err)
                    throw err
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
