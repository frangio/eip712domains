import {
  getAddress,
  getContract,
  hexToNumber,
  type Hex,
  type PublicClient,
  ContractFunctionExecutionError,
  keccak256,
  encodeAbiParameters,
  stringToBytes,
  concat,
} from 'viem';

import type { AbiParameter } from 'abitype';

export const eip5267 = Symbol('EIP-5267');

export interface EIP712Domain {
  name?: string;
  version?: string;
  chainId?: number | bigint;
  verifyingContract?: Hex;
  salt?: Hex;
  [eip5267]?: boolean;
}

export interface EIP712Client {
  getDomain(address: string): Promise<EIP712Domain>;
}

export function createEIP712Client(publicClient: PublicClient): EIP712Client {
  return {
    async getDomain(address) {
      const verifyingContract = getAddress(address);

      const contract = getContract({
        address: verifyingContract,
        abi,
        publicClient,
      });
      try {
        const eip5267Descriptor = await contract.read.eip712Domain();
        const domain = buildDomain(...eip5267Descriptor);
        domain[eip5267] = true;
        return domain;
      } catch (e: unknown) {
        if (e instanceof ContractFunctionExecutionError) {
          const [domainSeparator1, domainSeparator2, domainTypehash, name, version, chainId] = await Promise.all([
            contract.read.DOMAIN_SEPARATOR().catch(() => undefined),
            contract.read.domainSeparator().catch(() => undefined),
            contract.read.DOMAIN_TYPEHASH().catch(() => undefined),
            contract.read.name().catch(() => undefined),
            contract.read.version().catch(() => undefined),
            publicClient.getChainId(),
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

          throw new Error(`Not EIP-5267 and could not reconstruct EIP-712 domain.`);
        } else {
          throw e;
        }
      }
    },
  };
}

const fieldNames = [
  'name',
  'version',
  'chainId',
  'verifyingContract',
  'salt',
] as const;

const fieldTypes = {
  name: 'string',
  version: 'string',
  chainId: 'uint256',
  verifyingContract: 'address',
  salt: 'bytes32',
} as const;

/** Builds a domain object based on the values obtained by calling `eip712Domain()` in a contract. */
function buildDomain(
  fieldsHex: Hex,
  name: string,
  version: string,
  chainId: bigint,
  verifyingContract: Hex,
  salt: Hex,
  extensions: readonly unknown[]
): EIP712Domain {
  if (extensions.length > 0) {
    throw Error('extensions not implemented');
  }

  const fields = hexToNumber(fieldsHex);
  const domain: EIP712Domain = {
    name,
    version,
    chainId,
    verifyingContract,
    salt,
  };

  for (const [i, field] of fieldNames.entries()) {
    if (!(fields & (1 << i))) {
      delete domain[field];
    }
  }

  return domain;
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

export function hashDomain(domain: EIP712Domain) {
  const domainParams: string[] = [];
  const encodeParams: AbiParameter[] = [];
  const values: unknown[] = [];

  for (const field of fieldNames) {
    if (field in domain) {
      const type = fieldTypes[field];
      domainParams.push(`${type} ${field}`);
      if (type === 'string') {
        encodeParams.push({ type: 'bytes32' });
        values.push(keccak256(stringToBytes(domain[field] as string)));
      } else {
        encodeParams.push({ type });
        values.push(domain[field]);
      }
    }
  }

  return keccak256(
    concat([
      keccak256(stringToBytes(`EIP712Domain(${domainParams.join(',')})`)),
      encodeAbiParameters(encodeParams, values),
    ]),
  );
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
