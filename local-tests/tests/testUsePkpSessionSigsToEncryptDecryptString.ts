import * as LitJsSdk from '@overdive/lit-node-client-nodejs';
import { ILitNodeClient, LitAbility } from '@overdive/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { LitAccessControlConditionResource } from '@overdive/auth-helpers';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { log } from '@overdive/misc';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUsePkpSessionSigsToEncryptDecryptString
 * ✅ NETWORK=manzano yarn test:local --filter=testUsePkpSessionSigsToEncryptDecryptString
 * ✅ NETWORK=localchain yarn test:local --filter=testUsePkpSessionSigsToEncryptDecryptString
 */
export const testUsePkpSessionSigsToEncryptDecryptString = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  // set access control conditions for encrypting and decrypting
  const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
    userAddress: alice.authMethodOwnedPkp.ethAddress,
  });

  const encryptRes = await LitJsSdk.encryptString(
    {
      accessControlConditions: accs,
      dataToEncrypt: 'Hello world',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  log('encryptRes:', encryptRes);

  // -- Expected output:
  // {
  //   ciphertext: "pSP1Rq4xdyLBzSghZ3DtTtHp2UL7/z45U2JDOQho/WXjd2ntr4IS8BJfqJ7TC2U4CmktrvbVT3edoXJgFqsE7vy9uNrBUyUSTuUdHLfDVMIgh4a7fqMxsdQdkWZjHign3JOaVBihtOjAF5VthVena28D",
  //   dataToEncryptHash: "64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c",
  // }

  // -- assertions
  if (!encryptRes.ciphertext) {
    throw new Error(`Expected "ciphertext" in encryptRes`);
  }

  if (!encryptRes.dataToEncryptHash) {
    throw new Error(`Expected "dataToEncryptHash" to in encryptRes`);
  }

  const accsResourceString =
    await LitAccessControlConditionResource.generateResourceString(
      accs,
      encryptRes.dataToEncryptHash
    );

  const pkpSessionSigs2 = await getPkpSessionSigs(devEnv, alice, [
    {
      resource: new LitAccessControlConditionResource(accsResourceString),
      ability: LitAbility.AccessControlConditionDecryption,
    },
  ]);

  // -- Decrypt the encrypted string
  const decryptRes = await LitJsSdk.decryptToString(
    {
      accessControlConditions: accs,
      ciphertext: encryptRes.ciphertext,
      dataToEncryptHash: encryptRes.dataToEncryptHash,
      sessionSigs: pkpSessionSigs2,
      chain: 'ethereum',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  devEnv.releasePrivateKeyFromUser(alice);

  if (decryptRes !== 'Hello world') {
    throw new Error(
      `Expected decryptRes to be 'Hello world' but got ${decryptRes}`
    );
  }
};
