import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test bundle speed
 * @param devEnv
 */
export const testBundleSpeed = async (devEnv: TinnyEnvironment) => {
  const a = await import('@overdive/lit-node-client');
  const b = await import('@overdive/contracts-sdk');
  const c = await import('@overdive/auth-helpers');
  const d = await import('@overdive/constants');
  const e = await import('@overdive/lit-auth-client');

  console.log(a, b, c, d, e);
};
