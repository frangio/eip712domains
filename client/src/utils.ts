import { hexToNumber, keccak256, encodeAbiParameters, stringToBytes, concat } from 'viem/utils';
import type { Hex, EIP712Domain } from './common';
import type { AbiParameter } from 'abitype';

const domainFieldTypes = new Map([
  ['name', 'string'],
  ['version', 'string'],
  ['chainId', 'uint256'],
  ['verifyingContract', 'address'],
  ['salt', 'bytes32'],
] as const);

export const domainFieldNames = Object.freeze([...domainFieldTypes.keys()]);

/** Builds a domain object based on the values obtained by calling `eip712Domain()` in a contract. */
export function buildDomain(
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

  for (const [i, field] of domainFieldNames.entries()) {
    if (!(fields & (1 << i))) {
      delete domain[field];
    }
  }

  return domain;
}

export function hashDomain(domain: EIP712Domain) {
  const domainParams: string[] = [];
  const encodeParams: AbiParameter[] = [];
  const values: unknown[] = [];

  for (const [field, type] of domainFieldTypes.entries()) {
    if (domain[field] !== undefined) {
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
