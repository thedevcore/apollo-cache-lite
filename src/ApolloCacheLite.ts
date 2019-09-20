import { ApolloCache, Cache, DataProxy, Transaction } from 'apollo-cache';
import { addTypenameToDocument } from 'apollo-utilities';
import * as deepmerge from 'deepmerge';
import { DocumentNode } from 'graphql';

import { CacheStore, QueryStore, SerialisedState } from './cache-interfaces';
import { getCacheableNodes, getDefaultIdFromNode, getHashForQuery } from './utils';

export interface ApolloCacheLiteOptions {
    getIdFromObject?(obj: any): string | null;
}

export class ApolloCacheLite extends ApolloCache<SerialisedState> {
    private store: CacheStore = {};
    private queries: QueryStore = {};
    private watchers: Cache.WatchOptions[] = [];
    private options: ApolloCacheLiteOptions = {
        getIdFromObject: getDefaultIdFromNode
    };

    constructor(options: ApolloCacheLiteOptions = {}) {
        super();
        this.options = { ...this.options, ...options };
        this.reset();
    }

    diff(query: DataProxy.Query<any>): DataProxy.DiffResult<any> {
        const result = this.read(query as Cache.ReadOptions<any>);

        return {
            complete: !!result,
            result
        };
    }

    watch(watcher: Cache.WatchOptions): () => void {
        this.watchers.push(watcher);

        return () => {
            this.watchers = this.watchers.filter(w => w !== watcher);
        };
    }

    write(options: Cache.WriteOptions): void {
        const { result, query, variables } = options;
        const nodes = getCacheableNodes(result, this.options.getIdFromObject);
        const hash = getHashForQuery({ query, variables } as Cache.ReadOptions);

        this.store = deepmerge(this.store, nodes);
        this.queries[hash] = result;
    }

    read<T>(query: Cache.ReadOptions): T {
        const hash = getHashForQuery(query);

        if (this.queries[hash]) {
            return this.queries[hash] as T;
        }
    }

    readFragment<T>(options: DataProxy.Fragment<any>): T {
        // @TODO: return requested fields only
        try {
            const [type, id] = options.id.split(':');
            return this.store[type][id] as T;

        } catch (e) {
            return;
        }
    }

    extract(): SerialisedState {
        return {
            queries: { ...this.queries },
            store: { ...this.store }
        };
    }

    restore(serialisedState: SerialisedState): ApolloCacheLite {
        const { queries, store } = serialisedState;
        this.queries = queries;
        this.store = store;

        // Trying to expose internal state to
        // `window.__APOLLO_STATE__` for debugging reasons.
        try {
            (window as any).__APOLLO_STATE__ = {
                queries: this.queries,
                store: this.store
            };
        } catch (e) {}

        return this;
    }

    async reset() {
        this.store = {};
        this.queries = {};
        this.watchers = [];
    }

    transformDocument(document: DocumentNode): DocumentNode {
        return addTypenameToDocument(document);
    }

    // @TODO
    evict<TVariables = any>(query: Cache.EvictOptions<TVariables>): Cache.EvictionResult {
        throw new Error('[apollo-cache-lite] Method not implemented!');
    }

    removeOptimistic(id: string): void {
        throw new Error('[apollo-cache-lite] Method not implemented!');
    }

    performTransaction(transaction: Transaction<SerialisedState>): void {
        throw new Error('[apollo-cache-lite] Method not implemented!');
    }

    recordOptimisticTransaction(transaction: Transaction<SerialisedState>, id: string): void {
        throw new Error('[apollo-cache-lite] Method not implemented!');
    }
}
