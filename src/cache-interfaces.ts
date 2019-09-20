/**
 * Representation of a Node:
 * {
 *   __typename: 'Book',
 *   id: 12,
 *   name: 'Test',
 *   foo: 'bar'
 * }
 */
interface CacheableNode {
    [prop: string]: any;
}

/**
 * Representation of a cache store:
 * {
 *   Book: {
 *     12: {
 *       __typename: 'Book',
 *       id: 12,
 *       name: 'Test',
 *       foo: 'bar'
 *     },
 *     24: {
 *       __typename: 'Book',
 *       id: 24,
 *       name: 'Test #2',
 *       foo: 'bar2'
 *     }
 *   },
 *   Author: {
 *     45: {
 *        __typename: 'Author',
 *        id: 45,
 *        name: 'Foo Bar'
 *     }
 *   }
 * }
 */
export interface CacheStore {
    [nodeType: string]: {
        [id: string]: CacheableNode;
    };
}

export interface QueryStore {
    [queryHash: string]: any;
}

export interface SerialisedState {
    store: CacheStore;
    queries: QueryStore;
}
