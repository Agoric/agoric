//@ts-nocheck
import * as _125 from './abci/types.js';
import * as _126 from './crypto/keys.js';
import * as _127 from './crypto/proof.js';
import * as _128 from './libs/bits/types.js';
import * as _129 from './p2p/types.js';
import * as _130 from './types/block.js';
import * as _131 from './types/evidence.js';
import * as _132 from './types/params.js';
import * as _133 from './types/types.js';
import * as _134 from './types/validator.js';
import * as _135 from './version/types.js';
export namespace tendermint {
  export const abci = {
    ..._125,
  };
  export const crypto = {
    ..._126,
    ..._127,
  };
  export namespace libs {
    export const bits = {
      ..._128,
    };
  }
  export const p2p = {
    ..._129,
  };
  export const types = {
    ..._130,
    ..._131,
    ..._132,
    ..._133,
    ..._134,
  };
  export const version = {
    ..._135,
  };
}
