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
export namespace tendermint {
  export const abci = {
    ..._185,
  };
  export const crypto = {
    ..._186,
    ..._187,
  };
  export namespace libs {
    export const bits = {
      ..._188,
    };
  }
  export const p2p = {
    ..._189,
  };
  export const types = {
    ..._190,
    ..._191,
    ..._192,
    ..._193,
    ..._194,
  };
  export const version = {
    ..._195,
  };
}
