<script>
  import * as style from "./main.css";
  import { lineIterator } from "reader-line-iterator";
  import { LogView } from "../../../src/index.svelte";

  let controller = new AbortController();

  const source = {
    abort: async () => controller.abort(),
    fetch: async function* (cursor, offset, number) {
      if (controller) {
        controller.abort();
      }

      controller = new AbortController();

      const params = {
        offset,
        number
      };

      if (cursor) {
        params.cursor = cursor.substring(5);
      }

      try {
        const response = await fetch(
          `/api/log?${new URLSearchParams(Object.entries(params))}`,
          {
            signal: controller.signal
          }
        );

        yield* lineIterator(response.body.getReader());
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
