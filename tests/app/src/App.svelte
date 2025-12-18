<script>
  import { lineIterator } from "reader-line-iterator";
  import { LogView } from "../../../src/index.svelte";
  import { api } from "./constants.mjs";

  let innerHeight = $state(window.innerHeight);

  let controller = new AbortController();

  if (!localStorage.logSource) {
    localStorage.logSource = api;
  }

  let logSource = $state(localStorage.logSource);
  $effect(() => (localStorage.logSource = logSource));

  let visibleEntries = $derived(Math.floor((innerHeight - 250) / 23));
  let offsetEntries = $state(0);
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

      if (cursor) {
        const lineNumber = parseInt(cursor.substring(5));
        params.cursor = offset >= 0 ? lineNumber + 1 : lineNumber - 1;
      }

      try {
        const response = await fetch(
          `${logSource}?${new URLSearchParams(Object.entries(params))}`,
          {
            headers: {
              Accept: "text/plain"
            },
            signal: controller.signal
          }
        );

        yield* lineIterator(response.body.getReader());
      } catch (e) {
        if ((!e) instanceof AbortSignal) {
          throw e;
        }
      }
    }
  };
</script>

<svelte:window 
	bind:innerHeight
  />

{#snippet row(entry, selected, position, follow)}
  <div class={selected === position ? "selected" : ""}>{entry}</div>
{/snippet}

<div id="log">
  <LogView
    {source}
    bind:visibleEntries
    bind:selected
    bind:follow
    bind:offsetEntries
    maxBufferedEntries={80}
    {row}
  ></LogView>
</div>
<div>
  <fieldset>
    <legend>log view properties</legend>
    <label for="offsetEntries">
      Offset rows
      <input
        type="number"
        name="offsetEntries"
        id="offsetEntries"
        bind:value={offsetEntries}
      />
    </label>
    <label for="selected">
      Selected row
      <input
        type="number"
        name="selected"
        id="selected"
        bind:value={selected}
      />
    </label>
    <label for="visibleEntries">
      Visible rows
      <input
        type="number"
        name="visibleEntries"
        id="visibleEntries"
        bind:value={visibleEntries}
      />
    </label>
    <label for="follow">
      Follow
      <input type="checkbox" name="follow" id="follow" bind:checked={follow} />
    </label>
  </fieldset>
  <fieldset>
    <legend>data source</legend>
    <label for="url">
      data source api endpoint
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
