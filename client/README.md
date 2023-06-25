# EIP-712 Domain Helper

A helper for retrieval of the EIP-712 domain of a contract. Uses [ERC-5267] with fallback to known domains or guided guessing.

[ERC-5267]: https://eips.ethereum.com/EIPS/eip-5267

```
npm install eip712domains
```

## Usage

```javascript
// (1) Create an EIP-712 Domain Client

// (1a) Viem
import { createEIP712DomainClient } from 'eip712domains/viem';
const { getEIP712Domain } = createEIP712DomainClient(publicClient);

// (1b) Ethers
import { createEIP712DomainClient } from 'eip712domains/ethers';
const { getEIP712Domain } = createEIP712DomainClient(provider);

// (1c) HTTP
import { createEIP712DomainClient } from 'eip712domains/http';
const { getEIP712Domain } = createEIP712DomainClient('https://infura.io/...');

// (2) Get the domain for a contract address
const domain = await getEIP712Domain(contractAddress);

if (domain === undefined) {
    // Handle unavailable domain
}

// (3) Request a signature

// (3a) Viem
const signature = await walletClient.signTypedData({ domain, ... });

// (3b) Ethers
const signature = await signer.signTypedData(domain, ...);
```
