export * from './common';

import { getAddress, getContract, ContractFunctionExecutionError, type PublicClient } from 'viem';
import { type EIP712Domain, type ERC5267Marker, type ERC5267Client, erc5267 } from './common';
import { buildDomain, hashDomain } from './utils';

export function createERC5267Client(client: PublicClient): ERC5267Client {
  return {
    async getEIP712Domain(address) {
      const verifyingContract = getAddress(address);

      const contract = getContract({
        address: verifyingContract,
        abi,
        client,
      });

      const eip5267Descriptor = await contract.read.eip712Domain().catch(async e => {
        if (e instanceof ContractFunctionExecutionError) {
          return undefined;
        } else {
          throw e;
        }
      });

      if (eip5267Descriptor) {
        const domain: EIP712Domain & ERC5267Marker = buildDomain(...eip5267Descriptor);
        domain[erc5267] = true;
        return domain;
      } else {
        const [domainSeparator1, domainSeparator2, domainTypehash, name, version, chainId] = await Promise.all([
          contract.read.DOMAIN_SEPARATOR().catch(() => undefined),
          contract.read.domainSeparator().catch(() => undefined),
          contract.read.DOMAIN_TYPEHASH().catch(() => undefined),
          contract.read.name().catch(() => undefined),
          contract.read.version().catch(() => undefined),
          client.getChainId(),
        ]);

        const domainSeparator = domainSeparator1 ?? domainSeparator2;

        if (domainSeparator) {
          for (const domain of guessDomains({ name, version, verifyingContract, chainId })) {
            const guessedDomainSeparator = hashDomain(domain);
            if (guessedDomainSeparator === domainSeparator) {
              return domain;
            }
          }
        }

        switch (domainTypehash) {
          case '0x8cad95687ba82c2ce50e74f7b754645e5117c3a5bec8151c0726d5857980a866':
            // keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)")
            return { name, chainId, verifyingContract };
        }
      }
    },
  };
}

function* guessDomains({ name, version, verifyingContract, chainId }: EIP712Domain): Generator<EIP712Domain> {
  if (verifyingContract?.toLowerCase() === '0x000000000022d473030f116ddee9f6b43ac78ba3') {
    yield { name: 'Permit2', chainId, verifyingContract };
  }

  if (name !== undefined) {
    if (version) {
      yield { name, version, chainId, verifyingContract };
    } else {
      for (const version of ['1', '2']) {
        yield { name, version, chainId, verifyingContract };
      }
    }
  }

  yield { chainId, verifyingContract };
  yield { verifyingContract };
}

const abi = [
  {
    name: 'eip712Domain',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        type: 'bytes1',
        name: 'fields',
      },
      {
        type: 'string',
        name: 'name',
      },
      {
        type: 'string',
        name: 'version',
      },
      {
        type: 'uint256',
        name: 'chainId',
      },
      {
        type: 'address',
        name: 'verifyingContract',
      },
      {
        type: 'bytes32',
        name: 'salt',
      },
      {
        type: 'uint256[]',
        name: 'extension',
      },
    ],
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        type: 'string',
      },
    ],
  },
  {
    name: 'version',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        type: 'string',
      },
    ],
  },
  {
    name: 'DOMAIN_SEPARATOR',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        type: 'bytes32',
      },
    ],
  },
  {
    name: 'domainSeparator',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        type: 'bytes32',
      },
    ],
  },
  {
    name: 'DOMAIN_TYPEHASH',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        type: 'bytes32',
      },
    ],
  },
] as const;
