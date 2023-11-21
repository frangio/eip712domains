export type Hex = `0x${string}`;

export interface EIP712Domain {
  name?: string;
  version?: string;
  chainId?: number;
  verifyingContract?: Hex;
  salt?: Hex;
}

export const erc5267 = Symbol('ERC-5267');

export interface ERC5267Marker {
  [erc5267]?: boolean;
}

export type EIP712DomainWithMarker = EIP712Domain & ERC5267Marker;

export interface ERC5267Client {
  getEIP712Domain(address: string): Promise<EIP712Domain & ERC5267Marker | undefined>;
}

export { domainFieldNames } from './utils';
