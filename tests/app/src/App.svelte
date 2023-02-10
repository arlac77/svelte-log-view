<script>
  import { lineIterator } from "reader-line-iterator";
  import { LogView } from "../../../src/index.svelte";
  import { api } from "./constants.mjs";

  let controller = new AbortController();

  if (!localStorage.logSource) {
    localStorage.logSource = api;
  }

  let logSource = localStorage.logSource;

  $: {
    localStorage.logSource = logSource;
  }

  const source = {
    abort: async () => controller.abort(),
    fetch: async function* (cursor, offset = 0, number = 20) {
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
          `${logSource}?${new URLSearchParams(Object.entries(params))}`,
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
    bind:start
  >
    <div class={selected === position ? "selected" : ""}>{entry}</div>
  </LogView>
</div>
<div>
  <p id="start">{start}</p>
  <p id="selected">{selected}</p>
  <p id="follow">{follow ? "F" : "-"}</p>
  <fieldset>
    <label for="url">
      Logging API
      <input
        type="url"
        name="url"
        id="url"
        placeholder="https://example.com"
        pattern="http?://.*"
        size="60"
        required
        bind:value={logSource}
      />
    </label>
  </fieldset>
</div>
