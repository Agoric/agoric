#!/bin/bash

set -e

# ugly way to get SDK path regardless of cwd
AG_SDK=$(readlink -f "$(dirname -- "$(readlink -f -- "$0")")/../..")

# go ensure fresh build
cd "$AG_SDK"/golang/cosmos
SKIP_MOD_VERIFY=1 make go.sum
COSMOS_SDK=$(go list -m -f '{{ .Dir }}' github.com/cosmos/cosmos-sdk)
IBC_GO=$(go list -m -f '{{ .Dir }}' github.com/cosmos/ibc-go/v8)
cd -

# update proto files in this package
cp -rf "$COSMOS_SDK"/proto/cosmos proto
cp -rf "$AG_SDK"/golang/cosmos/third_party/proto .
cp -rf "$AG_SDK"/golang/cosmos/proto/agoric proto
cp -rf "$IBC_GO"/proto/ibc proto

# clean up what we don't need
chmod -R u+w proto
rm -rf proto/cosmos/app
rm -rf proto/cosmos/orm
