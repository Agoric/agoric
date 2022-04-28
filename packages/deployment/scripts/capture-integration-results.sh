#! /bin/bash
set -ueo pipefail

real0=$(readlink "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")
thisdir=$(cd "$(dirname -- "$real0")" > /dev/null && pwd -P)

export NETWORK_NAME=${NETWORK_NAME-localtest}
export AG_SETUP_COSMOS_HOME=${AG_SETUP_COSMOS_HOME-"$PWD/$NETWORK_NAME/setup"}

RESULTSDIR=${RESULTSDIR-"$NETWORK_NAME/results"}
mkdir -p "$RESULTSDIR"

for node in validator{0,1}; do
  home=/home/ag-chain-cosmos/.ag-chain-cosmos
  "$thisdir/setup.sh" ssh "$node" cat "$home/config/genesis.json" > "$RESULTSDIR/$node-genesis.json" || true
  "$thisdir/setup.sh" ssh "$node" cat "$home/data/chain.slog" > "$RESULTSDIR/$node.slog" || true
  "$thisdir/setup.sh" ssh "$node" cat "$home/data/ag-cosmos-chain-state/flight-recorder.bin" > "$RESULTSDIR/$node-flight-recorder.bin" || true
  "$thisdir/setup.sh" ssh "$node" cat "$home/data/swingstore-trace" > "$RESULTSDIR/$node-swingstore-trace" || true
  "$thisdir/setup.sh" ssh "$node" cat "$home/data/kvstore-trace" > "$RESULTSDIR/$node-kvstore-trace" || true
  mkdir -p "$RESULTSDIR/$node-xsnap-trace" && "$thisdir/setup.sh" ssh "$node" tar -c -C "$home/data/xsnap-trace" . | tar -x -C "$RESULTSDIR/$node-xsnap-trace" || true
  mkdir -p "$RESULTSDIR/$node-xs-snapshots" && "$thisdir/setup.sh" ssh "$node" tar -c -C "$home/data/ag-cosmos-chain-state/xs-snapshots" . | tar -x -C "$RESULTSDIR/$node-xs-snapshots" || true
done
