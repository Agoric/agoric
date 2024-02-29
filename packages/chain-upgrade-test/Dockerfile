# Defaults
ARG DEST_IMAGE=ghcr.io/agoric/agoric-sdk:dev
ARG BOOTSTRAP_MODE=main

# TODO different naming scheme for upgrade handler (in app.go) and the image name

# Be mindful of best practices
# https://docs.docker.com/develop/dev-best-practices/
# https://docs.docker.com/develop/develop-images/dockerfile_best-practices/


###
# This file uses [multi-stage builds](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#use-multi-stage-builds).

# Kinds of stages:
# START             ag0, start of the chain
# UPGRADE+TEST      legacy layer type in which the chain upgrade and its tests are comingled
# UPGRADE           layer that only runs the upgrade handler
# TEST              layer that only tests a previous upgrade
# DEST              the final layer this build is producing, opening an interactive shell

## START
# on agoric-uprade-7-2, with upgrade to agoric-upgrade-8
FROM ghcr.io/agoric/ag0:agoric-upgrade-7-2 as agoric-upgrade-7-2
ARG BOOTSTRAP_MODE
ARG UPGRADE_INFO_8
ENV UPGRADE_TO=agoric-upgrade-8 UPGRADE_INFO=${UPGRADE_INFO_8} THIS_NAME=agoric-upgrade-7-2 BOOTSTRAP_MODE=${BOOTSTRAP_MODE}
RUN echo "${BOOTSTRAP_MODE}"
RUN mkdir -p /usr/src/agoric-sdk/upgrade-test-scripts
WORKDIR /usr/src/agoric-sdk/
COPY ./start_ag0.sh ./upgrade-test-scripts/
COPY ./bash_entrypoint.sh ./env_setup.sh ./start_to_to.sh ./upgrade-test-scripts/
SHELL ["/bin/bash", "-c"]
# this is the only layer that starts ag0
RUN . ./upgrade-test-scripts/start_ag0.sh

## UPGRADE+TEST
## this is agoric-upgrade-8 aka pismoA
FROM ghcr.io/agoric/agoric-sdk:29 as agoric-upgrade-8
ARG BOOTSTRAP_MODE
ENV THIS_NAME=agoric-upgrade-8 BOOTSTRAP_MODE=${BOOTSTRAP_MODE}
# copy from previous build
COPY --from=agoric-upgrade-7-2 /root/.agoric /root/.agoric

