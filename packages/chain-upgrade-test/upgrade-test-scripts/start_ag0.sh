#!/bin/bash

export CHAINID=agoriclocal
ag0 init localnet --chain-id "$CHAINID"

allaccounts=( "gov1" "gov2" "gov3" "user1" "validator" )
for i in "${allaccounts[@]}"
do
  ag0 keys add $i --keyring-backend=test  2>&1 | tee "$HOME/.agoric/$i.out"
  cat "$HOME/.agoric/$i.out" | tail -n1 | tee "$HOME/.agoric/$i.key"
done

. ./upgrade-test-scripts/env_setup.sh


sed -i.bak "s/^timeout_commit =.*/timeout_commit = \"1s\"/" "$HOME/.agoric/config/config.toml"
sed -i.bak "s/^enabled-unsafe-cors =.*/enabled-unsafe-cors = true/" "$HOME/.agoric/config/app.toml"
sed -i.bak "s/^enable-unsafe-cors =.*/enable-unsafe-cors = true/" "$HOME/.agoric/config/app.toml"
sed -i.bak "s/127.0.0.1:26657/0.0.0.0:26657/" "$HOME/.agoric/config/config.toml"
sed -i.bak "s/cors_allowed_origins = \[\]/cors_allowed_origins = \[\"*\"\]/" "$HOME/.agoric/config/config.toml"
sed -i.bak '/^\[api]/,/^\[/{s/^enable[[:space:]]*=.*/enable = true/}' "$HOME/.agoric/config/app.toml"


contents="$(jq ".app_state.crisis.constant_fee.denom = \"ubld\"" "$HOME/.agoric/config/genesis.json")" && echo -E "${contents}" > "$HOME/.agoric/config/genesis.json"
contents="$(jq ".app_state.mint.params.mint_denom = \"ubld\"" "$HOME/.agoric/config/genesis.json")" && echo -E "${contents}" > "$HOME/.agoric/config/genesis.json"
contents="$(jq ".app_state.gov.deposit_params.min_deposit[0].denom = \"ubld\"" "$HOME/.agoric/config/genesis.json")" && echo -E "${contents}" > "$HOME/.agoric/config/genesis.json"
contents="$(jq ".app_state.staking.params.bond_denom = \"ubld\"" "$HOME/.agoric/config/genesis.json")" && echo -E "${contents}" > "$HOME/.agoric/config/genesis.json"
contents="$(jq ".app_state.slashing.params.signed_blocks_window = \"20000\"" "$HOME/.agoric/config/genesis.json")" && echo -E "${contents}" > "$HOME/.agoric/config/genesis.json"
contents=$(jq '. * { app_state: { gov: { voting_params: { voting_period: "10s" } } } }' "$HOME/.agoric/config/genesis.json") && echo -E "${contents}" > "$HOME/.agoric/config/genesis.json"
export GENACCT=$(ag0 keys show validator -a --keyring-backend="test")
echo "Genesis Account $GENACCT"

denoms=(
"ibc/toyusdc" #test_usdc
"ibc/06362C6F7F4FB702B94C13CD2E7C03DEC357683FD978936340B43FBFBC5351EB" #test_atom
"ibc/BA313C4A19DFBF943586C0387E6B11286F9E416B4DD27574E6909CABE0E342FA" #main_ATOM
"ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F" #main_usdc_axl
"ibc/6831292903487E58BF9A195FDDC8A2E626B3DF39B88F4E7F41C935CADBAF54AC" #main_usdc_grav
"ibc/F2331645B9683116188EF36FC04A809C28BD36B54555E8705A37146D0182F045" #main_usdt_axl
"ibc/386D09AE31DA7C0C93091BB45D08CB7A0730B1F697CD813F06A5446DCF02EEB2" #main_usdt_grv
"ibc/3914BDEF46F429A26917E4D8D434620EC4817DC6B6E68FB327E190902F1E9242" #main_dai_axl
"ibc/3D5291C23D776C3AA7A7ABB34C7B023193ECD2BC42EA19D3165B2CF9652117E7" #main_dai_grv
"provisionpass" #for swingset provisioning
)

camount="1000000000000000000"
coins="${camount}ubld"
for i in "${denoms[@]}"; do
  coins="${coins},${camount}${i}"
done

ag0 add-genesis-account "$GENACCT" "$coins"

ag0 gentx validator 5000000000ubld --keyring-backend="test" --chain-id "$CHAINID" 
ag0 collect-gentxs
ag0 start --log_level warn &
ag0_PID=$!
wait_for_bootstrap
waitForBlock 2

voting_period_s=10
latest_height=$(ag0 status | jq -r .SyncInfo.latest_block_height)
height=$(( $latest_height + $voting_period_s + 10 ))
if [[ "$BOOTSTRAP_MODE" == "test" ]]; then
  UPGRADE_TO=${UPGRADE_TO//agoric-/agorictest-}
fi

info=${UPGRADE_INFO-"{}"}
if echo "$info" | jq .; then :
else
  status=$?
  echo "Upgrade info is not valid JSON: $info"
  exit $status
fi
ag0 tx gov submit-proposal software-upgrade "$UPGRADE_TO" \
  --upgrade-height="$height" --upgrade-info="$info" \
  --title="Upgrade to ${UPGRADE_TO}" --description="upgrades" \
  --from=validator --chain-id="$CHAINID" \
  --yes --keyring-backend=test
waitForBlock

voteLatestProposalAndWait

echo "Chain in to be upgraded state for $UPGRADE_TO"

while true; do
  latest_height=$(ag0 status | jq -r .SyncInfo.latest_block_height)
  if [ "$latest_height" != "$height" ]; then
    echo "Waiting for upgrade to happen (need $height, have $latest_height)"
    sleep 1
  else
    echo "Upgrade height for $UPGRADE_TO reached. Killing ag0"
    break
  fi
done

kill $ag0_PID
echo "state directory $HOME/.agoric ready for upgrade to $UPGRADE_TO"
