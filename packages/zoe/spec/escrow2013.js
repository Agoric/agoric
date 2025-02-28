import { E } from '@endo/far';

const Q = Promise;

const Qjoin = harden((p1, p2) =>
  Q.all([p1, p2]).then(([r1, r2]) => {
    if (!Object.is(r1, r2)) {
      throw Error('join failed');
    }
    return r1;
  })
);

const transfer = harden((decisionP, srcPurseP, dstPurseP, amount) => {
  const makeEscrowPurseP = Qjoin(
    E.get(srcPurseP).makePurse,
    E.get(dstPurseP).makePurse
  );
  const escrowPurseP = E(makeEscrowPurseP)();
  // setup phase 2
  Q(decisionP).then(
    _ => {
      E(dstPurseP).deposit(amount, escrowPurseP);
    },
    _ => {
      E(srcPurseP).deposit(amount, escrowPurseP);
    }
  );
  return E(escrowPurseP).deposit(amount, srcPurseP); // phase 1
});

const failOnly = harden(cancellationP =>
  Q(cancellationP).then(cancellation => {
    throw cancellation;
  })
);

// a from Alice , b from Bob
const escrowExchange = harden((a, b) => {
  let decide;
  const decisionP = Q.promise(resolve => {
    decide = resolve;
  });
  decide(
    Q.race([
      Q.all([
        transfer(decisionP, a.moneySrcP, b.moneyDstP, b.moneyNeeded),
        transfer(decisionP, b.stockSrcP, a.stockDstP, a.stockNeeded),
      ]),
      failOnly(a.cancellationP),
      failOnly(b.cancellationP),
    ])
  );
  return decisionP;
});
