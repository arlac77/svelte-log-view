<script>
  import { onMount } from "svelte";
  import { LogView, lineIterator } from "../../src/index.svelte";

  async function lines() {
    const response = await fetch("/api/log");
    return lineIterator(response.body.getReader());
  }

  let start = -1;
</script>

<style>
  #log {
    max-height: 200px;
    height: 200px;
  }
</style>

<div id="log">
  {#await lines()}
    <p>...waiting</p>
  {:then source}
    <LogView {source} let:entry bind:start>{entry}</LogView>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>
<p>showing {start}</p>
