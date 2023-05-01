import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { AmountMath } from '../../../src/index.js';

const mintInto = (kit, purse, value) =>
  E(kit.mint)
    .mintPayment(AmountMath.make(kit.brand, value))
    .then(p => E(purse).deposit(p));

export const buildRootObject = () => {
  /** @type {import('@agoric/swingset-vat').VatAdminSvc} */
  let vatAdmin;
  let ertpRoot;
  /** @type {import('@agoric/swingset-vat').VatAdminFacet} */
  let ertpAdmin;
  let issuerKitA;
  let issuerKitB;
  let purseA1;
  let purseA2;
  let purseB1;
  let purseB2;
  let paymentForBP;

  return Far('root', {
    bootstrap: async (vats, devices) => {
      vatAdmin = await E(vats.vatAdmin).createVatAdminService(devices.vatAdmin);
    },

    buildV1: async () => {
      // build the contract vat from ZCF and the contract bundlecap
      const bcap = await E(vatAdmin).getNamedBundleCap('ertpService');
      const res = await E(vatAdmin).createVat(bcap);
      ertpRoot = res.root;
      ertpAdmin = res.adminNode;
      const ertpService = await E(ertpRoot).getErtpService();

      issuerKitA = await E(ertpService).makeIssuerKit('A');
      issuerKitB = await E(ertpService).makeIssuerKit('B');

      // make purses with non-zero balances
      purseA1 = E(issuerKitA.issuer).makeEmptyPurse();
      purseA2 = E(issuerKitA.issuer).makeEmptyPurse();
      purseB1 = E(issuerKitB.issuer).makeEmptyPurse();
      purseB2 = E(issuerKitB.issuer).makeEmptyPurse();
      await Promise.all([
        mintInto(issuerKitA, purseA1, 20n),
        mintInto(issuerKitA, purseA2, 40n),
        mintInto(issuerKitB, purseB1, 12n),
        mintInto(issuerKitB, purseB2, 16n),
      ]);

      // hold onto a payment here.
      paymentForBP = E(issuerKitB.mint).mintPayment(
        AmountMath.make(issuerKitB.brand, 100n),
      );

      const purseA2Amount = await E(purseA2).getCurrentAmount();
      assert(
        AmountMath.isEqual(
          purseA2Amount,
          AmountMath.make(issuerKitA.brand, 40n),
        ),
      );
      return true;
    },

    upgradeV2: async () => {
      const bcap = await E(vatAdmin).getNamedBundleCap('ertpService');
      await E(ertpAdmin).restartVat(bcap);

      // exercise purses
      const purseA2Balance = await E(purseA2).getCurrentAmount();
      assert(
        AmountMath.isEqual(
          purseA2Balance,
          AmountMath.make(issuerKitA.brand, 40n),
        ),
      );
      const paymentA0 = await E(purseA2).withdraw(
        AmountMath.make(issuerKitA.brand, 5n),
      );
      const payment0Amount = await E(issuerKitA.issuer).getAmountOf(paymentA0);
      assert(
        AmountMath.isEqual(
          payment0Amount,
          AmountMath.make(issuerKitA.brand, 5n),
        ),
      );

      const paymentForB = await paymentForBP;
      // deposit a payment from earlier
      await E(purseB1).deposit(paymentForB);
      const purseB1NewAmount = await E(purseB1).getCurrentAmount();
      assert(
        AmountMath.isEqual(
          purseB1NewAmount,
          AmountMath.make(issuerKitB.brand, 112n),
        ),
      );

      return true;
    },
  });
};
