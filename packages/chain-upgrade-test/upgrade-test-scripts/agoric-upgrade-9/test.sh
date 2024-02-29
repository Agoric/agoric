#!/bin/bash
. ./upgrade-test-scripts/env_setup.sh
# provision pool has right balance 
test_val $(agd query bank balances agoric1megzytg65cyrgzs6fvzxgrcqvwwl7ugpt62346 -o json | jq -r '.balances | first | .amount') "19000000"

# ensure PSM IST has only ToyUSD
expnum=4
if [[ "$BOOTSTRAP_MODE" == "test" ]]; then
    expnum=1
fi
test_val $(agd q vstorage children published.psm.IST -o json | jq -r '.children | length') "$expnum"
test_val $(agd q vstorage children published.psm.IST -o json | jq -r '.children | first') ${PSM_PAIR//IST./}

# Gov params
test_not_val "$(timeout 3 agoric follow -l :published.psm.${PSM_PAIR}.governance -o jsonlines | jq -r '.current.MintLimit.value.value')" "0" "PSM MintLimit non-zero"

test_wallet_state "$USER1ADDR" old "user1 wallet is old"
test_wallet_state "$GOV1ADDR" old "gov1 wallet is old"
test_wallet_state "$GOV2ADDR" old "gov2 wallet is old"
test_wallet_state "$GOV3ADDR" old "gov3 wallet is old"
