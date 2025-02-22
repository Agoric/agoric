import test from 'ava';
import { makeStatsTransformer } from '../src/store-stats.js';

test('transformer', async t => {
  const rows = [
    { key: 'v1.c.ko21', value: 'R o+0' },
    { key: 'v1.c.ko11', value: '_ o+0' },
    { key: 'v1.c.ko21', value: 'R o-0' },
    { key: 'v1.c.ko11', value: '_ o-0' },
    { key: 'v1.c.kp40', value: 'R p-60' },
    { key: 'v2.c.kp146', value: 'R p+12' },
    { key: 'v1.vs.vc.1', value: '3' },
    { key: 'v1.vs.vc.1', value: '3' },
    { key: 'v2.vs.vc.1', value: '3' },
    { key: 'v1.o.noImpact', value: 'R p+12' },
    { key: 'v1.p.noImpact', value: 'R p+12' },
  ];
  const statsTransformer = makeStatsTransformer();
  const stats = statsTransformer.rowsToStats(rows);
  t.assert(stats.size === 2);
  t.assert(stats.get('v1').objectExportsReachable === 1);
  t.assert(stats.get('v1').objectExportsRecognizable === 1);
  t.assert(stats.get('v1').objectImportsReachable === 1);
  t.assert(stats.get('v1').objectImportsRecognizable === 1);
  t.assert(stats.get('v1').promises === 1);
  t.assert(stats.get('v1').vatStoreKeys === 2);
  t.assert(stats.get('v2').objectExportsReachable === 0);
  t.assert(stats.get('v2').objectExportsRecognizable === 0);
  t.assert(stats.get('v2').objectImportsReachable === 0);
  t.assert(stats.get('v2').objectImportsRecognizable === 0);
  t.assert(stats.get('v2').promises === 1);
  t.assert(stats.get('v2').vatStoreKeys === 1);
});
