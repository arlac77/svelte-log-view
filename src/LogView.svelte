<script>
  import { onMount } from "svelte";

  export let source;

  let lines = [];

  onMount(async () => {
    for await (const line of source) {
      lines = lines.concat(line);
    }
  });
</script>

<div class="log">
  {#each lines as line}
    <div>{line}</div>
  {/each}
</div>
