<script>
  import { lineIterator } from "reader-line-iterator";
  import { LogView } from "../../../src/index.svelte";
  import { api } from "./constants.mjs";

  let controller = new AbortController();

  let logView;
  function handleResize() {
    logView.height = (window.innerHeight - 100) + "px";

    //console.log(logView.height);
  }

  if (!localStorage.logSource) {
    localStorage.logSource = api;
  }

  let logSource = $state(localStorage.logSource);
  $effect(() => (localStorage.logSource = logSource));

  let offsetEntries = $state(0);
  let follow = $state(false);
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

<svelte:window on:resize={handleResize} />


{#snippet entryElement(entry, selected, position, follow)}
  <div class={selected === position ? "selected" : ""}>{entry}</div>
{/snippet}

<LogView
  bind:this={logView}
  {source}
  bind:selected
  bind:follow
  bind:offsetEntries
  maxBufferedEntries={80} {entryElement}
></LogView>
<div>
  <form>
    <fieldset>
      <legend>log view properties</legend>
      <label for="offsetEntries">
        <span>Offset entries</span>
        <input
          type="number"
          name="offsetEntries"
          id="offsetEntries"
          bind:value={offsetEntries}
        />
      </label>
      <label for="selected">
        <span>Selected entry</span>
        <input
          type="number"
          name="selected"
          id="selected"
          bind:value={selected}
        />
      </label>
      <!--<label for="visibleEntries">
      <span>Visible entries</span>
      <input
        type="number"
        name="visibleEntries"
        id="visibleEntries"
        bind:value={visibleEntries}
      />
    </label>-->
      <label for="follow">
        <span>Follow</span>
        <input
          type="checkbox"
          name="follow"
          id="follow"
          bind:checked={follow}
        />
      </label>
    </fieldset>
    <fieldset>
      <legend>data source</legend>
      <label for="url">
        <span>data source api endpoint</span>
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
  </form>
</div>

