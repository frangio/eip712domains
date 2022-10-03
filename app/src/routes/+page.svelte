<script lang="ts">
  import { ethers } from 'ethers';
  import { getEIP712Domain } from '$lib/eip-5267';

  let rpc = 'https://cloudflare-eth.com';
  let address = '0x5cEE26B7b9C1057b5e7272a37e53884385437A96';

  $: provider = new ethers.providers.JsonRpcProvider(rpc);

  $: domain = getEIP712Domain(address, provider);

  const stringifyDomain = (d: typeof domain) =>
    JSON.stringify(d, (k, v) => v.type === 'BigNumber' ? v.hex : v, 2);
</script>

<div class="m-2 space-y-4 max-w-md">
  <h1 class="font-bold text-xl">EIP-5267 Demo</h1>

  <p class="flex flex-col gap-2">
  <label class="contents">
    <span>JSON-RPC Provider</span>
    <input type="text" bind:value={rpc} class="border border-current px-2 py-1 w-full">
  </label>
  </p>

  <p class="flex flex-col gap-2">
  <label class="contents">
    <span>Contract Address</span>
    <input type="text" bind:value={address} class="border border-current px-2 py-1 w-full">
  </label>
  </p>

  <p>
  {#await domain}
    Loading
  {:then domain}
    <pre>{stringifyDomain(domain)}</pre>
  {:catch error}
    {error.message}
  {/await}
  </p>
</div>
