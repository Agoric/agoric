import { useRegistry, useChain, ConfigContext } from 'starshipjs';

export const makeGetFile =
  (path: Pick<typeof import('path'), 'dirname' | 'join'>) =>
  (filePath: string) =>
    path.join(path.dirname(new URL(import.meta.url).pathname), filePath);

type GetFilePathFn = ReturnType<typeof makeGetFile>;

export type UseChainFn = Awaited<
  ReturnType<ReturnType<typeof makeSetupRegistry>>
>['useChain'];

export const makeSetupRegistry = (getFile: GetFilePathFn) => {
  let initialized = false;
  /**
   * @param {Object} opts
   * @param {string} [opts.config='../config.yaml'] - The path to the starship configuration file.
   * @example
   * ```js
   * const { useChain } = await setupRegistry();
   *
   * const { creditFromFaucet } = useChain('osmosis');
   * await creditFromFaucet('osmo1234');
   * ```
   */
  const setupRegistry = async ({ config = '../config.yaml' } = {}) => {
    if (initialized) return { useChain };
    const configFile = getFile(config);
    const fetcher = await useRegistry(configFile);
    await ConfigContext.init(configFile, fetcher);
    initialized = true;
    return { useChain };
  };

  return setupRegistry;
};
