<script>
  import { lineIterator } from "reader-line-iterator";
  import { LogView } from "../../../src/index.svelte";

  async function* source(cursor, number) {
    const params = {
      number
    };

    if (cursor) {
      params.cursor = cursor.substring(5);
    }

    const search = Object.entries(params)
      .map(([k, v]) => `${k}${v === undefined ? "" : "=" + escape(v)}`)
      .join("&");

    const response = await fetch(`/api/log?${search}`);
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
    let:position
    bind:selected
    bind:follow
    bind:start>
    <div class={selected === position ? 'selected' : ''}>{entry}</div>
  </LogView>
</div>
<p id="start">{start}</p>
<p id="selected">{selected}</p>
<p id="follow">{follow ? 'F' : '-'}</p>
