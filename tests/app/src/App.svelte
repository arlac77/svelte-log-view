<script>
  import { lineIterator } from "reader-line-iterator";
  import { LogView } from "../../../src/index.svelte";

  let controller = new AbortController();

  const source = {
    abort: async () => controller.abort(),

    fetch: async function * f(cursor, number) {

        if(controller) {
          controller.abort();
        }

        controller = new AbortController();

        const params = {
          number
        };

        if (cursor) {
          params.cursor = cursor.substring(5);
        }

        const search = Object.entries(params)
          .map(([k, v]) => `${k}${v === undefined ? "" : "=" + escape(v)}`)
          .join("&");

        try {
          const response = await fetch(`/api/log?${search}`, {
            signal: controller.signal
          });

          yield * lineIterator(response.body.getReader());
        } catch (e) {
          if (!e instanceof AbortSignal) {
            throw e;
          }
        }
      }
  };

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
