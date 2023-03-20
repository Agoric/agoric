#!/bin/sh

if [ -z "$AGORIC_NET" ]; then
    echo "AGORIC_NET env not set"
    echo
    echo "e.g. AGORIC_NET=ollinet (or export to save typing it each time)"
    echo
    echo "To test locally, AGORIC_NET=local and have the following running:
# freshen sdk
yarn install && yarn build

# local chain running with wallet provisioned
packages/inter-protocol/scripts/start-local-chain.sh
"
    exit 1
fi

set -x

# open a vault
OFFER=$(mktemp -t agops.XXX)
bin/agops vaults open --wantMinted 50.00 --giveCollateral 90.0 >|"$OFFER"
jq ".body | fromjson" <"$OFFER"
agoric wallet send --offer "$OFFER" --from gov1 --keyring-backend="test"

# list my vaults
bin/agops vaults list --from gov1 --keyring-backend="test"

# adjust
OFFER=$(mktemp -t agops.XXX)
bin/agops vaults adjust --vaultId vault1 --wantCollateral 1.0 --from gov1 --keyring-backend="test" >|"$OFFER"
jq ".body | fromjson" <"$OFFER"
agoric wallet send --from gov1 --keyring-backend="test" --offer "$OFFER"

# close a vault
OFFER=$(mktemp -t agops.XXX)
# 5.05 for 5.00 debt plus 1% fee
bin/agops vaults close --vaultId vault1 --giveMinted 5.05 --from gov1 --keyring-backend="test" >|"$OFFER"
jq ".body | fromjson" <"$OFFER"
agoric wallet send --from gov1 --keyring-backend="test" --offer "$OFFER"
