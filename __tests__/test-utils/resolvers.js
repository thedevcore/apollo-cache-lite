const db = {
    books: [
        { id: '1', title: 'Test book', author: '1' },
        { id: '2', title: 'Foo', author: '1' },
    ],
    authors: [
        { id: '1', name: 'D' }
    ]

};

module.exports = {
    Query: {
        getBook: (parent, { id }) => db.books.find(b => b.id === id)
    },

    Book: {
        author: ({ author }) => db.authors.find(a => a.id === author)
    }
};
