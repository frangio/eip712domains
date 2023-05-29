export * from './generic';

import * as generic from './generic';

import { createPublicClient, http } from 'viem';

export function createEIP712Client(url: string) {
  const publicClient = createPublicClient({
    batch: { multicall: true },
    transport: http(url),
  });
  return generic.createEIP712Client(publicClient);
}
