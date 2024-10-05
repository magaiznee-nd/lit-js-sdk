import * as _LitNodeClient from './lib/lit-node-client';

const LitNodeClient = _LitNodeClient.LitNodeClient;
if (!globalThis.LitNodeClient) {
  globalThis.LitNodeClient = LitNodeClient;
}

// ==================== Exports ====================

export * from './lib/lit-node-client';

export {
  checkAndSignAuthMessage,
  ethConnect,
  disconnectWeb3,
} from '@overdive/auth-browser';

export * from '@overdive/lit-node-client-nodejs';
