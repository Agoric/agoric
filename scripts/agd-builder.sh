#! /usr/bin/env bash
# scripts/agd-builder.sh - A build wrapper to bootstrap the Agoric daemon
#
# Usage: agd build
#        to rebuild the SDK if necessary
#    or: agd build --force
#        to rebuild the SDK even if up-to-date
#    or: agd ARGS...
#        to rebuild the SDK if necessary, then invoke the daemon with ARGS
#
# This uses SKIP_DOWNLOAD=false or the Cosmovisor $DAEMON_HOME and
# $DAEMON_ALLOW_DOWNLOAD_BINARIES variables to enable the automatic downloading
# of Golang and NodeJS versions needed to build and run the current version of
# the SDK.
set -ueo pipefail

function fatal() {
  echo ${1+"$@"} 1>&2
  exit 1
}

GVM_URL=${GVM_URL-https://github.com/devnw/gvm/releases/download/latest/gvm}
NVM_GIT_REPO=${NVM_GIT_REPO-https://github.com/nvm-sh/nvm.git}

STAMPS=node_modules/.cache/agoric/stamps

real0=$(readlink "${BASH_SOURCE[0]}" || echo "${BASH_SOURCE[0]}")
thisdir=$(cd "$(dirname -- "$real0")" > /dev/null && pwd -P)

if test "${1-''}" = stamp; then
  stamps=$thisdir/../$STAMPS
  echo "Creating $stamps/$2" 1>&2
  mkdir -p "$stamps"
  date > "$stamps/$2"
  exit 0
fi

# shellcheck disable=SC1091
source "$thisdir/../repoconfig.sh"

if test "${1-''}" = build; then
  do_not_build=false
  only_build=true
  # Enable shell debugging.
  set -x
  case "${2-''}" in
    --force | -f)
      rm -rf "$thisdir/../$STAMPS"
      ;;
  esac
else
  case ${NO_BUILD-false} in
    true | yes | y | 1)
      do_not_build=true
      ;;
    *)
      do_not_build=false
      ;;
  esac
  only_build=false
fi

need_nodejs=$only_build
case $@ in
  start | *" start" | *" start "*)
    # We're starting the daemon, so we need Node.js.
    need_nodejs=true
    ;;
esac

# Only allow auto-downloading if explicitly set.
if test "${SKIP_DOWNLOAD-}" = false; then
  :
elif test -n "${DAEMON_HOME-}" && test "${DAEMON_ALLOW_DOWNLOAD_BINARIES-}" = true; then
  # Cosmovisor download mode detected.
  SKIP_DOWNLOAD=false
else
  # Skip the download by default.
  SKIP_DOWNLOAD=true
fi

if $need_nodejs; then
  export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
  export COREPACK_ENABLE_NETWORK=$($SKIP_DOWNLOAD && echo 0 || echo 1)

  # We need to get node at the script top level because it's used by the daemon
  # as well.
  case $(node --version 2> /dev/null) in
    "$NODEJS_VERSION" | "$NODEJS_VERSION".*) ;;
    *)
      # Auto-download the NodeJS version we need, if allowed.
      $SKIP_DOWNLOAD || {
        if test -z "${NVM_DIR-}"; then
          export "NVM_DIR=${DAEMON_HOME-$HOME}/.nvm"
        fi
        if test ! -s "$NVM_DIR/nvm.sh"; then
          git clone "$NVM_GIT_REPO" "$NVM_DIR"
          (
            cd "$NVM_DIR"
            git checkout "$(git describe --abbrev=0 --tags --match "v[0-9]*" "$(git rev-list --tags --max-count=1)")"
          )
        fi
        # shellcheck disable=SC1091
        source "$NVM_DIR/nvm.sh" --no-use
        nvm ls "$NODEJS_VERSION" > /dev/null 2>&1 || {
          nvm install "$NODEJS_VERSION"
        }
        nvm use "$NODEJS_VERSION"
      } 1>&2
      ;;
  esac

  nodeversion=$(node --version 2> /dev/null || fatal 'command failed: node --version')
  noderegexp='v([0-9]+)\.([0-9]+)\.([0-9]+)'
  [[ "$nodeversion" =~ $noderegexp ]] || fatal "illegible Node.js version '$nodeversion'"
  nodejs_version_check "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}" "${BASH_REMATCH[3]}" "$nodeversion"
