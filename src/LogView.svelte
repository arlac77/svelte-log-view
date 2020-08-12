<script>
  import { onMount, tick } from "svelte";

  export let source;
  export let start = 0;
  export let height = "100%";
  export let visibleRows = 1000000;
  export let entries = [];
  export let visible = entries;

  let viewport;
  let contents;
  let rows;
  let viewportHeight = 0;

  onMount(async () => {
    rows = contents.getElementsByTagName("log-row");

    for await (const entry of source) {
      entries.push(entry);

      if(entries.length <= visibleRows) {
        visible = entries;
      }
      else {
        start++;
        visible = entries.slice(start);
      }

      //console.log("onMount", start, entries.length, rows.length);
    }
  });

  async function refresh(skip) {
    const { scrollTop } = viewport;
    start = skip;
    visible = entries.slice(start, start + visibleRows);

   // console.log("refresh", scrollTop, start, entries.length, rows.length);
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
          refresh( start -1);
        }
        break;
      case 32:
      case 39:
      case 74:
        refresh( start + 1);
        break;

      case 71: // 'G' show last entries
        refresh(entries.length - visibleRows);
        break;

      case 103: // 'g' show first entries
        refresh(0);
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
