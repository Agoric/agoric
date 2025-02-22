# Store Stats

## Build / Install

```
yarn install
```

# Usage

Gets stats from default sqlite database file and send them to datadog.
```
node src/index.js
```

Get stats from custom sqlite database file.

```
node src/index.js  ~/_agstate/agoric-servers/dev/fake-chain/swingstore.sqlite
```

# Test
```
yarn test tests/test-index.js
```
