#!/usr/bin/env node
// @ts-check
import '@endo/init';
import process from 'process';

import { Fail, q } from '@endo/errors';

const { entries, keys, values } = Object;

const logged = label => x => {
  console.error(label, x);
  return x;
};

const styles = {
  vatPowers: 'shape=star, style=filled, fillcolor=aqua',
  vats: 'shape=doubleoctagon, style=filled, fillcolor=tomato',
  vat: 'shape=doubleoctagon, style=filled, fillcolor=tomato3',
  devices: 'shape=box, style=filled, fillcolor=gold',
  space: 'shape=house, style=filled, fillcolor=khaki',
  issuer: 'shape=trapezium, style=filled, fillcolor=chocolate',
  brand: 'shape=Mcircle, style=filled, fillcolor=chocolate2',
  installation: 'shape=cylinder',
  instance: 'shape=component',
  home: 'shape=folder',
};

/**
 * @param {Set<GraphNode>} nodes
 * @param {Map<string, Set<{ id: string; style?: string }>>} neighbors
 * @yields {string}
 *
 * @typedef {{
 *   id: string;
 *   cluster?: string;
 *   label: string;
 *   style?: string;
 * }} GraphNode
 */
function* fmtGraph(nodes, neighbors) {
  const quote = txt => JSON.stringify(txt.replace(/\./g, '_'));
  yield 'digraph G {\n';
  yield 'rankdir = LR;\n';
  const clusters = new Set(
    [...nodes].map(({ cluster }) => cluster).filter(c => !!c),
  );
  for (const subgraph of [...clusters, undefined]) {
    if (subgraph) {
      assert.typeof(subgraph, 'string');
      yield `subgraph cluster_${subgraph} {\n`;
      yield `label = "${subgraph}"\n`;
    }
    for (const { id, cluster, label, style } of nodes) {
      if (subgraph && cluster !== subgraph) continue;
      yield `${quote(id)} [label=${quote(label)}${style ? `, ${style}` : ''}];\n`;
    }
    if (subgraph) {
      yield `}\n`;
    }
  }
  for (const [src, arcs] of neighbors.entries()) {
    for (const { id, style } of arcs) {
      yield `${quote(src)} -> ${quote(id)} [${style}]\n`;
    }
  }
  yield '}\n';
}

/**
 * @param {Record<string, Permit>} manifest
 *
 * @typedef {| true
 *   | ({
 *       vatParameters?: Record<string, Permit>;
 *       vatPowers?: Record<string, true>;
 *       vats?: Record<string, Status>;
 *       devices?: Record<string, true>;
 *       home?: PowerSpace;
 *       issuer?: PowerSpace;
 *       brand?: PowerSpace;
 *       oracleBrand?: PowerSpace;
 *       installation?: PowerSpace;
 *       instance?: PowerSpace;
 *     } & PowerSpace)} Permit
 *
 * @typedef {{
 *   produce?: Record<string, Status>;
 *   consume?: Record<string, Status>;
 * }} PowerSpace
 *
 * @typedef {boolean | VatName} Status
 *
 * @typedef {string} VatName
 */
