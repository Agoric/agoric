# Agoric SDK Environment Variables

```js
process.env.DOCUMENTATION; // for power users
```

This file describes environment variables that influence the execution of the
Agoric SDK.

<!--
## Template

**Add to a new section in alphabetical order.**

Affects:

Purpose:

Description:

Lifetime:

-->

## CHAIN_BOOTSTRAP_VAT_CONFIG

Affects: `ag-chain-cosmos`, `ag-solo`

Purpose: to set the specifier for the chain/sim-chain's `vatconfig.json`

Description: defaults to `@agoric/vats/decentral-core-config.json`

Lifetime: until we don't want to allow user control of the chain's vat config

## CXXFLAGS

Affects: yarn, agoric install

Purpose: add compilation flags to Node.js C++ addons

Description: defaults to `-std=c++14` if not set (empty string doesn't default)

Lifetime: probably forever (until all supported Node versions work with
`CXXFLAGS=''`)

## DEBUG

Affects: agoric (CLI), ag-chain-cosmos, ag-solo

Purpose: to change the meaning of `console.log` and other console methods

Description: uses `anylogger` to change whether the following methods (in order
of increasing severity) are active for a given context:

1. `console.debug`
2. `console.log`
3. `console.info`
4. `console.warn`
5. `console.error`

If not set, then default (`console.info` and above) logging is enabled.
(`console.log` and `console.debug` logging is disabled.)

If set to an empty string, or running in `ag-chain-cosmos start` mode, don't
print any logs. This is part of "consensus mode."

If set to a value that contains the substring `agoric`, then print all console
messages for the entire SDK.

Otherwise, set to a comma-separated list of prefixes, where each prefix is the
context given to `makeConsole`. For example:

- `DEBUG=SwingSet:ls` enable all console messages for liveslots, regardless of vat.
- `DEBUG=SwingSet:ls:v13` enable for liveslots in vat 13.
- `DEBUG=SwingSet:vat` enable for user code, regardless of vat.
- `DEBUG=SwingSet:vat,SwingSet:ls` enable for liveslots and user code, all vats

## END_BLOCK_SPIN_MS

Affects: cosmic-swingset

Purpose: simulating load to explore scalability of the Cosmos SDK.

Description: Number of milliseconds to busy-wait during every block's
end-of-block processing for `ag-chain-cosmos` and the sim-chain.

Lifetime: until we have a more consistent load testing regimen

## FAKE_CURRENCIES

Affects: cosmic-swingset

Purpose: allow the creation of pretend tokens

Description: When nonempty, create pretend prepopulated tokens like "moola" and
"simoleans".

Lifetime: until chain is mature enough not to need any pretend tokens

## LMDB_MAP_SIZE

Affects: cosmic-swingset

Purpose: set the minimum size limit for swing-store's LMDB key-value store

Description: default is `2147483648` (2GB), and you need to set higher if you
receive `Error: MDB_MAP_FULL: Environment mapsize limit reached`

Can always be increased, and does not decrease once a transaction has been
written with the new mapSize.

Lifetime: until we no longer use LMDB in swing-store

## OTEL_EXPORTER_PROMETHEUS_PORT

Affects: cosmic-swingset

Purpose: enabling Prometheus metrics exports

Description: When either is set, these are the host IP and port number to use
for the Prometheus scrape endpoint to export telemetry.

Lifetime: until we decide not to support Prometheus for metrics export

## SOLO_BRIDGE_TARGET

Affects: solo

This enables a proxy so that the solo bridge interface (/wallet-bridge.html) is backed by the smart wallet (/wallet/bridge.html). Dapps designed for the solo bridge can enable this until they connect to the smart wallet directly.

```
BRIDGE_TARGET=http://localhost:3001 make BASE_PORT=8002 scenario3-run
```

Lifetime: smart wallet transition period

## SOLO_LMDB_MAP_SIZE

Affects: solo

Same as `LMDB_MAP_SIZE`, but for solo instead of chain.

## SOLO_MNEMONIC

Affects: solo init

Seed phrase for HD key derivation.

## SOLO_OTEL_EXPORTER_PROMETHEUS_PORT

Affects: solo

Same as `OTEL_EXPORTER_PROMETHEUS_PORT`, but for solo instead of chain.

Lifetime: ?

## SOLO_SLOGFILE

Same as `SLOGFILE`, but for solo instead of chain.

Lifetime: ?

## SOLO_SLOGSENDER

Same as `SLOGSENDER`, but for solo instead of chain.

Lifetime: ?

## SOLO_MAX_DEBUG_LENGTH

Affects: solo

Purpose: reduce the size of each individual `console.debug` output

Description: defaults to no limit, set to a decimal byte count to reduce the
output

Lifetime: Until CI no longer balks on long output, or our source bundles aren't delivered via messages to the sim-chain

## SLOGFILE

Affects: cosmic-swingset

Purpose: record an on-chain Swingset LOG file

Description: when nonempty, use the value as an absolute path to which SwingSet
debug logs should be written.

Lifetime: ?

## SLOGSENDER

Affects: cosmic-swingset

Purpose: intercept the SwingSet LOG file in realtime

Description: when nonempty, use the value as a list of module specifiers
separated by commas `,`. The modules will be loaded by
`@agoric/telemetry/src/make-slog-sender.js`, via `import(moduleSpec)`, and
their exported `makeSlogSender` function called to create an aggregate
`slogSender`. Every time a SLOG object is written by SwingSet, each module's
`slogSender(slogObject)` will be called.

The default is `'@agoric/telemetry/src/flight-recorder.js'`, which writes to an
mmap'ed circular buffer.

## SLOGSENDER_AGENT

Affects: cosmic-swingset

Purpose: selects the agent type used to handle the SwingSet LOG

Description: if empty or `'self'` slog senders are loaded in the same process
and thread as the SwingSet kernel. If `'process'`, slog senders are loaded in a
sub-process which receives all SLOG events over an IPC connection.

The default is `'self'`.

## SWINGSET_WORKER_TYPE

Affects: solo

Purpose: select the default Worker type (default `xs-worker`)

Description: default `xs-worker`, but you can use `local` to run vats within the
same Node.js process (to facilitate debugging).
