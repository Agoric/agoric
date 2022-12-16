# Transcript Replay Tools

SwingSet vats are carefully designed to behave deterministically: all syscalls they make are a deterministic function of three things:

- the initial code bundle
- the series of deliveries that begin each crank (messages or Promise resolution notifications)
- the return values of data-bearing syscalls like `vatstoreGet` and `invoke`

As a result, we can replay a transcript of the vat's actions, and we should get back the original vat state and behavior. We generally perform this replay each time a SwingSet host application starts up, to bring all vats back up to their previous state (so they can accept new deliveries). To support this, the "KernelDB" includes a copy of each vat's transcript.

The transcript can also be extracted from the "slogfile", if one was recorded starting from the beginning of the application. Slogfiles recorded from a SwingSet restart do not include the syscall results, so they are insufficient to produce a transcript.

The `bin/` directory contains tools to extract a transcript from either a KernelDB or a slogfile, and write it to a new file (ending in `.sst` or `.sst.gz`). Another tool is provided to create a new vat worker and have it replay the transcript.

By modifying the replay tool, you can control how the replay is performed:

- pause the replay at a certain transcript entry, e.g. to attach a debugger or set a breakpoint
- run the vat under a different worker than the original, e.g. under Node.js instead of XS
- modify the transcript and see how it affects the resulting vat behavior

## Example

Suppose you have an agoric chain node (validator or non-voting fullnode) that keeps its state in `~/.ag-chain-cosmos/`. After stopping the node (so the database is not being modified during read), the following invocation will extract a list of vatIDs to choose from:

```
$ node extract-transcript-from-kerneldb.js ~/.ag-chain-cosmos/data/ag-cosmos-chain-state

all vats:
v1 : bank       (26464 deliveries)
v2 : board       (13615 deliveries)
v3 : distributeFees       (1067 deliveries)
v4 : ibc       (1052 deliveries)
v5 : mints       (26425 deliveries)
v6 : network       (1058 deliveries)
v7 : priceAuthority       (6840 deliveries)
v8 : provisioning       (708 deliveries)
v9 : registrar       (1 deliveries)
v10 : sharing       (1 deliveries)
v11 : zoe       (29905 deliveries)
v12 : bootstrap       (10572 deliveries)
v13 : vatAdmin       (25 deliveries)
v14 : comms       (136586 deliveries)
v15 : vattp       (164811 deliveries)
v16 : timer       (56184 deliveries)
v17 : (dynamic) {"managerType":"xs-worker"}    (6243 deliveries)
v18 : (dynamic) {"managerType":"xs-worker"}    (1 deliveries)
v19 : (dynamic) {"managerType":"xs-worker"}    (8617 deliveries)
v20 : (dynamic) {"managerType":"xs-worker"}    (1 deliveries)
v21 : (dynamic) {"managerType":"xs-worker"}    (1 deliveries)
v22 : (dynamic) {"managerType":"xs-worker"}    (1 deliveries)
v23 : (dynamic) {"managerType":"xs-worker"}    (1 deliveries)
v24 : (dynamic) {"managerType":"xs-worker"}    (1 deliveries)
```

To replay the "zoe" vat, first extract the transcript:

```
$ node extract-transcript-from-kerneldb.js ~/.ag-chain-cosmos/data/ag-cosmos-chain-state zoe

extracting transcript for vat v11 into transcript-v11.sst
29905 transcript entries

$ ls -l transcript-v11.sst
-rw-r--r-- 1 warner warner 36705889 May 17 20:06 transcript-v11.sst
```

You can look at the last line of the transcript to see how many deliveries it includes, which can help you estimate how far along the replay is going later:

```
$ tail -1 transcript-v11.sst

{"transcriptNum":29905,"d":["message","o+12",{"method":"getDisplayInfo","args":{"body":"[]","slots":[]},"result":"p-28997"}],"syscalls":[{"d":["resolve",[["p-28997",false,{"body":"{\"decimalPlaces\":6}","slots":[]}]]],"response":null}]}
```

This transcript has 29905 deliveries. Note that you can compress the transcript (`gzip transcript-v11.sst`), to save space, and the replay tool will decompress it as it runs. The tool accepts both `.sst` and `.sst.gz` files.

```
$ gzip transcript-v11.sst
$ ls
-rw-r--r-- 1 warner warner  2436123 May 17 19:24 transcript-v11.sst.gz
$ node -r esm replay-transcript.js transcript-v11.sst.gz
```

Then, to perform the replay, use the `replay-transcript` tool:

```
$ node -r esm replay-transcript.js transcript-v11.sst.gz
using transcript transcript-v11.sst.gz
manager created
delivery 3: ["message","o+0",{"method":"buildZoe","args":{"body":"[{\"@qclass\":\"slot\",\"iface\":\"Alleged: vatAdminService\",\"index\":0}]","slots":["o-50"]},"result":"p-60"}]
delivery 4: ["message","o+2",{"method":"install","args":{"body":"[{\"moduleFormat\":\"nestedEvaluate\",\"source\":\"function getExportWithNestedEvaluate(filePrefix) {\\n  'use strict';\\n  // Serialised sou
...
```

Zoe receives several messages, early in the transcript, which include large contract source bundles. These take more time to process, so don't be surprised if the first few messages are processed slowly (200-400ms each). Normal deliveries run much faster.

The replay tool shows a truncated copy of each serialized delivery as it runs.
