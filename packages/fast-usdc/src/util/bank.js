export const queryUSDCBalance = async (
  /** @type {string} */ address,
  /** @type {string} */ api,
  /** @type {string} */ denom,
  /** @type {typeof globalThis.fetch} */ fetch,
) => {
  const query = `${api}/cosmos/bank/v1beta1/balances/${address}`;
  const json = await fetch(query).then(async res => res.json());
  const amount = json.balances?.find(b => b.denom === denom)?.amount ?? '0';

  return BigInt(amount);
};
