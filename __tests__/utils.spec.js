const { getCacheableNodes, getDefaultIdFromNode, getHash, getHashForQuery } = require('../src/utils');

describe('Utils', () => {
    describe('getHash', () => {
        it('should return the same hash for the same input', () => {
            expect(getHash('asd')).toBe('34403090');
            expect(getHash('asd')).toBe('34403090');
        });

        it('should return a hash for complex inputs', () => {
            expect(getHash({ a: 123 })).toBe('1364385693');
            expect(getHash(['asd', 'dsa', { foo: 'bar' }])).toBe('-128420855');
        });

        it('should return a hash for falsy inputs', () => {
            expect(getHash()).toBe('0');
            expect(getHash('')).toBe('1088');
            expect(getHash({})).toBe('3938');
            expect(getHash([])).toBe('2914');
        });
    });

    describe('getHashForQuery', () => {
        it('should return a hash for a query with variables', () => {
            const query = {
                query: {
                    loc: {
                        source: {
                            body: 'query body'
                        }
                    }
                },
                variables: {
                    a: 1,
                    b: 'foo'
                }
            };

            expect(getHashForQuery(query)).toBe('1650944006___409938244');
        });

        it('should return a hash for a query without variables', () => {
            const query = {
                query: {
                    loc: {
                        source: {
                            body: 'query body'
                        }
                    }
                }
            };

            expect(getHashForQuery(query)).toBe('1650944006___3938');
        });
    });

    describe('getDefaultIdFromNode', () => {
        it('should return undefined when no id / _id is present', () => {
            expect(getDefaultIdFromNode({})).toBe(undefined);
        });

        it('should return string if id / _id is present', () => {
            expect(getDefaultIdFromNode({ id: 'a' })).toBe('a');
            expect(getDefaultIdFromNode({ _id: 'b' })).toBe('b');
            expect(getDefaultIdFromNode({ id: 123 })).toBe(123);
        });
    });

    describe('getCacheableNodes', () => {
        it('should extract cacheable nodes from object', () => {
            const obj = {
                __typename: 'Book',
                id: '111',
                name: 'Test Book',
                author: {
                    __typename: 'Author',
                    _id: '222',
                    name: 'Mr Foo Bar'
                },
                cover: {
                    url: 'http://foobar.com/cover.jpg'
                }
            };

            expect(getCacheableNodes(obj, getDefaultIdFromNode)).toEqual({
                Book: {
                    '111': {
                        __typename: 'Book',
                        id: '111',
                        name: 'Test Book',
                        author: {
                            __typename: 'Author',
                            _id: '222',
                            name: 'Mr Foo Bar'
                        },
                        cover: {
                            url: 'http://foobar.com/cover.jpg'
                        }
                    }
                },
                Author: {
                    '222': {
                        __typename: 'Author',
                        _id: '222',
                        name: 'Mr Foo Bar'
                    }
                }
            });
        });

        it('should generate IDs using the provided function', () => {
            const idGeneratorFn = obj => {
                if (obj.__typename === 'Book') {
                    return `${obj.id}::${obj.name}`;
                } else if (obj.__typename === 'Author') {
                    return `${obj._id}__${obj.name.split('').reverse().join('')}`;
                } else {
                    return String(obj.id || obj._id);
                }
            };

            const obj = {
                __typename: 'Book',
                id: '111',
                name: 'Test Book',
                author: {
                    __typename: 'Author',
                    _id: '222',
                    name: 'Mr Foo Bar'
                },
                cover: {
                    url: 'http://foobar.com/cover.jpg'
                }
            };

            expect(getCacheableNodes(obj, idGeneratorFn)).toEqual({
                Book: {
                    '111::Test Book': {
                        __typename: 'Book',
                        id: '111',
                        name: 'Test Book',
                        author: {
                            __typename: 'Author',
                            _id: '222',
                            name: 'Mr Foo Bar'
                        },
                        cover: {
                            url: 'http://foobar.com/cover.jpg'
                        }
                    }
                },
                Author: {
                    '222__raB ooF rM': {
                        __typename: 'Author',
                        _id: '222',
                        name: 'Mr Foo Bar'
                    }
                }
            });
        });
    });
});
