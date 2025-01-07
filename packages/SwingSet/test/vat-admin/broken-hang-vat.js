import { makePromiseKit } from '@endo/promise-kit';

export async function buildRootObject() {
  const pk = makePromiseKit();
  return pk.promise; // never resolves
}
