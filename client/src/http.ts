export * from './common';

import * as core from './viem';
import { http, createPublicClient } from 'viem';

export function createERC5267Client(url: string) {
  const transport = http(url, { batch: true });
  const publicClient = createPublicClient({ transport, batch: { multicall: true } });
  return core.createERC5267Client(publicClient);
}
