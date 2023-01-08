import type { ethers } from 'ethers';
import { writable, type Readable } from 'svelte/store';

export function isEthereum(provider: ethers.providers.Provider): Readable<boolean> {
  const { subscribe, set } = writable(false);
  provider.getNetwork().then(n => {
    if (n.chainId === 1) {
      set(true);
    }
  });
  return { subscribe };
}
