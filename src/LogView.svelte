<script>
  import { onMount, tick } from "svelte";

  export let source;
  export let lineHeight = 10;

  const height = "100%";

  let viewport;
  let contents;
  let rows;
  let viewportHeight = 0;

  let start = 0;
  const lines = [];
  let visible = lines;

  onMount(async () => {
    rows = contents.getElementsByTagName("log-row");

    for await (const line of source) {
      lines.push(line);
      visible = lines;

      //console.log("onMount", start, lines.length, rows.length);
    }
  });

  async function refresh() {
    const { scrollTop } = viewport;
    console.log("refresh", scrollTop, start, lines.length, rows.length);
  }

  async function handleScroll() {
    const { scrollTop } = viewport;
    console.log("handleScroll", scrollTop, start, lines.length, rows.length);
  }

  function handleKeydown(event) {
    switch (event.keyCode) {
      case 8:
      case 37:
      case 75:
        if (start > 0) {
          start--;
          visible = lines.slice(start, start + rows.length);
          refresh();
        }
        break;
      case 32:
      case 39:
      case 74:
        start++;
        visible = lines.slice(start, start + rows.length);
        refresh();
        break;

      case 71: // 'G' show last lines
        start = lines.length - rows.length;
        visible = lines.slice(start);
        refresh();
        break;

      case 103: // 'g' show first lines
        start = 0;
        visible = lines.slice(start, rows.length);
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
    {#each visible as line, i (i)}
      <log-row>
        <slot {line} />
      </log-row>
    {/each}
  </log-contents>
</log-viewport>