fi

$do_not_build || (
  # Send the build output to stderr unless we're only building.  This prevents
  # the daemon's stdout from being polluted with build output.
  $only_build || exec 1>&2

  cd "$thisdir/.."
  test -d "$STAMPS" || echo "Creating $STAMPS" 1>&2
  mkdir -p "$STAMPS"

  stamp=$GOLANG_DAEMON
  if test -e "$stamp"; then
    print=(-newer "$stamp")
  else
    print=()
  fi
  print+=(-print)
  src=$(
    find "$GOLANG_DIR" \( ! -name '*_test.go' -name '*.go' -o -name '*.cc' -o -name 'go.*' \) \
      "${print[@]}" | head -1 || true
  )
  test -z "$src" || {
    echo "At least $src is newer than $stamp"
    $do_not_build
  } || (
    # Run this build in another subshell in case we had to modify the path.
    case $(go version 2> /dev/null) in
      "go version go$GOLANG_VERSION "* | "go version go$GOLANG_VERSION."*) ;;
      *)
        # Auto-download the Golang version we need, if allowed.
        $SKIP_DOWNLOAD || {
          export HOME=${DAEMON_HOME-$HOME}
          mkdir -p "$HOME/bin"

          # shellcheck disable=SC2030
          PATH="$HOME/.gvm/go/bin:$HOME/bin:$PATH"
          test -x "$HOME/bin/gvm" || {
            curl -L "$GVM_URL" > "$HOME/bin/gvm"
            chmod +x "$HOME/bin/gvm"
          }
          gvm "$GOLANG_VERSION" -s
        }
        ;;
    esac
    # Ensure minimum patch versions of Go environment
    cd "$GOLANG_DIR"
    goversion=$(go version 2> /dev/null || fatal 'command failed: go version')
    goregexp='go version go([0-9]+)(.([0-9]+)(.([0-9]+))?)?( |$)'
    [[ "$goversion" =~ $goregexp ]] || fatal "illegible Go version '$goversion'"
    golang_version_check "${BASH_REMATCH[1]}" "${BASH_REMATCH[3]}" "${BASH_REMATCH[5]}" "$goversion"
    make compile-go
  )

  if $need_nodejs; then
    lazy_yarn() {
      yarn --version 2> /dev/null 1>&2 || {
        # Auto-download the Yarn version we need, if allowed.
        $SKIP_DOWNLOAD || {
          npm install -g yarn
        }
      }
      yarn "$@"
    }

    # Check if any package.json is newer than the installation stamp.
    # If some package.json is newer than the last yarn install, run yarn install
    # UNTIL https://github.com/Agoric/agoric-sdk/issues/9209
    stamp=$STAMPS/yarn-installed
    if test -e "$stamp"; then
      print=(-newer "$stamp")
    else
      print=()
    fi
    print+=(-print)

    # Find the current list of package.jsons.
    files=(package.json)
    while IFS= read -r line; do
      files+=("$line")
    done < <(npm query .workspace \
      | sed -ne '/"location":/{ s/.*": "//; s!",.*!/package.json!; p; }')

    src=$(find "${files[@]}" "${print[@]}" | head -1 || true)
    test -z "$src" || {
      echo "At least $src is newer than node_modules"
      rm -f "$STAMPS/yarn-built"
      lazy_yarn install
    }

    stamp=$STAMPS/yarn-built
    if test ! -e "$stamp"; then
      echo "Yarn packages need to be built"
      lazy_yarn build
    fi

    # Simple test to see whether to build the GYP bindings.
    # Check if any GYP source is newer than the destination.
    stamp=$GOLANG_DIR/build/Release/agcosmosdaemon.node
    if test -e "$stamp"; then
      print=(-newer "$stamp")
    else
      print=()
    fi
    print+=(-print)

    files=("$GOLANG_DIR/build/"*agcosmosdaemon.h)
    src=$(find "${files[@]}" "${print[@]}" | head -1 || true)
    test -z "$src" || {
      echo "At least $src is newer than gyp bindings"
      (cd "$GOLANG_DIR" && lazy_yarn build:gyp)
    }

    # check the built xsnap version against the package version it should be using
    (cd "${thisdir}/../packages/xsnap" && npm run -s check-version) || exit 1
  fi
)

if $only_build; then
  echo "Build complete." 1>&2
  exit 0
fi
