<script>
  import "../app.css";
  import { dev } from "$app/environment";
  import { inject } from "@vercel/analytics";

  inject({ mode: dev ? "development" : "production" });
</script>

<svelte:head>
<title>EIP-712 Domain Helper</title>
</svelte:head>

<div class="max-w-lg space-y-8 p-2 pt-4 mx-auto">
  <div class="space-y-2">
    <h1 class="font-bold text-2xl">
      <a href="/">EIP-712 Domain Helper</a>
    </h1>

    <div class="space-x-2 [&>a:hover]:underline">
      <a href="/about" data-sveltekit-preload-data>About</a>
      <a href="https://github.com/frangio/eip712domains">Source</a>
    </div>
  </div>

  <slot />
</div>
