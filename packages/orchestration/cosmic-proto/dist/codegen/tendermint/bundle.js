//@ts-nocheck
import * as _185 from './abci/types.js';
import * as _186 from './crypto/keys.js';
import * as _187 from './crypto/proof.js';
import * as _188 from './libs/bits/types.js';
import * as _189 from './p2p/types.js';
import * as _190 from './types/block.js';
import * as _191 from './types/evidence.js';
import * as _192 from './types/params.js';
import * as _193 from './types/types.js';
import * as _194 from './types/validator.js';
import * as _195 from './version/types.js';
export var tendermint;
(function (tendermint) {
    tendermint.abci = {
        ..._185,
    };
    tendermint.crypto = {
        ..._186,
        ..._187,
    };
    let libs;
    (function (libs) {
        libs.bits = {
            ..._188,
        };
    })(libs = tendermint.libs || (tendermint.libs = {}));
    tendermint.p2p = {
        ..._189,
    };
    tendermint.types = {
        ..._190,
        ..._191,
        ..._192,
        ..._193,
        ..._194,
    };
    tendermint.version = {
        ..._195,
    };
})(tendermint || (tendermint = {}));
//# sourceMappingURL=bundle.js.map