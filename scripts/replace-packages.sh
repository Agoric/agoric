#! /bin/bash
# Usage: replace-packages.sh <SRCDIR> [<DSTDIR>]
#
# This script replaces the packages in the $DSTDIR directory (default
# ./node_modules) with the packed-then-unpacked NPM packages from the $SRCDIR
# Yarn workspace. This is useful for testing changes to dependencies of the
# current repository.
set -xueo pipefail

SRCDIR=$1
DSTDIR=${2-$PWD/node_modules}

# Install and build the source directory.
pushd "$SRCDIR"
yarn install
yarn build

# use lerna to ensure these run in topological order, whereas npm query
# sorts in order of the array and lexically for the glob
# https://github.com/npm/cli/issues/4139#issuecomment-1730186418
yarn lerna run prepack
# Convention used in Endo
yarn lerna run build:types

npm query .workspace | jq -r '.[].location' | while read -r dir; do
  # Skip private packages.
  test "$(jq .private < "$dir/package.json")" != true || continue

  # Create the tarball.
  pushd "$dir"
  name=$(jq -r .name < package.json)
  rm -f package.tgz
  npm pack
  mv ./*.tgz package.tgz
  tar -xvf package.tgz

  # Replace the destination package.
  rm -rf "${DSTDIR:?}/$name"
  mkdir -p "$(dirname "${DSTDIR:?}/$name")"
  mv package "${DSTDIR:?}/$name"
  popd
done
popd

# Best-effort application of patches.
yarn patch-package
