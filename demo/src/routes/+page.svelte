<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { browser } from "$app/environment";
  import { assets } from "$app/paths";
  import { page } from "$app/stores";
  import { erc5267, createERC5267Client, type EIP712Domain, type EIP712DomainWithMarker, type ERC5267Client } from "eip712domains/viem";
  import { type PublicClient, isAddress } from "viem";
  import type { Chain } from "viem/chains";
  import { promiseStore, type PromiseStore } from "$lib/promise-store.ts";
  import GlobeIcon from "$lib/octicons/Globe.svelte";
  import AlertIcon from "$lib/octicons/Alert.svelte";
  import NetworkSelect, { type NetworkName } from "$lib/NetworkSelect.svelte";
  import Loading from "$lib/Loading.svelte";
  import EIP712DomainTable from "$lib/EIP712DomainTable.svelte";

  const initialRpc = $page.url.searchParams.get("rpc") ?? undefined;

  let network: NetworkName;
  let chain: Chain;

  const examples = {
    demo: {
      name: "ERC-5267",
      address: "0x5cEE26B7b9C1057b5e7272a37e53884385437A96",
    },
    ens: {
      name: "ENS",
      address: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
    },
    usdc: {
      name: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    },
    uni: {
      name: "UNI",
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    },
    safe: {
      name: "Safe",
      address: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
    },
    wyvern: {
      name: "Wyvern",
      address: "0x7f268357A8c2552623316e2562D90e642bB538E5",
    },
    permit2: {
      name: "Permit2",
      address: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    },
  };

  let address = examples.demo.address;

  let publicClient: PublicClient | undefined, erc5267Client: ERC5267Client | undefined;

  $: if (publicClient) {
    erc5267Client = createERC5267Client(publicClient);
  }

  const domain: PromiseStore<EIP712DomainWithMarker> = promiseStore({
    name: "EIP5267Demo",
    version: "1",
    chainId: 1n,
    verifyingContract: "0x5cEE26B7b9C1057b5e7272a37e53884385437A96",
    [erc5267]: true,
  });

  $: if (erc5267Client) {
    if (isAddress(address)) {
      domain.load(
        erc5267Client.getEIP712Domain(address).then(async d => {
          if (d === undefined) {
            throw { message: "Could not retrieve domain." }
          } else {
            return d;
          }
        })
      );
    }
  }
</script>

<div class="flex flex-col gap-2">
  <input type="text" class="ring-red-100" class:ring={address && !isAddress(address)} bind:value={address} on:focus={e => e.currentTarget.select()}>

  <div class="flex gap-1 items-center justify-between text-sm">
    {#if chain?.blockExplorers?.default}
      <a class="px-2" href="{chain.blockExplorers.default.url}/address/{address}" target="_blank" rel="noreferrer">
        <GlobeIcon width="1em" height="1em" />
      </a>
    {/if}
    <NetworkSelect {initialRpc} bind:network bind:chain bind:publicClient />
  </div>
</div>

<div class="flex flex-col min-h-[20rem] justify-between">
  <div class="relative">
    {#if $domain.loading}
      <div class="absolute inset-0" transition:fade>
        <div class="absolute inset-0 flex items-end justify-center bg-sliding">
          <span class="p-2 text-sm">
            <Loading />
          </span>
        </div>
      </div>
    {/if}
    {#if $domain.error}
      <div class="px-2 py-1 flex items-center gap-2 rounded border bg-amber-50 border-amber-200">
        <span class="inline-block fill-amber-400"><AlertIcon /></span>
        {$domain.error.shortMessage || $domain.error.message}
      </div>
    {:else}
      <EIP712DomainTable domain={$domain.last} />
    {/if}
  </div>

  <p class="flex flex-wrap gap-x-2">
  <span>Examples:</span>
  {#each Object.values(examples) as e}
    <label class="block hover:cursor-pointer">
      <input class="hidden peer" type="radio" bind:group={address} value={e.address} on:change={() => network = "mainnet"}>
      <span class="peer-checked:underline">{e.name}</span>
    </label>
  {/each}
  </p>
</div>
