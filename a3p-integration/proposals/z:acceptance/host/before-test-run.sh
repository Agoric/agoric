#! /bin/bash
# shellcheck disable=SC2155

set -o errexit -o errtrace -o pipefail -o xtrace

CONTAINER_MESSAGE_FILE_PATH="/root/message-file-path"
DIRECTORY_PATH="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
FOLLOWER_LOGS_FILE="/tmp/loadgen-follower-logs"
LOADGEN_REPOSITORY_NAME="testnet-load-generator"
LOGS_FILE="/tmp/before-test-run-hook-logs"
ORGANIZATION_NAME="agoric"
SDK_REPOSITORY_NAME="agoric-sdk"
TIMESTAMP="$(date '+%s')"

CONTAINER_IMAGE_NAME="ghcr.io/$ORGANIZATION_NAME/agoric-3-proposals"
LOADGEN_REPOSITORY_LINK="https://github.com/$ORGANIZATION_NAME/$LOADGEN_REPOSITORY_NAME.git"
NETWORK_CONFIG_FILE_PATH="/tmp/network-config-$TIMESTAMP"
OUTPUT_DIRECTORY="/tmp/loadgen-output"
SDK_REPOSITORY_LINK="https://github.com/$ORGANIZATION_NAME/$SDK_REPOSITORY_NAME.git"
TEMP="${DIRECTORY_PATH#*/proposals/}"

FOLDER_NAME="${TEMP%%/*}"

PROPOSAL_NAME="$(echo "$FOLDER_NAME" | cut --delimiter ':' --fields '2')"

FOLLOWER_CONTAINER_NAME="$PROPOSAL_NAME-follower"

run_command_inside_container() {
  local entrypoint="$1"
  shift

  docker container run \
    --entrypoint "/bin/bash" \
    --name "$FOLLOWER_CONTAINER_NAME" \
    --network "host" \
    --quiet \
    --rm \
    --user "root" \
    "$@" \
    "$CONTAINER_IMAGE_NAME:test-$PROPOSAL_NAME" \
    -c "$entrypoint"
}

start_follower() {
  wait_for_network_config
  mkdir --parents "$OUTPUT_DIRECTORY"

  local entrypoint="
                #! /bin/bash

                setup_loadgen_runner() {
                        cd \$HOME
                        git clone $LOADGEN_REPOSITORY_LINK
                        cd $LOADGEN_REPOSITORY_NAME/runner
                        yarn install
                }

                setup_sdk() {
                        cd \$HOME
                        git clone $SDK_REPOSITORY_LINK
                        cd $SDK_REPOSITORY_NAME
                        yarn install
                }

                start_loadgen_runner() {
                        cd \$HOME/$LOADGEN_REPOSITORY_NAME

                        if ! test -f \$HOME/$SDK_REPOSITORY_NAME/golang/cosmos/build/agd
                        then
                          mkdir --parents \$HOME/$SDK_REPOSITORY_NAME/golang/cosmos/build
                          ln --force --symbolic \$(which agd) \$HOME/$SDK_REPOSITORY_NAME/golang/cosmos/build/agd
                        fi

                        AG_CHAIN_COSMOS_HOME=\$HOME/.agoric \
                        SDK_BUILD=0 \
                        SDK_SRC=\$HOME/$SDK_REPOSITORY_NAME \
                        ./runner/bin/loadgen-runner \
                         --acceptance-integration-message-file \$MESSAGE_FILE_PATH \
                         --chain-only \
                         --custom-bootstrap \
                         --no-stage.save-storage \
                         --output-dir $OUTPUT_DIRECTORY \
                         --profile testnet \
                         --stages 3 \
                         --testnet-origin file://$NETWORK_CONFIG_FILE_PATH \
                         --use-state-sync

                        echo -n \"exit code \$?\" > \$MESSAGE_FILE_PATH
                }

                setup_sdk
                setup_loadgen_runner
                start_loadgen_runner
        "
  run_command_inside_container \
    "$entrypoint" \
    --env "MESSAGE_FILE_PATH=$CONTAINER_MESSAGE_FILE_PATH" \
    --mount "source=$MESSAGE_FILE_PATH,target=$CONTAINER_MESSAGE_FILE_PATH,type=bind" \
    --mount "source=$OUTPUT_DIRECTORY,target=$OUTPUT_DIRECTORY,type=bind" \
    --mount "source=$NETWORK_CONFIG_FILE_PATH,target=$NETWORK_CONFIG_FILE_PATH/network-config,type=bind" > "$FOLLOWER_LOGS_FILE" 2>&1
}

wait_for_network_config() {
  local network_config=$(node "$DIRECTORY_PATH/../wait-for-follower.mjs" "^{.*")
  echo "Got network config: $network_config"
  echo "$network_config" > "$NETWORK_CONFIG_FILE_PATH"
}

start_follower > "$LOGS_FILE" 2>&1 &
