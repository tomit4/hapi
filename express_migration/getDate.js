'use strict'

const getDate = {
    name: 'getDate',
    version: '1.0.0',
    register: async (server, options) => {
        const currentDate = () => {
            const date = `<h3>Hello ${
                options.name
            }, the date is ${new Date()}</h3>`
            return date
        }
        server.decorate('toolkit', 'getDate', currentDate)
    },
}

module.exports = getDate
