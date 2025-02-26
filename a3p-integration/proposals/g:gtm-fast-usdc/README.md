# proposal for deploying the GTM release of Fast USDC

Because this runs before `n:upgrade-next` its base image isn't a build of the local agoric-sdk. So it can't use `yarn link` to get `@agoric/fast-usdc` from the source tree. Instead it sources the packages from NPM using `dev` to get the latest master builds.
