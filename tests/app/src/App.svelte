<script>
  import { LogView, lineIterator } from "../../../src/index.svelte";

  async function* source(cursor, number) {
    //if(cursor) { query = `?cursor=` + cursor.substring(5); }
    const response = await fetch(number < 0 ? "/api/back/log" : "/api/log");
    yield* lineIterator(response.body.getReader());
  }

  let start = 0;
  let follow = true;
  let selected = -1;
</script>

<style>
  #log {
    max-height: 200px;
    height: 200px;
  }
</style>

<div id="log">
  <LogView
    visibleRows={10}
    {source}
    let:entry
    let:selected
    let:i
    bind:follow
    bind:start>
    {#if selected === i}> {entry}{:else}{entry}{/if}
  </LogView>
</div>
<p id="start">{start}</p>
<p id="follow">{follow ? 'F' : '-'}</p>
