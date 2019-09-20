module.exports = `
    type Query {
        getBook(id: ID!): Book
    }

    type Book {
        id: ID!
        title: String!
        author: Author!
    }

    type Author {
        id: ID!
        name: String!
    }
`;
