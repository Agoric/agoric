import processAmbient from 'process';
import dbOpenAmbient from 'better-sqlite3';
import {
  makeStatsSender,
  makeStatsTransformer,
  makeSwingstore,
} from './store-stats.js';

export const swingstorePath = '~/.agoric/data/agoric/swingstore.sqlite';

/**
 * @param {string[]} argv
 * @param {{ dbOpen: typeof import('better-sqlite3'), HOME?: string }} io
 */
const main = async (argv, { dbOpen }) => {
  const [_node, _script, databasePath] = argv;
  const fullPath = (databasePath || swingstorePath).replace(
    /^~/,
    processAmbient.env.HOME,
  );
  console.log(`Opening database at ${fullPath}`);
  const kStore = makeSwingstore(dbOpen(fullPath, { readonly: true }));
  const height = kStore.findHeight();
  const vatItems = kStore.findVatItems();
  const statsTransformer = makeStatsTransformer();
  const stats = statsTransformer.rowsToStats(vatItems);
  const statsSender = makeStatsSender();
  statsSender.sendMetrics({ height, vatStats: stats });
  console.log('Done');
};

processAmbient.exitCode = 1;
main(processAmbient.argv, {
  dbOpen: dbOpenAmbient,
}).then(
  () => {
    processAmbient.exitCode = 0;
  },
  err => {
    console.error('Failed with', err);
    processAmbient.exit(processAmbient.exitCode || 1);
  },
);