const manifest2graph = manifest => {
  /** @type {Set<GraphNode>} */
  const nodes = new Set();
  const neighbors = new Map();

  /**
   * @param {string} src
   * @param {string} dest
   * @param {string} [style]
   */
  const addEdge = (src, dest, style = '') => {
    logged('addEdge')({ src, dest });
    if (!neighbors.has(src)) {
      neighbors.set(src, new Set());
    }
    neighbors.get(src).add({ id: dest, style });
  };

  /**
   * @param {string} src
   * @param {string} ty
   * @param {Permit} item
   * @param {boolean} [reverse]
   */
  const level1 = (src, ty, item, reverse = false) => {
    if (!item) return;
    for (const [powerName, status] of entries(item)) {
      // subsumed by permits for vat:, home:, ...
      if (
        [
          'loadVat',
          'loadCriticalVat',
          'client',
          'agoricNames',
          'nameHubs',
          'nameAdmins',
        ].includes(powerName) &&
        reverse
      )
        continue;
      if (status) {
        let cluster = {};
        if (typeof status !== 'boolean') {
          cluster = { cluster: status };
        }

        nodes.add({
          id: `${ty}.${powerName}`,
          label: powerName,
          style: styles[ty],
          ...cluster,
        });
        addEdge(src, `${ty}.${powerName}`, reverse ? 'dir=back' : '');
        if (ty === 'home') {
          nodes.add({ id: 'home', label: 'home', cluster: 'provisioning' });
          addEdge('home', `${ty}.${powerName}`);
        }
      }
    }
  };

  /** @type {<X>(xs: X[]) => X[]} */
  const uniq = xs => [...new Set(xs)];
  const spaces = uniq(
    logged('vals')(values(manifest)).flatMap(permit =>
      logged('keys?')(keys(permit)).flatMap(name => {
        logged('name?')(name);

        if (['produce', 'consume'].includes(name)) return [];
        return [name];
      }),
    ),
  );
  console.error('@@@', { spaces });

  for (const [fnName, permit] of entries(manifest)) {
    if (permit === true) {
      console.error('skipping wildcard permit:', fnName);
      continue;
    }
    nodes.add({ id: logged('fn')(fnName), label: fnName });

    permit.vatPowers && level1(fnName, 'vatPowers', permit.vatPowers, true);
    permit.vats && level1(fnName, 'vats', permit.vats, true);
    permit.devices && level1(fnName, 'devices', permit.devices, true);

    const doPart = (name, part) => {
      if (!part) return;
      level1(fnName, name, part.produce || {});
      level1(fnName, name, part.consume || {}, true);
    };
    doPart('space', permit);
    for (const s of spaces) {
      doPart(s, permit[s]);
    }

    if ('runBehaviors' in permit) {
      throw Error('not impl');
      // nodes.add({
      //   id: `runBehaviors`,
      //   label: `runBehaviors`,
      //   style: '',
      // });
      // addEdge(fnName, `runBehaviors`);
    }
  }
  return { nodes, neighbors };
};

/**
 * @param {string} specifier
 * @param {object} io
 * @param {Resolver} io.resolve
 * @param {typeof import('fs/promises').readFile} io.readFile
 */
const loadConfig = async (specifier, { resolve, readFile }) => {
  const fullPath = await resolve(specifier, import.meta.url).then(
    u => new URL(u).pathname,
  );
  typeof fullPath === 'string' || Fail`${q(specifier)}`;
  const txt = await readFile(fullPath, 'utf-8');
  typeof txt === 'string' || Fail`readFile ${q(fullPath)}`;
  return JSON.parse(txt);
};

/**
 * @param {string[]} args
 * @param {object} io
 * @param {typeof import('process').stdout} io.stdout
 * @param {typeof import('fs/promises')} io.fsp
 * @param {{
 *   resolve: Resolver;
 *   url: string;
 *   load: (specifier: string) => Promise<Record<string, any>>;
 * }} io.meta
 *
 * @typedef {(specifier: string, parent: string) => Promise<string>} Resolver
 */
const main = async (args, { stdout, fsp, meta }) => {
  const [specifier, ...opts] = args;
  specifier || Fail`Usage: $0 @agoric/vm-config/decentral-...json`;

  const config = await loadConfig(specifier, {
    resolve: meta.resolve,
    readFile: fsp.readFile,
  });
  // console.log(config);
  const { bootstrap } = config.vats;

  const { MANIFEST } = await meta
    .resolve(bootstrap.sourceSpec, meta.url)
    .then(async p => meta.load(p));
  // console.log('manifest keys:', Object.keys(MANIFEST));

  const [gov] = ['--gov'].map(opt => opts.includes(opt));

  if (gov) {
    throw Error('not impl');
    /*
    const postBoot = sim
      ? manifests.SIM_CHAIN_POST_BOOT_MANIFEST
      : manifests.CHAIN_POST_BOOT_MANIFEST;
    manifest = { ...postBoot, ...manifest };
    */
  }

  const g = manifest2graph(MANIFEST);
  for (const chunk of fmtGraph(g.nodes, g.neighbors)) {
    stdout.write(chunk);
  }
};

const run = async () => {
  const [fsp, metaResolve] = await Promise.all([
    import('fs/promises'),
    import('import-meta-resolve'),
  ]);

  return main(process.argv.slice(2), {
    stdout: process.stdout,
    fsp,
    meta: {
      resolve: metaResolve.resolve,
      url: import.meta.url,
      load: async specifier => import(specifier),
    },
  });
};

process.exitCode = 1;
run().then(
  () => {
    process.exitCode = 0;
  },
  err => {
    console.error('Failed with', err);
    process.exit(process.exitCode || 1);
  },
);
