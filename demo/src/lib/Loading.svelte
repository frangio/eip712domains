<script lang="ts">
  import { onMount } from "svelte";

  const interval = 500;
  const max = 3;
  const dot = "·";

  let num = 0;

  onMount(function loop() {
    setTimeout(() => {
      num = num % max + 1;
      loop();
    }, interval);
  });
</script>
<span>{dot.repeat(num)}</span>
