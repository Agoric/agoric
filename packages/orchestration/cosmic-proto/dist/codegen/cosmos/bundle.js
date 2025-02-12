//@ts-nocheck
import * as _18 from './auth/v1beta1/auth.js';
import * as _19 from './auth/v1beta1/genesis.js';
import * as _20 from './auth/v1beta1/query.js';
import * as _21 from './authz/v1beta1/authz.js';
import * as _22 from './authz/v1beta1/event.js';
import * as _23 from './authz/v1beta1/genesis.js';
import * as _24 from './authz/v1beta1/query.js';
import * as _25 from './authz/v1beta1/tx.js';
import * as _26 from './bank/v1beta1/authz.js';
import * as _27 from './bank/v1beta1/bank.js';
import * as _28 from './bank/v1beta1/genesis.js';
import * as _29 from './bank/v1beta1/query.js';
import * as _30 from './bank/v1beta1/tx.js';
import * as _31 from './base/abci/v1beta1/abci.js';
import * as _32 from './base/node/v1beta1/query.js';
import * as _33 from './base/query/v1beta1/pagination.js';
import * as _34 from './base/reflection/v2alpha1/reflection.js';
import * as _35 from './base/v1beta1/coin.js';
import * as _36 from './crypto/ed25519/keys.js';
import * as _37 from './crypto/hd/v1/hd.js';
import * as _38 from './crypto/keyring/v1/record.js';
import * as _39 from './crypto/multisig/keys.js';
import * as _40 from './crypto/secp256k1/keys.js';
import * as _41 from './crypto/secp256r1/keys.js';
import * as _42 from './distribution/v1beta1/distribution.js';
import * as _43 from './distribution/v1beta1/genesis.js';
import * as _44 from './distribution/v1beta1/query.js';
import * as _45 from './distribution/v1beta1/tx.js';
import * as _46 from './feegrant/v1beta1/feegrant.js';
import * as _47 from './feegrant/v1beta1/genesis.js';
import * as _48 from './feegrant/v1beta1/query.js';
import * as _49 from './feegrant/v1beta1/tx.js';
import * as _50 from './gov/v1/genesis.js';
import * as _51 from './gov/v1/gov.js';
import * as _52 from './gov/v1/query.js';
import * as _53 from './gov/v1/tx.js';
import * as _54 from './gov/v1beta1/genesis.js';
import * as _55 from './gov/v1beta1/gov.js';
import * as _56 from './gov/v1beta1/query.js';
import * as _57 from './gov/v1beta1/tx.js';
import * as _58 from './group/v1/events.js';
import * as _59 from './group/v1/genesis.js';
import * as _60 from './group/v1/query.js';
import * as _61 from './group/v1/tx.js';
import * as _62 from './group/v1/types.js';
import * as _63 from './mint/v1beta1/genesis.js';
import * as _64 from './mint/v1beta1/mint.js';
import * as _65 from './mint/v1beta1/query.js';
import * as _66 from './params/v1beta1/params.js';
import * as _67 from './params/v1beta1/query.js';
import * as _68 from './staking/v1beta1/authz.js';
import * as _69 from './staking/v1beta1/genesis.js';
import * as _70 from './staking/v1beta1/query.js';
import * as _71 from './staking/v1beta1/staking.js';
import * as _72 from './staking/v1beta1/tx.js';
import * as _73 from './tx/signing/v1beta1/signing.js';
import * as _74 from './tx/v1beta1/service.js';
import * as _75 from './tx/v1beta1/tx.js';
import * as _76 from './upgrade/v1beta1/query.js';
import * as _77 from './upgrade/v1beta1/tx.js';
import * as _78 from './upgrade/v1beta1/upgrade.js';
import * as _79 from './vesting/v1beta1/tx.js';
import * as _80 from './vesting/v1beta1/vesting.js';
export var cosmos;
(function (cosmos) {
    let auth;
    (function (auth) {
        auth.v1beta1 = {
            ..._18,
            ..._19,
            ..._20,
        };
    })(auth = cosmos.auth || (cosmos.auth = {}));
    let authz;
    (function (authz) {
        authz.v1beta1 = {
            ..._21,
            ..._22,
            ..._23,
            ..._24,
            ..._25,
        };
    })(authz = cosmos.authz || (cosmos.authz = {}));
    let bank;
    (function (bank) {
        bank.v1beta1 = {
            ..._26,
            ..._27,
            ..._28,
            ..._29,
            ..._30,
        };
    })(bank = cosmos.bank || (cosmos.bank = {}));
    let base;
    (function (base) {
        let abci;
        (function (abci) {
            abci.v1beta1 = {
                ..._31,
            };
        })(abci = base.abci || (base.abci = {}));
        let node;
        (function (node) {
            node.v1beta1 = {
                ..._32,
            };
        })(node = base.node || (base.node = {}));
        let query;
        (function (query) {
            query.v1beta1 = {
                ..._33,
            };
        })(query = base.query || (base.query = {}));
        let reflection;
        (function (reflection) {
            reflection.v2alpha1 = {
                ..._34,
            };
        })(reflection = base.reflection || (base.reflection = {}));
        base.v1beta1 = {
            ..._35,
        };
    })(base = cosmos.base || (cosmos.base = {}));
    let crypto;
    (function (crypto) {
        crypto.ed25519 = {
            ..._36,
        };
        let hd;
        (function (hd) {
            hd.v1 = {
                ..._37,
            };
        })(hd = crypto.hd || (crypto.hd = {}));
        let keyring;
        (function (keyring) {
            keyring.v1 = {
                ..._38,
            };
        })(keyring = crypto.keyring || (crypto.keyring = {}));
        crypto.multisig = {
            ..._39,
        };
        crypto.secp256k1 = {
            ..._40,
        };
        crypto.secp256r1 = {
            ..._41,
        };
    })(crypto = cosmos.crypto || (cosmos.crypto = {}));
    let distribution;
    (function (distribution) {
        distribution.v1beta1 = {
            ..._42,
            ..._43,
            ..._44,
            ..._45,
        };
    })(distribution = cosmos.distribution || (cosmos.distribution = {}));
    let feegrant;
    (function (feegrant) {
        feegrant.v1beta1 = {
            ..._46,
            ..._47,
            ..._48,
            ..._49,
        };
    })(feegrant = cosmos.feegrant || (cosmos.feegrant = {}));
    let gov;
    (function (gov) {
        gov.v1 = {
            ..._50,
            ..._51,
            ..._52,
            ..._53,
        };
        gov.v1beta1 = {
            ..._54,
            ..._55,
            ..._56,
            ..._57,
        };
    })(gov = cosmos.gov || (cosmos.gov = {}));
    let group;
    (function (group) {
        group.v1 = {
            ..._58,
            ..._59,
            ..._60,
            ..._61,
            ..._62,
        };
    })(group = cosmos.group || (cosmos.group = {}));
    let mint;
    (function (mint) {
        mint.v1beta1 = {
            ..._63,
            ..._64,
            ..._65,
        };
    })(mint = cosmos.mint || (cosmos.mint = {}));
    let params;
    (function (params) {
        params.v1beta1 = {
            ..._66,
            ..._67,
        };
    })(params = cosmos.params || (cosmos.params = {}));
    let staking;
    (function (staking) {
        staking.v1beta1 = {
            ..._68,
            ..._69,
            ..._70,
            ..._71,
            ..._72,
        };
    })(staking = cosmos.staking || (cosmos.staking = {}));
    let tx;
    (function (tx) {
        let signing;
        (function (signing) {
            signing.v1beta1 = {
                ..._73,
            };
        })(signing = tx.signing || (tx.signing = {}));
        tx.v1beta1 = {
            ..._74,
            ..._75,
        };
    })(tx = cosmos.tx || (cosmos.tx = {}));
    let upgrade;
    (function (upgrade) {
        upgrade.v1beta1 = {
            ..._76,
            ..._77,
            ..._78,
        };
    })(upgrade = cosmos.upgrade || (cosmos.upgrade = {}));
    let vesting;
    (function (vesting) {
        vesting.v1beta1 = {
            ..._79,
            ..._80,
        };
    })(vesting = cosmos.vesting || (cosmos.vesting = {}));
})(cosmos || (cosmos = {}));
//# sourceMappingURL=bundle.js.map