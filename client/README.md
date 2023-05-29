# ERC-5267 Client

Utilities for retrieval of EIP-712 domain via ERC-5267 with fallback logic.

```
npm install erc5267
```

## Usage

```typescript
import { createERC5267Client } from 'erc5257/http.js';

const { getEIP712Domain } = createERC5267Client('https://infura.io/...');

const domain = await getEIP712Domain(contractAddress);
```
