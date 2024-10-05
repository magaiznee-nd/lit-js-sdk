import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@overdive/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { randomSolanaPrivateKey } from 'local-tests/setup/tinny-utils';
import { AuthSig, SessionSigsMap } from '@overdive/types';

const { importPrivateKey } = api;

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testFailImportWrappedKeysWithInvalidSessionSig
 * ✅ NETWORK=manzano yarn test:local --filter=testFailImportWrappedKeysWithInvalidSessionSig
 * ✅ NETWORK=localchain yarn test:local --filter=testFailImportWrappedKeysWithInvalidSessionSig
 */
export const testFailImportWrappedKeysWithInvalidSessionSig = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  try {
    const pkpSessionSigs = await getPkpSessionSigs(devEnv, alice);

    try {
      const privateKey = randomSolanaPrivateKey();

      await importPrivateKey({
        pkpSessionSigs: tamperPkpSessionSigs(pkpSessionSigs),
        privateKey,
        litNodeClient: devEnv.litNodeClient,
        publicKey: '0xdeadbeef',
        keyType: 'K256',
        memo: 'Test key',
      });
    } catch (e: any) {
      if (e.message.includes('bad public key size')) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailImportWrappedKeysWithInvalidSessionSig is expected to have an error'
        );
      } else {
        throw e;
      }
    }

    console.log('✅ testFailImportWrappedKeysWithInvalidSessionSig');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};

const tamperPkpSessionSigs = (
  pkpSessionSig: SessionSigsMap
): SessionSigsMap => {
  const tamperedPkpSessionSigs: SessionSigsMap = {};

  for (const key in pkpSessionSig) {
    if (pkpSessionSig.hasOwnProperty(key)) {
      const authSig = pkpSessionSig[key];
      const updatedAuthSig: AuthSig = {
        ...authSig,
        address: authSig.address.slice(0, -1),
      };
      tamperedPkpSessionSigs[key] = updatedAuthSig;
    }
  }

  // console.log(tamperedPkpSessionSigs);

  return tamperedPkpSessionSigs;
};
