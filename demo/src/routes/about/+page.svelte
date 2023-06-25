<div class="[&_a]:underline space-y-4">
  <p>
  <a href="https://eips.ethereum.org/EIPS/eip-712">EIP-712</a> is a standard for encoding and signing structured data.
  The resulting signatures are each tied to a <em>domain</em> that must match with a contract's domain to be considered valid by it. Domains are not guaranteed to be unique. However, if a contract defines its domain properly, wallets can make use of the information to warn users of the potential consequences of a given signature.
  </p>

  <p>
  Applications that ask users to produce EIP-712 signatures need the full domain as recognized by the contract that will be consuming it. Unless the application only deals with known contracts and known domains, it needs a way to retrieve the domain for a contract. There is no mechanism defined in EIP-712 for this retrieval, so <a href="https://eips.ethereum.org/EIPS/eip-5267">ERC-5267</a> was developed to fill in that gap.
  </p>

  <p>
  This website and the <a href="https://github.com/frangio/eip712domains"><code>eip712domains</code></a> JavaScript library can help to retrieve the EIP-712 domain of an unknown contract. The domains of ERC-5267 contracts will be reliably recovered, whereas the domains for other contracts are recovered in a best-effort manner, some of it from a list of known domains and others by guessing.
  </p>

  <div>
    <img src={"/picture1.webp"} class="block w-2/3 m-auto my-20" alt="">
  </div>
</div>
