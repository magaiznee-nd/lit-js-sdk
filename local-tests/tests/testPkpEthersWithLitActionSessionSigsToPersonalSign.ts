import { PKPEthersWallet, ethRequestHandler } from '@overdive/pkp-ethers';
import { ethers } from 'ethers';
import { getLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToPersonalSign
 * ✅ NETWORK=manzano yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToPersonalSign
 * ✅ NETWORK=localchain yarn test:local --filter=testPkpEthersWithLitActionSessionSigsToPersonalSign
 */
export const testPkpEthersWithLitActionSessionSigsToPersonalSign = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  const litActionSessionSigs = await getLitActionSessionSigs(devEnv, alice);

  const pkpEthersWallet = new PKPEthersWallet({
    litNodeClient: devEnv.litNodeClient,
    pkpPubKey: alice.pkp.publicKey,
    controllerSessionSigs: litActionSessionSigs,
  });

  await pkpEthersWallet.init();

  // -- personal_sign parameters
  try {
    // Message to sign
    const message = 'Free the web';
    const hexMsg = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));

    // personal_sign parameters
    // DATA, N Bytes - message to sign.
    // DATA, 20 Bytes - address
    // Reference: https://metamask.github.io/api-playground/api-documentation/#personal_sign
    const signature = await ethRequestHandler({
      signer: pkpEthersWallet,
      payload: {
        method: 'personal_sign',
        params: [hexMsg, alice.pkp.ethAddress],
      },
    });

    const recoveredAddr = ethers.utils.verifyMessage(message, signature);

    // ==================== Post-Validation ====================
    if (signature.length !== 132) {
      throw new Error('❌ signature should be 132 characters long');
    }

    if (recoveredAddr !== alice.pkp.ethAddress) {
      throw new Error(
        `❌ recoveredAddr should be ${alice.pkp.ethAddress} but got ${recoveredAddr}`
      );
    }

    console.log('✅ personal_sign recoveredAddr:', recoveredAddr);
  } catch (e) {
    throw new Error('❌ Error: ' + e.message);
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
