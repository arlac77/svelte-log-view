<script>
  import { onMount } from "svelte";
  import { LogView, lineIterator } from "../../src/index.svelte";

  async function lines() {
    const response = await fetch("/api/log");
    return lineIterator(response.body.getReader());
  }
</script>

<div id="log">
  {#await lines()}
    <p>...waiting</p>
  {:then source}
    <LogView {source} />
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>
