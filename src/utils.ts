import { Cache } from 'apollo-cache';
import * as deepmerge from 'deepmerge';

import { CacheStore } from './cache-interfaces';

export function getHash(s: any): string {
    const str = JSON.stringify(s);
    let hash = 0;

    if (typeof str === 'undefined' || !str.length) {
        return String(hash);
    }

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        // tslint:disable-next-line:no-bitwise
        hash = ((hash << 5) - hash) + char;
        // tslint:disable-next-line:no-bitwise
        hash = hash & hash;
    }

    return String(hash);
}

export function getHashForQuery(query: Cache.ReadOptions): string {
    return getHash(query.query.loc.source.body || '') + '___' + getHash(query.variables || {});
}

export function getCacheableNodes(obj: any, getIdFromNode: (o: any) => string): CacheStore {
    let nodes: CacheStore = {};

    for (const key of Object.keys(obj)) {
        const value = obj[key];

        if (key === '__typename') {
            const id = getIdFromNode(obj);

            if (id) {
                nodes[value] = nodes[value] || {};
                nodes[value][id] = obj;
            }
        }

        if (value === Object(value)) {
            nodes = deepmerge(nodes, getCacheableNodes(value, getIdFromNode));
        }
    }

    return nodes;
}

export function getDefaultIdFromNode(node: any): any {
    if (typeof node.id === 'undefined' && typeof node._id === 'undefined') {
        return;
    }

    return node.id || node._id;
}
