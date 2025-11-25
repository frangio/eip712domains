<script lang="ts" context="module">
  const shownChains = [
    { group: "Mainnets", chains: ["mainnet", "arbitrum", "optimism", "polygon", "zksync", "gnosis", "bsc"] },
    { group: "Testnets", chains: ["sepolia", "goerli", "arbitrumGoerli", "optimismGoerli", "polygonMumbai", "zksyncSepoliaTestnet", "gnosisChiado", "bscTestnet"] },
    { group: "Local", chains: ["localhost", "hardhat", "foundry"] },
  ] as const;

  type ChainName = typeof shownChains[number]["chains"][number];
  export type NetworkName = ChainName | "custom";
</script>

<script lang="ts">
  import { tick } from "svelte";
  import { browser } from "$app/environment";
  import { createPublicClient, http, type PublicClient, type Chain } from "viem";
  import * as chains from "viem/chains";
  import XIcon from "$lib/octicons/X.svelte";
  import { isHttpUrl } from "$lib/is-http-url.ts";

  export let initialRpc: string | undefined;

  let rpc: string;
  
  if (initialRpc !== undefined) {
    rpc = initialRpc;
  }

  let selectedChain: ChainName = "mainnet";

  export let network: NetworkName = initialRpc !== undefined ? "custom" : selectedChain;

  $: if (network !== "custom") {
    selectedChain = network;
    rpc = chains[network].rpcUrls.default.http[0];
  }

  export let chain: Chain | undefined;
  $: chain = network === "custom" ? undefined : chains[network];

  export let publicClient: PublicClient | undefined;
  $: if (browser && isHttpUrl(rpc)) publicClient = createPublicClient({
    chain,
    transport: http(rpc),
    batch: { multicall: true },
  });

  let customInput: HTMLInputElement;

  const handleChange = async () => {
    if (network === "custom") {
      await tick();
      customInput?.select();
    }
  };
</script>

<div class="w-full">
  {#if network === "custom"}
    <div class="flex">
      <input type="text" bind:value={rpc} bind:this={customInput} class="flex-grow px-2 py-1 text-[length:inherit]" on:focus={e => e.currentTarget.select()}>
      <button class="px-2" on:click={() => network = selectedChain}><XIcon size="1em" /></button>
    </div>
  {:else}
    <select bind:value={network} class="py-1 block ml-auto border-transparent text-last-right text-[length:inherit] focus:ring-0" on:change={handleChange}>
      {#each shownChains as g}
        <optgroup label={g.group}>
          {#each g.chains as c}
            <option value={c}>{chains[c].name}</option>
          {/each}
        </optgroup>
      {/each}
      <option value="custom">Custom RPC</option>
    </select>
  {/if}
</div>
