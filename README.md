# apollo-cache-lite

A lightweight cache implementation for [Apollo Client](https://github.com/apollographql/apollo-client).

## Features

- 🚀 **Lightweight** - **Supports the most frequently used use-cases:** SSR, extracting cache state, restoring cache state in browser, reading fragments from cache
- 🔥 **Fast** - Read/write **performance is the top priority** to make your Apollo app faster
- 🚨 **Beta** - Use it carefully, it's **not production ready yet!**

## Getting started

1. Install with npm or yarn:

```shell
npm i --save apollo-cache-lite

yarn add apollo-cache-lite
```

2. Import in your app:
```js
import { ApolloClient } from 'apollo-client';
import { ApolloCacheLite } from 'apollo-cache-lite';

const client = new ApolloClient({
    cache: new ApolloCacheLite(),
    // other apollo-client options…
});
```

## Options

The ApolloCacheLite constructor takes an optional configuration object to customize the cache:

### `getIdFromObject`

A function that takes a data object and returns a unique identifier.

```js
import { ApolloCacheLite, getDefaultIdFromNode } from 'apollo-cache-lite';

const cache = new ApolloCacheLite({
    getIdFromObject(object) {
        switch (object.__typename) {
            case 'foo': return object.key; // use `key` as the primary key
            case 'bar': return `bar:${object.blah}`; // use `bar` prefix and `blah` as the primary key
            default: return getDefaultIdFromNode(object); // fall back to default handling
        }
    }
});
```
