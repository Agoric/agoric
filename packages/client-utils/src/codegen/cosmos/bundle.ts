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
import * as _141 from './auth/v1beta1/query.rpc.Query.js';
import * as _142 from './authz/v1beta1/query.rpc.Query.js';
import * as _143 from './bank/v1beta1/query.rpc.Query.js';
import * as _144 from './base/node/v1beta1/query.rpc.Service.js';
import * as _145 from './distribution/v1beta1/query.rpc.Query.js';
import * as _146 from './feegrant/v1beta1/query.rpc.Query.js';
import * as _147 from './gov/v1/query.rpc.Query.js';
import * as _148 from './gov/v1beta1/query.rpc.Query.js';
import * as _149 from './group/v1/query.rpc.Query.js';
import * as _150 from './mint/v1beta1/query.rpc.Query.js';
import * as _151 from './params/v1beta1/query.rpc.Query.js';
import * as _152 from './staking/v1beta1/query.rpc.Query.js';
import * as _153 from './tx/v1beta1/service.rpc.Service.js';
import * as _154 from './upgrade/v1beta1/query.rpc.Query.js';
import * as _155 from './authz/v1beta1/tx.rpc.msg.js';
import * as _156 from './bank/v1beta1/tx.rpc.msg.js';
import * as _157 from './distribution/v1beta1/tx.rpc.msg.js';
import * as _158 from './feegrant/v1beta1/tx.rpc.msg.js';
import * as _159 from './gov/v1/tx.rpc.msg.js';
import * as _160 from './gov/v1beta1/tx.rpc.msg.js';
import * as _161 from './group/v1/tx.rpc.msg.js';
import * as _162 from './staking/v1beta1/tx.rpc.msg.js';
import * as _163 from './upgrade/v1beta1/tx.rpc.msg.js';
import * as _164 from './vesting/v1beta1/tx.rpc.msg.js';
import * as _180 from './rpc.query.js';
import * as _181 from './rpc.tx.js';
export namespace cosmos {
  export namespace auth {
    export const v1beta1 = {
      ..._18,
      ..._19,
      ..._20,
      ..._141,
    };
  }
  export namespace authz {
    export const v1beta1 = {
      ..._21,
      ..._22,
      ..._23,
      ..._24,
      ..._25,
      ..._142,
      ..._155,
    };
  }
  export namespace bank {
    export const v1beta1 = {
      ..._26,
      ..._27,
      ..._28,
      ..._29,
      ..._30,
      ..._143,
      ..._156,
    };
  }
  export namespace base {
    export namespace abci {
      export const v1beta1 = {
        ..._31,
      };
    }
    export namespace node {
      export const v1beta1 = {
        ..._32,
        ..._144,
      };
    }
    export namespace query {
      export const v1beta1 = {
        ..._33,
      };
    }
    export namespace reflection {
      export const v2alpha1 = {
        ..._34,
      };
    }
    export const v1beta1 = {
      ..._35,
    };
  }
  export namespace crypto {
    export const ed25519 = {
      ..._36,
    };
    export namespace hd {
      export const v1 = {
        ..._37,
      };
    }
    export namespace keyring {
      export const v1 = {
        ..._38,
      };
    }
    export const multisig = {
      ..._39,
    };
    export const secp256k1 = {
      ..._40,
    };
    export const secp256r1 = {
      ..._41,
    };
  }
  export namespace distribution {
    export const v1beta1 = {
      ..._42,
      ..._43,
      ..._44,
      ..._45,
      ..._145,
      ..._157,
    };
  }
  export namespace feegrant {
    export const v1beta1 = {
      ..._46,
      ..._47,
      ..._48,
      ..._49,
      ..._146,
      ..._158,
    };
  }
  export namespace gov {
    export const v1 = {
      ..._50,
      ..._51,
      ..._52,
      ..._53,
      ..._147,
      ..._159,
    };
    export const v1beta1 = {
      ..._54,
      ..._55,
      ..._56,
      ..._57,
      ..._148,
      ..._160,
    };
  }
  export namespace group {
    export const v1 = {
      ..._58,
      ..._59,
      ..._60,
      ..._61,
      ..._62,
      ..._149,
      ..._161,
    };
  }
  export namespace mint {
    export const v1beta1 = {
      ..._63,
      ..._64,
      ..._65,
      ..._150,
    };
  }
  export namespace params {
    export const v1beta1 = {
      ..._66,
      ..._67,
      ..._151,
    };
  }
  export namespace staking {
    export const v1beta1 = {
      ..._68,
      ..._69,
      ..._70,
      ..._71,
      ..._72,
      ..._152,
      ..._162,
    };
  }
  export namespace tx {
    export namespace signing {
      export const v1beta1 = {
        ..._73,
      };
    }
    export const v1beta1 = {
      ..._74,
      ..._75,
      ..._153,
    };
  }
  export namespace upgrade {
    export const v1beta1 = {
      ..._76,
      ..._77,
      ..._78,
      ..._154,
      ..._163,
    };
  }
  export namespace vesting {
    export const v1beta1 = {
      ..._79,
      ..._80,
      ..._164,
    };
  }
  export const ClientFactory = {
    ..._180,
    ..._181,
  };
}
