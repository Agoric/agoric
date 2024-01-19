// @ts-check
import { makeDurableZone } from '@agoric/zone/durable.js';
import { prepareRouterProtocol } from '@agoric/network';
import { prepareWhenableModule } from '@agoric/whenable';

export function buildRootObject(_vatPowers, _args, baggage) {
  const zone = makeDurableZone(baggage);
  const powers = prepareWhenableModule(zone.subZone('whenable'));
  const makeRouterProtocol = prepareRouterProtocol(
    zone.subZone('network'),
    powers,
  );

  makeRouterProtocol();
}
