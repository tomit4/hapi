'use strict'
// Demonstration of basic HapiJS server:
// https://hapi.dev/tutorials/gettingstarted/?lang=en_US
// https://hapi.dev/tutorials/expresstohapi/?lang=en_US
const Hapi = require('@hapi/hapi')
const getDate = require('./getDate')

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
    })

    // Basic GET
    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return '<h1>Hello World!</h1>'
        },
    })
    // Basic GET with optional parameter
    server.route({
        method: 'GET',
        path: '/hello/{name?}',
        handler: (request, h) => {
            if (request.params.name)
                return `<h1>Hello ${request.params.name}!</h1>`
            else return '<h1>Hello World!</h1>'
        },
    })
    // Basic GET with redirect
    server.route({
        method: 'GET',
        path: '/home',
        handler: (request, h) => {
            return h.redirect('/')
        },
    })

    // Basic verbage around PUT / POST / 'app.all()'
    server.route({
        method: ['PUT', 'POST'],
        // method: '*',
        path: '/',
        handler: function (request, h) {
            return 'success'
        },
    })

    // No need for res.json() in Hapi:
    server.route({
        method: 'GET',
        path: '/user',
        handler: (request, h) => {
            const user = {
                firstName: 'John',
                lastName: 'Doe',
                userName: 'JohnDoe',
                id: 123,
            }
            return user
        },
    })

    /* hapi has 7 extension points along the request lifecycle.
     * In order, they are onRequest, onPreAuth, onCredentials,
     * onPostAuth, onPreHandler, onPostHandler, and onPreResponse. */
    // onRequest runs after server receives request object,
    // thusly rerouting all routes to /test

    // server.ext('onRequest', (request, h) => {
    // request.setUrl('/test')
    // return h.continue
    // })

    // Basic GET
    // server.route({
    // method: 'GET',
    // path: '/test',
    // handler: (request, h) => {
    // return '<h1>Hello TEST!</h1>'
    // },
    // })

    // Plugin Registration
    await server.register({
        plugin: getDate,
        options: {
            name: 'Tom',
        },
    })
    // server.decorate registers the plugin
    // with hapi's h object
    server.route({
        method: 'GET',
        path: '/date',
        handler: (request, h) => {
            return h.getDate()
        },
    })

    // no middleware necessary for parsing payloads
    // test by invoking ./crl.sh in command line from this dir
    server.route({
        method: 'POST',
        path: '/hello',
        handler: (request, h) => {
            const name = request.payload.name
            return `Hello ${name}\n`
        },
    })

    // set a cookie
    // hapi requires no middleware to set cookies
    server.state('username', {
        ttl: null,
        isSecure: true,
        isHttpOnly: true,
    })

    // upon navigation to /username, we set the cookies to {username, tom}
    // check browser's native cookie section in the storage section of devtools
    server.route({
        method: 'GET',
        path: '/username',
        handler: (request, h) => {
            // set the cookie value (calling h.state changes request.state)
            h.state('username', 'tom')
            // getting a cookie value
            return h.response(request.state.username)
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
