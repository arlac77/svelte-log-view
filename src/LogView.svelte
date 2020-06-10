<script>
  import { onMount } from "svelte";

  export let source;

  let lines = [];

  onMount(async () => {
    for await (const line of source) {
      lines.push(line);
      lines = lines; // force reactive
    }
  });
</script>

<div class="log">
  {#each lines as line, i (i)}
    <div>{line}</div>
  {/each}
</div>
