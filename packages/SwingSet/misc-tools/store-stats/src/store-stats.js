import { StatsD } from 'hot-shots';

const dogstatsd = new StatsD({
  errorHandler(error) {
    console.log('StatsD socket errors: ', error);
  },
});

/**
 * @param {import('better-sqlite3').Database} db
 */
export const makeSwingstore = db => {
  const dbTool = () => {
    const prepare = (strings, ...params) => {
      const dml = strings.join('?');
      return { stmt: db.prepare(dml), params };
    };
    const sql = (strings, ...args) => {
      const { stmt, params } = prepare(strings, ...args);
      return stmt.all(...params);
    };
    sql.get = (strings, ...args) => {
      const { stmt, params } = prepare(strings, ...args);
      return stmt.get(...params);
    };
    sql.iterate = (strings, ...args) => {
      const { stmt, params } = prepare(strings, ...args);
      return stmt.iterate(...params);
    };
    return sql;
  };

  const sql = dbTool();

  /** @param {string} key */
  const kvGet = key => sql.get`select * from kvStore where key = ${key}`.value;

  const kvAll = key => sql.iterate`select * from kvStore where key GLOB ${key}`;

  return Object.freeze({
    findHeight: () => {
      console.log('Fetching block height from the database');
      return kvGet('host.height');
    },
    findVatItems: () => {
      console.log('Fetching vat items from the database');
      return kvAll('v[0-9]*.*');
    },
  });
};

export const makeStatsSender = () => {
  const sendMetrics = data => {
    const { height, vatStats } = data;
    console.log(
      `Sending metrics of ${vatStats.size} vats to datadog for block ${height}`,
    );
    for (const [vatID, stats] of vatStats) {
      const tags = [`height:${height}`, `vatID:${vatID}`];
      dogstatsd.gauge(
        'swingset.kvstore.vat_stats.object_exports_reachable',
        stats.objectExportsReachable,
        tags,
      );
      dogstatsd.gauge(
        'swingset.kvstore.vat_stats.object_exports_recognizable',
        stats.objectExportsRecognizable,
        tags,
      );
      dogstatsd.gauge(
        'swingset.kvstore.vat_stats.object_imports_reachable',
        stats.objectImportsReachable,
        tags,
      );
      dogstatsd.gauge(
        'swingset.kvstore.vat_stats.object_imports_recognizable',
        stats.objectImportsRecognizable,
        tags,
      );
      dogstatsd.gauge(
        'swingset.kvstore.vat_stats.promises',
        stats.promises,
        tags,
      );
      dogstatsd.gauge(
        'swingset.kvstore.vat_stats.vat_store_keys',
        stats.vatStoreKeys,
        tags,
      );
      dogstatsd.increment('swingset.kvstore.stats');
    }
    dogstatsd.close();
    console.log('Done sending metrics to datadog');
  };

  return Object.freeze({
    sendMetrics,
  });
};

export const makeStatsTransformer = () => {
  // kvstore has pairs like:
  // "v$NN.c.ko45": "R o+4"      # reachable export
  // "v$NN.c.ko46": "_ o+5"      # merely-recognizable export
  // "v$NN.c.ko47": "R o-6"      # reachable import
  // "v$NN.c.ko48": "_ o-7"      # merely-recognizable import
  // "v$NN.c.kp70": "R p+12"      # promise (always "R", sometimes "p+" sometimes "p-")

  const object = /^v\d+\.c\..*ko\d.*$/; // vNN.c.koNNNNN*
  const exportReach = /^R o\+.*$/; // R o+*
  const exportRecog = /^_ o\+.*$/; // _ o+*

  const importReach = /^R o-.*$/; // R o-*
  const importRecog = /^_ o-.*$/; // _ o-*

  const vatPromise = /^v\d+\.c\..*kp\d.*$/; // vNN.c.kpNNNNN*
  const vatStoreKeys = /^v\d+\.vs\..*$/; // vNN.vs.*

  const newStat = () => {
    return {
      objectExportsReachable: 0,
      objectExportsRecognizable: 0,
      objectImportsReachable: 0,
      objectImportsRecognizable: 0,
      promises: 0,
      vatStoreKeys: 0,
    };
  };

  const rowsToStats = rows => {
    console.log(`Transforming rows to stats`);
    let count = 0;
    const vatStats = new Map();
    for (const row of rows) {
      count += 1;
      const vatID = row.key.split('.')[0];
      const stat = vatStats.get(vatID) || newStat();
      vatStats.set(vatID, stat);
      stat.objectExportsReachable +=
        object.test(row.key) && exportReach.test(row.value);

      stat.objectExportsRecognizable +=
        object.test(row.key) && exportRecog.test(row.value);

      stat.objectImportsReachable +=
        object.test(row.key) && importReach.test(row.value);

      stat.objectImportsRecognizable +=
        object.test(row.key) && importRecog.test(row.value);

      stat.promises += vatPromise.test(row.key);
      stat.vatStoreKeys += vatStoreKeys.test(row.key);
    }
    console.log(`Done transforming ${count} rows to stats}`);
    return vatStats;
  };
  return Object.freeze({
    rowsToStats,
  });
};
