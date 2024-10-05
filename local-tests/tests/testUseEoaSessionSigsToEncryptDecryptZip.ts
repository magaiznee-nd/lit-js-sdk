import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import * as LitJsSdk from '@overdive/lit-node-client-nodejs';
import { ILitNodeClient, LitAbility } from '@overdive/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { LitAccessControlConditionResource } from '@overdive/auth-helpers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { log } from '@overdive/misc';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUseEoaSessionSigsToEncryptDecryptZip
 * ✅ NETWORK=manzano yarn test:local --filter=testUseEoaSessionSigsToEncryptDecryptZip
 * ✅ NETWORK=localchain yarn test:local --filter=testUseEoaSessionSigsToEncryptDecryptZip
 */
export const testUseEoaSessionSigsToEncryptDecryptZip = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  const message = 'Hello world';

  // set access control conditions for encrypting and decrypting
  const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
    userAddress: alice.wallet.address,
  });

  const encryptRes = await LitJsSdk.zipAndEncryptString(
    {
      accessControlConditions: accs,
      dataToEncrypt: message,
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

  const eoaSessionSigs2 = await getEoaSessionSigs(devEnv, alice, [
    {
      resource: new LitAccessControlConditionResource(accsResourceString),
      ability: LitAbility.AccessControlConditionDecryption,
    },
  ]);

  // -- Decrypt the encrypted string
  const decryptedZip = await LitJsSdk.decryptToZip(
    {
      accessControlConditions: accs,
      ciphertext: encryptRes.ciphertext,
      dataToEncryptHash: encryptRes.dataToEncryptHash,
      sessionSigs: eoaSessionSigs2,
      chain: 'ethereum',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  devEnv.releasePrivateKeyFromUser(alice);

  const decryptedMessage = await decryptedZip['string.txt'].async('string');

  if (message !== decryptedMessage) {
    throw new Error(
      `decryptedMessage should be ${message} but received ${decryptedMessage}`
    );
  }

  console.log('decryptedMessage:', decryptedMessage);
};
