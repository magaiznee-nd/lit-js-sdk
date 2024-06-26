import { encryptString } from '@lit-protocol/encryption';

import { LIT_PREFIX } from '../constants';
import { storePrivateKeyMetadata } from '../service-client';
import { ImportPrivateKeyParams } from '../types';
import {
  getFirstSessionSig,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
} from '../utils';

/**
 * Import a provided private key into the wrapped keys service backend.
 * First, the key is pre-pended with `LIT_PREFIX` for security reasons, then the salted key is encrypted and stored in the backend service.
 * The key will be associated with the PKP address embedded in the `pkpSessionSigs` you provide. One and only one wrapped key can be associated with a given LIT PKP.
 *
 * @param { ImportPrivateKeyParams } params The parameters required to import the private key into the wrapped keys backend service
 *
 * @returns { Promise<string> } - The LIT PKP Address associated with the Wrapped Key
 */
export async function importPrivateKey(
  params: ImportPrivateKeyParams
): Promise<string> {
  const { pkpSessionSigs, privateKey, address, keyType, litNodeClient } =
    params;

  const firstSessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(firstSessionSig);
  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

  const saltedPrivateKey = LIT_PREFIX + privateKey;

  const { ciphertext, dataToEncryptHash } = await encryptString(
    {
      accessControlConditions: [allowPkpAddressToDecrypt],
      dataToEncrypt: saltedPrivateKey,
    },
    litNodeClient
  );

  await storePrivateKeyMetadata({
    sessionSig: firstSessionSig,
    litNodeClient,
    storedKeyMetadata: {
      ciphertext,
      address,
      keyType,
      dataToEncryptHash,
      pkpAddress,
    },
  });

  return pkpAddress;
}
