#!/bin/bash
set +x 
. ./upgrade-test-scripts/env_setup.sh
# apply patch
sed -i "s/--econCommAcceptOfferId /--previousOfferId /g" "./packages/agoric-cli/src/commands/psm.js"

waitForBlock 3
# fund provision pool
stakeamount="20000000${USDC_DENOM}"
agd tx bank send "validator" "agoric1megzytg65cyrgzs6fvzxgrcqvwwl7ugpt62346" "$stakeamount" -y --keyring-backend=test --chain-id="$CHAINID"
waitForBlock 3


govaccounts=( "$GOV1ADDR" "$GOV2ADDR" "$GOV3ADDR" )
govamount="200000000ubld,100000000${USDC_DENOM},100000000${ATOM_DENOM}"

for i in "${govaccounts[@]}"
do
  provisionSmartWallet "$i" "$govamount"
done

provisionSmartWallet "$USER1ADDR" "20000000ubld"

waitForBlock 5
# Accept invitation to economic committee
for i in "${govaccounts[@]}"; do
  COMMITTEE_OFFER=$(mktemp -t agopscommittee.XXX)
  agops psm committee >|"$COMMITTEE_OFFER"
  if [[ "$i" == "$GOV2ADDR" ]]; then
    sed -i "s/Voter0/Voter1/g" "$COMMITTEE_OFFER"
  fi
  if [[ "$i" == "$GOV3ADDR" ]]; then
    sed -i "s/Voter0/Voter2/g" "$COMMITTEE_OFFER"
  fi
  jq ".body | fromjson" <"$COMMITTEE_OFFER"
  agops perf satisfaction --from $i --executeOffer $COMMITTEE_OFFER --keyring-backend=test
  # verify the offerId is readable from chain history
  agoric wallet show --from $i
  COMMITTEE_OFFER_ID=$(jq ".body | fromjson | .offer.id" <"$COMMITTEE_OFFER")

  echo "${i}_COMMITTEE_OFFER_ID=$COMMITTEE_OFFER_ID" >> "$HOME/.agoric/envs"
  waitForBlock 2

# Accept invitation to be a charter member
  CHARTER_OFFER=$(mktemp -t agopscharter.XXX)
  agops psm charter >|"$CHARTER_OFFER"
  jq ".body | fromjson" <"$CHARTER_OFFER"
  agops perf satisfaction --from $i --executeOffer $CHARTER_OFFER --keyring-backend=test

  # verify the offerId is readable from chain history
  agoric wallet show --from $i
  CHARTER_OFFER_ID=$(jq ".body | fromjson | .offer.id" <"$CHARTER_OFFER")
  echo "${i}_CHARTER_OFFER_ID=$CHARTER_OFFER_ID" >> "$HOME/.agoric/envs"
done

source "$HOME/.agoric/envs"
waitForBlock 2


# Propose a vote to raise the mint limit
PROPOSAL_OFFER=$(mktemp -t agops.XXX)
oid="${GOV1ADDR}_CHARTER_OFFER_ID"
agops psm proposeChangeMintLimit --pair ${PSM_PAIR} --limit 133337 --previousOfferId "${!oid}" >|"$PROPOSAL_OFFER"
jq ".body | fromjson" <"$PROPOSAL_OFFER"
agops perf satisfaction --from $GOV1ADDR --executeOffer $PROPOSAL_OFFER --keyring-backend=test

for i in "${govaccounts[@]}"; do
  # vote on the question that was made
  VOTE_OFFER=$(mktemp -t agops.XXX)
  oid="${i}_COMMITTEE_OFFER_ID"
  echo "$i using ${!oid}"
  agops psm vote --pair ${PSM_PAIR} --forPosition 0 --previousOfferId "${!oid}" >|"$VOTE_OFFER"
  jq ".body | fromjson" <"$VOTE_OFFER"

  agops perf satisfaction --from $i --executeOffer $VOTE_OFFER --keyring-backend=test
done

## wait for the election to be resolved (1m default in commands/psm.js)
echo "waiting 1 minute for election to be resolved"
sleep 65

agops psm info --pair ${PSM_PAIR}

# test mint limit was adjusted
toyUSDGovernance="$(timeout 2 agoric follow -l :published.psm.${PSM_PAIR}.governance -o jsonlines)"
test_val "$(echo "$toyUSDGovernance" | jq -r '.current.MintLimit.value.value')" "133337000000" "PSM MintLimit set correctly"


test_val "$(agd q bank balances "$GOV1ADDR" --output=json --denom uist | jq -r .amount)" "250000" "pre-swap: validate IST"
test_val "$(agd q bank balances "$GOV1ADDR" --output=json --denom ubld | jq -r .amount)" "190000000" "pre-swap: validate BLD balance"
test_val "$(agd q bank balances "$GOV1ADDR" --output=json --denom ${USDC_DENOM} | jq -r .amount)" "100000000" "pre-swap: validate USDC balance"

SWAP_OFFER=$(mktemp -t agops.XXX)
agops psm swap --pair ${PSM_PAIR}  --wantMinted 10.00 --feePct 0.10 >|"$SWAP_OFFER"
agops perf satisfaction --from $GOV1ADDR --executeOffer "$SWAP_OFFER" --keyring-backend=test

test_val "$(agd q bank balances "$GOV1ADDR" --output=json --denom uist | jq -r .amount)" "10260011" "post-swap: validate IST"
test_val "$(agd q bank balances "$GOV1ADDR" --output=json --denom ubld | jq -r .amount)" "190000000" "post-swap: validate BLD balance"
test_val "$(agd q bank balances "$GOV1ADDR" --output=json --denom ${USDC_DENOM} | jq -r .amount)" "89989989" "post-swap: validate USDC balance"

waitForBlock 3

# dump provision pool metrics
echo "Dumping provision pool metrics..."
timeout 2 agoric follow -l :published.provisionPool.metrics -o jsonlines | tee /root/.agoric/provision_pool_metrics.json
test_not_val "$(cat /root/.agoric/provision_pool_metrics.json | wc -l)" "0" "provision pool metrics shouldnt be empty"
