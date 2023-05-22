// suceeds joi validation bookSchema.js
const getBooks = () => {
    const event = new Date('05 October 2011 14:48 UTC')

    const event2 = new Date('06 November 2015 16:28 UTC')
    return [
        {
            title: 'Of Mice And Men',
            author: 'Isaac Forgettensen',
            isbn: '1098459999',
            pageCount: 1998,
            datePublished: event.toISOString(),
        },
        {
            title: 'The Catcher in the Rye',
            author: 'Donalden DontKnowingston',
            isbn: '8972415255',
            pageCount: 240,
            datePublished: event2.toISOString(),
        },
    ]
}

// fails joi validation bookSchema.js
const getBooks2 = () => {
    const event = new Date('05 October 2011 14:48 UTC')

    const event2 = new Date()
    return [
        {
            title: 'Of Mice And Men',
            author: 'Isaac Forgettensen',
            isbn: '1098459999',
            pageCount: 1998,
            datePublished: event.toISOString(),
        },
        {
            title: 'The Catcher in the Rye',
            author: 52,
            isbn: true,
            pageCount: '240',
            datePublished: event2,
        },
    ]
}

module.exports = { getBooks, getBooks2 }
