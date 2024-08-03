<script>
  import { lineIterator } from "reader-line-iterator";
  import { LogView } from "../../../src/index.svelte";
  import { api } from "./constants.mjs";

  let controller = new AbortController();

  if (!localStorage.logSource) {
    localStorage.logSource = api;
  }

  let logSource = $state(localStorage.logSource);
  $effect(() => localStorage.logSource = logSource);

  let offsetRows = $state(0);
  let follow = $state(true);
  let selected = $state(-1);

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

      if(cursor) {
        const lineNumber = parseInt(cursor.substring(5));
        params.cursor = offset >= 0 ? lineNumber + 1 : lineNumber;
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

</script>

{#snippet row(entry,selected,position,follow)}
  <div class={selected === position ? "selected" : ""}>{entry}</div>
{/snippet}

<div id="log">
  <LogView
    visibleRows={10}
    {source}
    bind:selected
    bind:follow
    bind:offsetRows
    {row}
  >
  </LogView>
</div>
<div>
  <p id="offsetRows">{offsetRows}</p>
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
