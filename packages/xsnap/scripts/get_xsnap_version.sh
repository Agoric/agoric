#!/usr/bin/env bash

set -ueo pipefail

# the xsnap binary lives in a platform-specific directory
unameOut="$(uname -s)"
case "${unameOut}" in
  Linux*) platform=lin ;;
  Darwin*) platform=mac ;;
  *) platform=win ;;
esac

# extract the xsnap package version from the long version printed by xsnap-worker
"./${XSNAP_VARIANT:-legacy}/xsnap-native/xsnap/build/bin/${platform}/release/xsnap-worker" -v | sed -e 's/^xsnap \([^ ]*\) (XS [^)]*)$/\1/g'
