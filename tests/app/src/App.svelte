<script>
  import { lineIterator } from "reader-line-iterator";
  import { LogView } from "../../../src/index.svelte";

  async function* source(cursor, number) {
    const query = cursor ? `?cursor=` + cursor.substring(5) : '';
    const response = await fetch(number < 0 ? `/api/back/log${query}` : "/api/log");
    yield* lineIterator(response.body.getReader());
  }

  let start = 0;
  let follow = true;
  let selected = -1;
</script>

<style>
  .selected {
    background-color: antiquewhite;
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
    <div class={selected === i ? 'selected' : ''}>{entry}</div>
  </LogView>
</div>
<p id="start">{start}</p>
<p id="follow">{follow ? 'F' : '-'}</p>
