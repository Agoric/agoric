import chalk from 'chalk';

export const ACCOUNT_JSON = `account.json`;
export const DEFAULT_BOOT_TOKENS = `1000000000000000ubld,10000000000000000uist`;
export const PLAYBOOK_WRAPPER = `./ansible-playbook.sh`;
export const SSH_TYPE = 'ecdsa';

const dirname = new URL('./', import.meta.url).pathname;

export const setup = ({ resolve, env, setInterval }) => {
  const it = harden({
    AGORIC_SDK: resolve(dirname, '../../..'),
    SETUP_DIR: resolve(dirname, '..'),
    SETUP_HOME: env.AG_SETUP_COSMOS_HOME
      ? resolve(env.AG_SETUP_COSMOS_HOME)
      : resolve('.'),
    playbook: (name, ...args) => {
      const fullPath = `${it.SETUP_DIR}/ansible/${name}.yml`;
      return [PLAYBOOK_WRAPPER, fullPath, ...args];
    },
    sleep: async (seconds, why) => {
      console.error(chalk.yellow(`Waiting ${seconds} seconds`, why || ''));
      return new Promise(res => setInterval(res, 1000 * seconds));
    },
  });
  env.AG_SETUP_COSMOS_HOME = it.SETUP_HOME;
  return it;
};