# boilerplate to copy scripts for this upgrade
WORKDIR /usr/src/agoric-sdk/
COPY ./bash_entrypoint.sh ./env_setup.sh ./start_to_to.sh ./upgrade-test-scripts/
COPY ./${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh

## UPGRADE+TEST
ARG DEST_IMAGE
#this is agoric-upgrade-8-1 aka pismoB
FROM ghcr.io/agoric/agoric-sdk:30 as agoric-upgrade-8-1
ARG BOOTSTRAP_MODE UPGRADE_INFO_9
ENV THIS_NAME=agoric-upgrade-8-1 UPGRADE_TO=agoric-upgrade-9 UPGRADE_INFO=${UPGRADE_INFO_9} BOOTSTRAP_MODE=${BOOTSTRAP_MODE}
WORKDIR /usr/src/agoric-sdk/
COPY ./bash_entrypoint.sh ./env_setup.sh ./start_to_to.sh ./upgrade-test-scripts/
COPY ./${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
COPY --from=agoric-upgrade-8 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh

# UPGRADE+TEST
ARG DEST_IMAGE
# this is agoric-upgrade-9 / pismoC with upgrade to agoric-upgrade-10
FROM ghcr.io/agoric/agoric-sdk:31 as agoric-upgrade-9
ARG BOOTSTRAP_MODE UPGRADE_INFO_10
ENV THIS_NAME=agoric-upgrade-9 UPGRADE_TO=agoric-upgrade-10 UPGRADE_INFO=${UPGRADE_INFO_10} BOOTSTRAP_MODE=${BOOTSTRAP_MODE}

WORKDIR /usr/src/agoric-sdk/
COPY ./bash_entrypoint.sh ./env_setup.sh ./start_to_to.sh ./upgrade-test-scripts/
COPY ./${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
COPY --from=agoric-upgrade-8-1 /root/.agoric /root/.agoric
WORKDIR /usr/src/agoric-sdk/
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh

# UPGRADE+TEST
ARG DEST_IMAGE
#this is agoric-upgrade-10 / vaults
FROM ghcr.io/agoric/agoric-sdk:35 as agoric-upgrade-10
ARG BOOTSTRAP_MODE
ENV THIS_NAME=agoric-upgrade-10 USE_JS=1 BOOTSTRAP_MODE=${BOOTSTRAP_MODE}

WORKDIR /usr/src/agoric-sdk/
COPY ./package.json ./yarn.lock ./upgrade-test-scripts/
RUN cd upgrade-test-scripts && yarn install
COPY ./bash_entrypoint.sh ./env_setup.sh ./start_to_to.sh ./*.js ./upgrade-test-scripts/
RUN echo '. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh' >> ~/.bashrc

COPY ./${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
COPY --from=agoric-upgrade-9 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh

# UPGRADE
ARG DEST_IMAGE
#this is agoric-upgrade-10 upgrading to 11
#it's a separate target because agoric-upgrade-10 takes so long to test
FROM ghcr.io/agoric/agoric-sdk:35 as propose-agoric-upgrade-11
ARG BOOTSTRAP_MODE UPGRADE_INFO_11
ENV THIS_NAME=propose-agoric-upgrade-11 UPGRADE_TO=agoric-upgrade-11 UPGRADE_INFO=${UPGRADE_INFO_11} BOOTSTRAP_MODE=${BOOTSTRAP_MODE}
WORKDIR /usr/src/agoric-sdk/
COPY ./package.json ./yarn.lock ./upgrade-test-scripts/
RUN cd upgrade-test-scripts && yarn install
COPY ./bash_entrypoint.sh ./env_setup.sh ./start_to_to.sh ./*.js ./upgrade-test-scripts/
RUN echo '. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh' >> ~/.bashrc

COPY ./${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
COPY --from=agoric-upgrade-10 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh

# TEST
#this is agoric-upgrade-11 / vaults+1
ARG DEST_IMAGE
FROM ghcr.io/agoric/agoric-sdk:36 as agoric-upgrade-11
ARG BOOTSTRAP_MODE
ENV THIS_NAME=agoric-upgrade-11 BOOTSTRAP_MODE=${BOOTSTRAP_MODE} USE_JS=1
# start-chain boilerplate
WORKDIR /usr/src/agoric-sdk/
COPY ./package.json ./yarn.lock ./upgrade-test-scripts/
RUN cd upgrade-test-scripts && yarn install
COPY ./bash_entrypoint.sh ./env_setup.sh ./start_to_to.sh ./*.js ./upgrade-test-scripts/
RUN echo '. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh' >> ~/.bashrc

COPY ./${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
COPY --from=propose-agoric-upgrade-11 /root/.agoric /root/.agoric
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh

# UPGRADE
ARG DEST_IMAGE
FROM ghcr.io/agoric/agoric-sdk:36 as propose-agoric-upgrade-12
# TODO: Replace with actual Zoe core proposal for upgrade 12 (MCS, Kread, Zoe, restart-contracts, etc)
ARG BOOTSTRAP_MODE UPGRADE_INFO_12='{"coreProposals":["@agoric/builders/scripts/vats/init-network.js"]}'
ENV THIS_NAME=propose-agoric-upgrade-12 UPGRADE_TO=agoric-upgrade-12 UPGRADE_INFO=${UPGRADE_INFO_12} BOOTSTRAP_MODE=${BOOTSTRAP_MODE}
COPY --from=agoric-upgrade-11 /root/.agoric /root/.agoric
# start-chain boilerplate
WORKDIR /usr/src/agoric-sdk/
COPY ./bash_entrypoint.sh ./env_setup.sh ./start_to_to.sh ./upgrade-test-scripts/
RUN cd upgrade-test-scripts && yarn install
RUN echo '. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh' >> ~/.bashrc

COPY ./${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
RUN chmod +x ./upgrade-test-scripts/*.sh
SHELL ["/bin/bash", "-c"]
RUN . ./upgrade-test-scripts/start_to_to.sh

# DEST (TEST)
#this is agoric-upgrade-12 / multi-collateral, etc.
ARG DEST_IMAGE
FROM ${DEST_IMAGE} as agoric-upgrade-12
ARG BOOTSTRAP_MODE
ENV THIS_NAME=agoric-upgrade-12 BOOTSTRAP_MODE=${BOOTSTRAP_MODE}
COPY --from=propose-agoric-upgrade-12 /root/.agoric /root/.agoric
# start-chain boilerplate
WORKDIR /usr/src/agoric-sdk/
COPY ./package.json ./yarn.lock ./upgrade-test-scripts/
RUN cd upgrade-test-scripts && yarn install
COPY ./bash_entrypoint.sh ./env_setup.sh ./start_to_to.sh ./*.js ./upgrade-test-scripts/
RUN echo '. /usr/src/agoric-sdk/upgrade-test-scripts/env_setup.sh' >> ~/.bashrc

COPY ./${THIS_NAME} ./upgrade-test-scripts/${THIS_NAME}/
RUN apt install -y tmux
SHELL ["/bin/bash", "-c"]
RUN chmod +x ./upgrade-test-scripts/*.sh
# enter image in interactive shell
ENTRYPOINT /usr/src/agoric-sdk/upgrade-test-scripts/start_to_to.sh
