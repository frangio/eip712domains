import { ethers } from "ethers";
import type { BigNumber } from "ethers";

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
  `function DOMAIN_SEPARATOR() view returns (bytes32)`,
  `function name() view returns (string)`,
]);

export async function getEIP712Domain(address: string, provider: ethers.providers.Provider) {
  const contract = new ethers.Contract(address, iface, provider);
  const domainDescriptor: Parameters<typeof buildDomain> = await contract.eip712Domain();
  return buildDomain(...domainDescriptor);
}

const fieldNames = ['name', 'version', 'chainId', 'verifyingContract', 'salt'] as const;

/** Builds a domain object based on the values obtained by calling `eip712Domain()` in a contract. */
function buildDomain(
  fieldsString: string,
  name: string,
  version: string,
  chainId: BigNumber,
  verifyingContract: string,
  salt: string,
  extensions: unknown[],
) {
  if (extensions.length > 0) {
    throw Error("extensions not implemented");
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

