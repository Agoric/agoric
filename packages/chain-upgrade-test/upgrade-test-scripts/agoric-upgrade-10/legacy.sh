#!/bin/bash
. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh

make_swing_store_snapshot() {( set -euo pipefail
  EXPORT_DIR="$1"
  shift
  /usr/src/agoric-sdk/packages/cosmic-swingset/src/export-kernel-db.js --home "$HOME/.agoric" --export-dir "$EXPORT_DIR" --verbose --include-export-data "$@"

  EXPORT_MANIFEST_FILE="$EXPORT_DIR/export-manifest.json"
  EXPORT_DATA_FILE="$EXPORT_DIR/$(cat "$EXPORT_MANIFEST_FILE" | jq -r .data)"
  EXPORT_DATA_UNTRUSTED_FILE="${EXPORT_DATA_FILE%.*}-untrusted.jsonl"
  EXPORT_HEIGHT=$(cat "$EXPORT_MANIFEST_FILE" | jq -r .blockHeight)
  EXPORT_MANIFEST="$(cat $EXPORT_MANIFEST_FILE)"

  mv "$EXPORT_DATA_FILE" "$EXPORT_DATA_UNTRUSTED_FILE"
  agd export --height $EXPORT_HEIGHT | jq -cr '.app_state.vstorage.data[] | if .path | startswith("swingStore.") then [.path[11:],.value] else empty end' > "$EXPORT_DATA_FILE"

  jq -n "$EXPORT_MANIFEST | .untrustedData=\"$(basename -- "$EXPORT_DATA_UNTRUSTED_FILE")\"" > "$EXPORT_MANIFEST_FILE"

  echo "Successful swing-store export for block $EXPORT_HEIGHT"
)}

restore_swing_store_snapshot() {( set -euo pipefail
  rm -f $HOME/.agoric/data/agoric/swingstore.sqlite

  /usr/src/agoric-sdk/packages/cosmic-swingset/src/import-kernel-db.js --home "$HOME/.agoric" --export-dir "$1" --verbose
)}

compare_swing_store_export_data() {
  EXPORT_DIR="$1"
  EXPORT_MANIFEST_FILE="$EXPORT_DIR/export-manifest.json"
  EXPORT_DATA_FILE="$(cat "$EXPORT_MANIFEST_FILE" | jq -r .data)"
  EXPORT_DATA_UNTRUSTED_FILE="$(cat "$EXPORT_MANIFEST_FILE" | jq -r .untrustedData)"

  if [ -z "$EXPORT_DATA_FILE" ]; then
    echo "missing-export-data"
    return
  fi
  
  if [ -z "$EXPORT_DATA_UNTRUSTED_FILE" ]; then
    echo "missing-untrusted-export-data"
    return
  fi
  
  diff <(cat "$EXPORT_DIR/$EXPORT_DATA_FILE" | sort) <(cat "$EXPORT_DIR/$EXPORT_DATA_UNTRUSTED_FILE" | sort) >&2 && {
    echo "match"
  } || {
    echo "mismatch"
  }
}

# replicate state-sync of node
# this will cause the swing-store to prune some data
# we will save the pruned artifact for later
killAgd
EXPORT_DIR=$(mktemp -t -d swing-store-export-upgrade-10-XXX)
make_swing_store_snapshot $EXPORT_DIR || fail "Couldn't make swing-store snapshot"
# test_val "$(compare_swing_store_export_data $EXPORT_DIR)" "match" "swing-store export data"
EXPORT_DIR_ALL_ARTIFACTS=$(mktemp -t -d swing-store-export-upgrade-10-all-artifacts-XXX)
make_swing_store_snapshot $EXPORT_DIR_ALL_ARTIFACTS --export-mode archival || fail "Couldn't make swing-store snapshot for historical artifacts"
restore_swing_store_snapshot $EXPORT_DIR || fail "Couldn't restore swing-store snapshot"
(
    cd $EXPORT_DIR_ALL_ARTIFACTS
    mkdir $HOME/.agoric/data/agoric/swing-store-historical-artifacts
    for i in *; do
        [ -f $EXPORT_DIR/$i ] && continue
        mv $i $HOME/.agoric/data/agoric/swing-store-historical-artifacts/
    done
)
rm -rf $EXPORT_DIR
rm -rf $EXPORT_DIR_ALL_ARTIFACTS

startAgd
sleep 5
killAgd

EXPORT_DIR=$(mktemp -t -d swing-store-export-upgrade-10-XXX)
make_swing_store_snapshot $EXPORT_DIR || fail "Couldn't make swing-store snapshot"
test_val "$(compare_swing_store_export_data $EXPORT_DIR)" "mismatch" "swing-store broken state-sync"
rm -rf $EXPORT_DIR
startAgd

# # TODO fully test bidding
# # TODO test liquidations
agops inter bid by-price --price 1 --give 1.0IST  --from $GOV1ADDR --keyring-backend test