import process from 'node:process';
// eslint-disable-next-line import/no-extraneous-dependencies
import { makeSlogSender } from '@agoric/telemetry';
import { buildVatController } from '../src/index.js';

export const buildTestVatController = async (
  config,
  argv,
  runtimeOptions,
  deviceEndowments,
) => {
  const { env = process.env, slogSender: explicitSlogSender } = runtimeOptions;
  await null;
  if (
    !explicitSlogSender &&
    (env.SLOGFILE || env.SLOGSENDER || env.SLOGSENDER_AGENT)
  ) {
    const slogSender = await makeSlogSender({ env });
    runtimeOptions = { ...runtimeOptions, slogSender };
  }
  return buildVatController(config, argv, runtimeOptions, deviceEndowments);
};
harden(buildTestVatController);
