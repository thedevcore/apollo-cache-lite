const { ApolloClient } = require('apollo-client');
const { SchemaLink } = require('apollo-link-schema');
const { makeExecutableSchema } = require('graphql-tools');
const gql = require('graphql-tag');

const { ApolloCacheLite } = require('../src/ApolloCacheLite');
const resolvers = require('./test-utils/resolvers');
const typeDefs = require('./test-utils/type-defs');

function createApolloClient() {
    const schema = makeExecutableSchema({ typeDefs, resolvers });

    return new ApolloClient({
        cache: new ApolloCacheLite(),
        link: new SchemaLink({ schema })
    });
}

describe('ApolloCacheLite', () => {
    it('should export a class', () => {
        expect(ApolloCacheLite).toBeDefined();
        expect(new ApolloCacheLite()).toBeInstanceOf(ApolloCacheLite);
    });

    it('client.query() / cache.write() :: should store query and cacheable nodes', async () => {
        const client = createApolloClient();

        const { data } = await client.query({
            query: gql(`{
                getBook(id: 1) {
                    id
                    title
                    author {
                        id
                        name
                    }
                }
            }`)
        });

        const { queries, store } = client.cache.extract();

        expect(data).toEqual({
            getBook: {
                __typename: 'Book',
                id: '1',
                title: 'Test book',
                author: {
                    __typename: 'Author',
                    id: '1',
                    name: 'D'
                }
            }
        });

        expect(queries).toEqual({ '-702561878___3938': data });

        expect(store).toEqual({
            Author: {
                '1': {
                    __typename: 'Author',
                    id: '1',
                    name: 'D'
                }
            },
            Book: {
                '1': {
                    __typename: 'Book',
                    id: '1',
                    title: 'Test book',
                    author: {
                        __typename: 'Author',
                        id: '1',
                        name: 'D'
                    }
                }
            }
        });
    });

    it('client.readQuery() / cache.read() :: should return cached result for a query', async () => {
        const client = createApolloClient();
        const options = {
            query: gql(`{
                getBook(id: 1) {
                    id
                    title
                    author {
                        id
                        name
                    }
                }
            }`)
        };

        // calling client.readQuery() with cold cache should return undefined
        expect(await client.readQuery(options)).not.toBeDefined();

        // cache warmup
        await client.query(options);

        // test client.readQuery() with warm cache
        const data = await client.readQuery(options);
        const { queries, store } = client.cache.extract();

        expect(data).toEqual({
            getBook: {
                __typename: 'Book',
                id: '1',
                title: 'Test book',
                author: {
                    __typename: 'Author',
                    id: '1',
                    name: 'D'
                }
            }
        });

        expect(queries).toEqual({ '-702561878___3938': data });

        expect(store).toEqual({
            Author: {
                '1': {
                    __typename: 'Author',
                    id: '1',
                    name: 'D'
                }
            },
            Book: {
                '1': {
                    __typename: 'Book',
                    id: '1',
                    title: 'Test book',
                    author: {
                        __typename: 'Author',
                        id: '1',
                        name: 'D'
                    }
                }
            }
        });
    });

    it('client.readFragment() / cache.readFragment() :: should return cached node', async () => {
        const client = createApolloClient();

        // cache warmup
        await client.query({
            query: gql(`{
                getBook(id: 1) {
                    id
                    title
                    author {
                        id
                        name
                    }
                }
            }`)
        });

        // test readFragment() with warm cache
        const data = client.readFragment({
            id: 'Book:1',
            fragment: `
                fragment fullBookDetails on Book {
                    id
                    title
                    author {
                        id
                        name
                    }
                }
            `
        });

        expect(data).toEqual({
            __typename: 'Book',
            id: '1',
            title: 'Test book',
            author: {
                __typename: 'Author',
                id: '1',
                name: 'D'
            }
        });
    });
});
