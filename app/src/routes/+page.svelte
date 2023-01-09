<script lang="ts">
  import { ethers } from 'ethers';
  import { getEIP712Domain, type EIP712Domain } from '$lib/eip-5267';
  import { isEthereum } from '$lib/is-ethereum';

  const cloudflare = 'https://cloudflare-eth.com';

  let rpc = cloudflare;

  const examples = {
    demo: {
      name: 'EIP-5267 Demo',
      address: '0x5cEE26B7b9C1057b5e7272a37e53884385437A96',
    },
    ens: {
      name: 'ENS',
      address: '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',
    },
    usdc: {
      name: 'USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    uni: {
      name: 'UNI',
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    },
    safe: {
      name: 'Gnosis Safe',
      address: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
    },
    wyvern: {
      name: 'OpenSea Wyvern',
      address: '0x7f268357A8c2552623316e2562D90e642bB538E5',
    },
  };

  let address = examples.demo.address;

  $: provider = new ethers.providers.JsonRpcProvider(rpc);

  $: eth = isEthereum(provider);

  $: domain = getEIP712Domain(address, provider);

  const stringifyDomain = (d: EIP712Domain) =>
    JSON.stringify(d, (k, v) => v.type === 'BigNumber' ? v.hex : v, 2);
</script>

<div class="m-2 space-y-4 max-w-md">
  <h1 class="font-bold text-xl">EIP-5267 Demo</h1>

  <p class="flex flex-col gap-2">
  <label class="contents">
    <span class="flex items-center">
      <span class="flex-1">JSON-RPC Provider</span>
      <button class:invisible={rpc === cloudflare} on:click={() => rpc = cloudflare}>
        <svg class="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z" />
        </svg>
      </button>
    </span>
    <input type="text" bind:value={rpc} class="border border-current px-2 py-1 w-full">
  </label>
  </p>

  <p class="flex flex-col gap-2">
  <label class="contents">
    <span class="flex items-center justify-between">
      <span class="flex-1">
        Contract Address
      </span>

      <a class:invisible={!$eth} href="https://etherscan.io/address/{address}" target="_blank" rel="noreferrer">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 293.775 293.671">
          <g id="etherscan-logo-circle" transform="translate(-219.378 -213.33)">
          <path id="Path_1" data-name="Path 1" d="M280.433,353.152A12.45,12.45,0,0,1,292.941,340.7l20.737.068a12.467,12.467,0,0,1,12.467,12.467v78.414c2.336-.692,5.332-1.43,8.614-2.2a10.389,10.389,0,0,0,8.009-10.11V322.073a12.469,12.469,0,0,1,12.468-12.47h20.778a12.469,12.469,0,0,1,12.467,12.467v90.279s5.2-2.106,10.269-4.245a10.408,10.408,0,0,0,6.353-9.577V290.9a12.466,12.466,0,0,1,12.466-12.467h20.778A12.468,12.468,0,0,1,450.815,290.9v88.625c18.014-13.055,36.271-28.758,50.759-47.639a20.926,20.926,0,0,0,3.185-19.537,146.6,146.6,0,0,0-136.644-99.006c-81.439-1.094-148.744,65.385-148.736,146.834a146.371,146.371,0,0,0,19.5,73.45,18.56,18.56,0,0,0,17.707,9.173c3.931-.346,8.825-.835,14.643-1.518a10.383,10.383,0,0,0,9.209-10.306V353.152" fill="#21325b"/>
          <path id="Path_2" data-name="Path 2" d="M244.417,398.641A146.808,146.808,0,0,0,477.589,279.9c0-3.381-.157-6.724-.383-10.049-53.642,80-152.686,117.4-232.79,128.793" transform="translate(35.564 80.269)" fill="#979695"/>
          </g>
        </svg>
      </a>
    </span>

    <input type="text" bind:value={address} class="border border-current px-2 py-1 w-full">
  </label>
  </p>

  <p class="flex flex-wrap gap-x-2">
  <span>Examples:</span>
  {#each Object.values(examples) as e}
    <label class="block hover:cursor-pointer">
      <input class="hidden peer" type="radio" bind:group={address} value={e.address}>
      <span class="peer-checked:underline">{e.name}</span>
    </label>
  {/each}
  </p>

  <p>
  {#await domain}
    Loading...
  {:then domain}
    <pre>{stringifyDomain(domain)}</pre>
  {:catch error}
    {error.message}
  {/await}
  </p>
</div>
