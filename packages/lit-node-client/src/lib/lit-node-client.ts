import { checkAndSignAuthMessage } from '@overdive/auth-browser';
import { EITHER_TYPE } from '@overdive/constants';
import { LitNodeClientNodeJs } from '@overdive/lit-node-client-nodejs';
import { isNode, log } from '@overdive/misc';
import { getStorageItem } from '@overdive/misc-browser';
import { CustomNetwork, LitNodeClientConfig } from '@overdive/types';

/**
 * You can find all these available networks in the `constants` package
 *
 * @example
 *
 * ```
 * import { LitNetwork } from '@overdive/constants';
 * 
 * const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.Habanero,
   });
 * ```
 */
export class LitNodeClient extends LitNodeClientNodeJs {
  constructor(args: LitNodeClientConfig | CustomNetwork) {
    super({
      ...args,
      defaultAuthCallback: checkAndSignAuthMessage,
    });

    // -- override configs
    this._overrideConfigsFromLocalStorage();
  }

  /**
   *
   * (Browser Only) Get the config from browser local storage and override default config
   *
   * @returns { void }
   *
   */
  private _overrideConfigsFromLocalStorage = (): void => {
    if (isNode()) return;

    const storageKey = 'LitNodeClientConfig';
    const storageConfigOrError = getStorageItem(storageKey);

    // -- validate
    if (storageConfigOrError.type === EITHER_TYPE.ERROR) {
      log(`Storage key "${storageKey}" is missing. `);
      return;
    }

    // -- execute
    const storageConfig = JSON.parse(storageConfigOrError.result as string);
    // this.config = override(this.config, storageConfig);
    this.config = { ...this.config, ...storageConfig };
  };
}
