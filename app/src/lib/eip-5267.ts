import { ethers } from "ethers";
import type { BigNumber } from "ethers";

export interface EIP712Domain {
  name?: string,
  version?: string,
  chainId?: number | BigNumber,
  verifyingContract?: string,
  salt?: string,
}

const iface = new ethers.utils.Interface([
  `function eip712Domain() view returns (
       bytes1 fields,
       string memory name,
       string memory version,
       uint256 chainId,
       address verifyingContract,
       bytes32 salt,
       uint256[] memory extension
  )`,
  `function name() view returns (string)`,
  `function version() view returns (string)`,
  `function DOMAIN_SEPARATOR() view returns (bytes32)`,
  `function domainSeparator() view returns (bytes32)`,
  `function DOMAIN_TYPEHASH() view returns (bytes32)`,
]);

export async function getEIP712Domain(address: string, provider: ethers.providers.Provider) {
  const contract = new ethers.Contract(address, iface, provider);
  try {
    const domainDescriptor: Parameters<typeof buildDomain> = await contract.eip712Domain();
    return buildDomain(...domainDescriptor);
  } catch (e) {
    const verifyingContract = contract.address;

    const [domainSeparator1, domainSeparator2, domainTypehash, name, version, { chainId }] = await Promise.all([
      contract.DOMAIN_SEPARATOR().catch(() => undefined),
      contract.domainSeparator().catch(() => undefined),
      contract.DOMAIN_TYPEHASH().catch(() => undefined),
      contract.name().catch(() => undefined),
      contract.version().catch(() => undefined),
      provider.getNetwork(),
    ]);

    // non-standard getter
    const domainSeparator = domainSeparator1 ?? domainSeparator2;

    if (domainSeparator) {
      for (const domain of guessDomains({ name, version, verifyingContract, chainId })) {
        const guessedDomainSeparator = ethers.utils._TypedDataEncoder.hashDomain(domain);
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

    throw new Error(`Can't obtain EIP712 domain`);
  }
}

const fieldNames = ['name', 'version', 'chainId', 'verifyingContract', 'salt'] as const;

/** Builds a domain object based on the values obtained by calling `eip712Domain()` in a contract. */
function buildDomain(
  fieldsString: string,
  name: string,
  version: string,
  chainId: BigNumber | number,
  verifyingContract: string,
  salt: string,
  extensions: unknown[],
): EIP712Domain {
  if (extensions.length > 0) {
    throw Error("extensions not implemented");
  }

  if (ethers.BigNumber.isBigNumber(chainId)) {
    chainId = chainId.toNumber();
  }

  const fields = Number(fieldsString);
  const domain = { name, version, chainId, verifyingContract, salt };

  for (const [i, field] of fieldNames.entries()) {
    if (!(fields & (1 << i))) {
      delete domain[field];
    }
  }

  return domain;
}

function* guessDomains({ name, version, verifyingContract, chainId }: EIP712Domain): Generator<EIP712Domain> {
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
