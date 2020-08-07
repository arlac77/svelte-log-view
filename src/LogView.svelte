<script>
  import { onMount, tick } from "svelte";

  export let source;
  export let start = 0;
  export let entries = [];
  export let visible = entries;

  const height = "100%";

  let viewport;
  let contents;
  let rows;
  let viewportHeight = 0;

  onMount(async () => {
    rows = contents.getElementsByTagName("log-row");

    for await (const entry of source) {
      entries.push(entry);
      visible = entries;

      //console.log("onMount", start, entries.length, rows.length);
    }
  });

  async function refresh() {
    const { scrollTop } = viewport;
    console.log("refresh", scrollTop, start, entries.length, rows.length);
  }

  async function handleScroll() {
    const { scrollTop } = viewport;
    console.log("handleScroll", scrollTop, start, entries.length, rows.length);
  }

  function handleKeydown(event) {
    switch (event.keyCode) {
      case 8:
      case 37:
      case 75:
        if (start > 0) {
          start--;
          visible = entries.slice(start, start + rows.length);
          refresh();
        }
        break;
      case 32:
      case 39:
      case 74:
        start++;
        visible = entries.slice(start, start + rows.length);
        refresh();
        break;

      case 71: // 'G' show last entries
        start = entries.length - rows.length;
        visible = entries.slice(start);
        refresh();
        break;

      case 103: // 'g' show first entries
        start = 0;
        visible = entries.slice(start, rows.length);
        refresh();
        break;
    }
  }
</script>

<style>
  log-viewport {
    position: relative;
    overflow-y: auto;
    display: block;
  }
  log-contents,
  log-row {
    display: block;
  }
  log-row {
    overflow: hidden;
  }
</style>

<svelte:window on:keydown={handleKeydown} />
<log-viewport
  bind:this={viewport}
  bind:offsetHeight={viewportHeight}
  on:scroll={handleScroll}
  style="height: {height};">
  <log-contents bind:this={contents}>
    {#each visible as entry, i (i)}
      <log-row>
        <slot {entry} />
      </log-row>
    {/each}
  </log-contents>
</log-viewport>
