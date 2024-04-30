#! /bin/bash
# Usage: get-packed-versions.sh <WORKDIR>
#
# This script creates package tarballs in the specified workspace directory and
# writes out information for resolve-versions.sh to update a destination
# workspace to use them.  This is useful for testing changes to dependencies of
# the destination repository.
set -xueo pipefail

cache_bust=true
case $1 in
  --no-cache-bust)
    cache_bust=false
    shift
    ;;
esac

WORKDIR=${1:-.}
cd -- "$WORKDIR" 1>&2

# Install and build the source directory.
corepack enable
yarn install 1>&2
yarn build 1>&2

# use lerna to ensure these run in topological order, whereas npm query
# sorts in order of the array and lexically for the glob
# https://github.com/npm/cli/issues/4139#issuecomment-1730186418
yarn lerna run prepack 1>&2
# Convention used in Endo
yarn lerna run build:types 1>&2

npm query .workspace | jq -r '.[].location' | while read -r dir; do
  # Skip private packages.
  echo "dir=$dir" 1>&2
  test "$(jq .private < "$dir/package.json")" != true || continue

  ##################
  pushd "$dir" 1>&2

  # Gather the metadata.
  name=$(jq -r .name < package.json)
  version=$(jq -r .version < package.json)
  stem=$(echo "$name" | sed -e 's!^@!!; s!/!-!g;')
  file="$(pwd)/package.tgz"

  # Clean up.
  rm -f "${stem}"-v*.tgz

  # Create the tarball.
  yarn pack 1>&2

  if $cache_bust; then
    # Bust the cache!
    sum=$(sha1sum "$file" | sed -e 's/ .*//')
    dst="$(pwd)/${stem}-v${version}-${sum}.tgz"
    mv "$file" "$dst"
  else
    dst=$file
  fi

  # Write out the version entry.
  jq -n --arg name "$name" --arg file "$dst" \
    '{ key: $name, value: ("file:" + $file) }'

  popd 1>&2
  ##################
done | jq -s from_entries
