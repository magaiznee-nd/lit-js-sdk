import 'cross-fetch/dist/node-polyfill.js';

import * as _LitNodeClientNodeJs from './lib/lit-node-client-nodejs';
// ==================== Environment ====================

declare global {
  // This `declare global` hackery _must_ use var to work.
  // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
  var LitNodeClientNodeJs: any;
}

const LitNodeClientNodeJs = _LitNodeClientNodeJs.LitNodeClientNodeJs;
if (!globalThis.LitNodeClientNodeJs) {
  globalThis.LitNodeClientNodeJs = LitNodeClientNodeJs;
}

// ==================== Exports ====================
export * from './lib/lit-node-client-nodejs';

export {
  decryptToFile,
  decryptFromJson,
  decryptToString,
  decryptToZip,
  decryptZipFileWithMetadata,
  encryptFile,
  encryptFileAndZipWithMetadata,
  encryptToJson,
  encryptString,
  encryptZip,
  verifyJwt,
  zipAndEncryptFiles,
  zipAndEncryptString,
} from '@overdive/encryption';

export {
  hashResourceIdForSigning,
  humanizeAccessControlConditions,
} from '@overdive/access-control-conditions';

export {
  base64StringToBlob,
  blobToBase64String,
} from '@overdive/misc-browser';

export {
  uint8arrayFromString,
  uint8arrayToString,
} from '@overdive/uint8arrays';
