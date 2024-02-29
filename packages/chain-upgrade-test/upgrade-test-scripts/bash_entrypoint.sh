#!/bin/bash -i
cd /usr/src/agoric-sdk/ || exit 1
tmux -V || apt install -y tmux

if [[ $TMUX_USE_CC == "1" ]]; then
    TMUX_FLAGS="-CC -u"
else
    TMUX_FLAGS=""
fi

tmux $TMUX_FLAGS \
    new-session  'SLOGFILE=slog.slog ./upgrade-test-scripts/start_to_to.sh' \; \
    new-window   'bash -i'
