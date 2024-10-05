import { LitActionResource, LitPKPResource } from '@overdive/auth-helpers';
import { LitAbility, LitResourceAbilityRequest } from '@overdive/types';
import { log } from '@overdive/misc';
import { CENTRALISATION_BY_NETWORK, LitNetwork } from '@overdive/constants';
import { TinnyEnvironment } from '../tinny-environment';
import { TinnyPerson } from '../tinny-person';

export const getPkpSessionSigs = async (
  devEnv: TinnyEnvironment,
  alice: TinnyPerson,
  resourceAbilityRequests?: LitResourceAbilityRequest[],
  expiration?: string
) => {
  const centralisation =
    CENTRALISATION_BY_NETWORK[devEnv.litNodeClient.config.litNetwork];

  if (centralisation === 'decentralised') {
    console.warn(
      'Decentralised network detected. Adding superCapacityDelegationAuthSig to eoaSessionSigs'
    );
  }

  // Use default resourceAbilityRequests if not provided
  const _resourceAbilityRequests = resourceAbilityRequests || [
    {
      resource: new LitPKPResource('*'),
      ability: LitAbility.PKPSigning,
    },
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.LitActionExecution,
    },
  ];

  const pkpSessionSigs = await devEnv.litNodeClient.getPkpSessionSigs({
    pkpPublicKey: alice.authMethodOwnedPkp.publicKey,
    authMethods: [alice.authMethod],
    expiration,
    resourceAbilityRequests: _resourceAbilityRequests,

    ...(centralisation === 'decentralised' && {
      capabilityAuthSigs: [devEnv.superCapacityDelegationAuthSig],
    }),
  });

  log('[getPkpSessionSigs]: ', pkpSessionSigs);

  return pkpSessionSigs;
};
