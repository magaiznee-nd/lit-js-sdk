import { LIT_ENDPOINT_VERSION } from '@overdive/constants';
import { LIT_TESTNET } from 'local-tests/setup/tinny-config';
import { getInvalidLitActionIpfsSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUseInvalidLitActionIpfsCodeToGenerateSessionSigs
 * ❌ NOT AVAILABLE IN MANZANO
 * ✅ NETWORK=localchain yarn test:local --filter=testUseInvalidLitActionIpfsCodeToGenerateSessionSigs
 */
export const testUseInvalidLitActionIpfsCodeToGenerateSessionSigs = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  try {
    await getInvalidLitActionIpfsSessionSigs(devEnv, alice);
  } catch (e: any) {
    console.log('❌ THIS IS EXPECTED: ', e);

    if (e.message === 'An error related to validation has occured.') {
      console.log(
        '✅ testUseInvalidLitActionIpfsCodeToGenerateSessionSigs is expected to have an error'
      );
    } else {
      throw e;
    }
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
