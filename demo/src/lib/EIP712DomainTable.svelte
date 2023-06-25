<script lang="ts">
  import { domainFieldNames, erc5267, type EIP712DomainWithMarker } from "eip712domains/viem";
  import { fade } from "svelte/transition";
  import CopyIcon from "$lib/octicons/Copy.svelte";
  import CheckIcon from "$lib/octicons/Check.svelte";
  import Star from "$lib/octicons/Star.svelte";
  import XIcon from "$lib/octicons/X.svelte";

  export let domain: EIP712DomainWithMarker;

  const displayFieldName = (field: string) => {
    switch (field) {
      case "verifyingContract":
        return "Verifier";
      case "chainId":
        return "Chain ID";
      default:
        return field.replace(/^./, c => c.toUpperCase());
      }
  }


  const getFields = (d: EIP712DomainWithMarker) => domainFieldNames.filter(f => f in d);

  const stringifyDomain = (d: EIP712DomainWithMarker) =>
    JSON.stringify(d, (k, v) => typeof v === "bigint" ? "0x" + v.toString(16) : v, 2);

  let copied: unknown;
  const handleCopy = () => {
    navigator.clipboard.writeText(stringifyDomain(domain));
    copied = domain;
  };
</script>

<div class="w-full border rounded">
  <table class="w-full table-auto border-collapse">
    {#each getFields(domain) as field}
      <tr class="divide-x border-b">
        <td class="px-2 py-1">{displayFieldName(field)}</td>
        <td class="px-2 py-1">{domain[field]}</td>
      </tr>
    {/each}
  </table>

  <div class="text-sm flex">
    {#if domain[erc5267]}
      <div class="p-2 flex gap-2 items-center">
        <Star size="1em" />
        EIP-5267
      </div>
    {/if}
    <button class="p-2 ml-auto flex gap-2 items-center" on:click={handleCopy}>
      {#if copied === domain}
        <div in:fade>
          <CheckIcon size="1em" />
        </div>
      {:else}
        <CopyIcon size="1em" />
      {/if}
      <span>Copy JSON</span>
    </button>
  </div>
</div>
