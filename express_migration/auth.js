// In Express, Passport is used for 3rd part auth like oAuth
// Hapi uses bell, which I won't go into detail here, but you can look at here:
// https://github.com/hapijs/bell/blob/master/Providers.md

// Install with:
// npm install '@hapi/bell'
const Hapi = require('@hapi/hapi')
const Bell = require('@hapi/bell')

const server = Hapi.server({ port: 8000 })

await server.register(Bell)

server.auth.strategy('twitter', 'bell', {
    provider: 'twitter',
    password: 'cookie_encryption_password_secure',
    clientId: TWITTER_CONSUMER_KEY,
    clientSecret: TWITTER_CONSUMER_SECRET,
    isSecure: false,
})

server.route({
    method: '*',
    path: '/auth/twitter', // The callback endpoint registered with the provider
    handler: function (request, h) {
        if (!request.auth.isAuthenticated) {
            return `Authentication failed due to: ${request.auth.error.message}`
        }

        // Perform any account lookup or registration, setup local session,
        // and redirect to the application. The third-party credentials are
        // stored in request.auth.credentials. Any query parameters from
        // the initial request are passed back via request.auth.credentials.query.

        return h.redirect('/home')
    },
    options: {
        auth: {
            strategy: 'twitter',
            mode: 'try',
        },
    },
})
