export * from './common';

import * as core from './viem';
import { custom, createPublicClient } from 'viem'

interface EthersProvider {
  call(req: unknown): Promise<string>;
  getNetwork(): Promise<{ chainId: bigint }>;
}

export function createERC5267Client(ethersProvider: EthersProvider) {
  const transport = ethersTransport(ethersProvider);
  const publicClient = createPublicClient({ transport });
  return core.createERC5267Client(publicClient);
}

function ethersTransport(ethersProvider: EthersProvider) {
  return custom({
    async request({ method, params }) {
      switch (method) {
        case 'eth_call': {
          return ethersProvider.call({ ...params[0], blockTag: params[1] });
        }
        case 'eth_chainId': {
          const result = await ethersProvider.getNetwork();
          return result.chainId;
        }
        default:
          throw new Error(`Unsupported EIP-1193 method '${method}'`);
      }
    },
  });
}
