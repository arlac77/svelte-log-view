<script>
  import { onMount, tick } from "svelte";

  export let source;
  export let height = "100%";
  export let lineHeight = 10;

  let start = 0;
  let end = 0;

  let viewport;
  let contents;
  let rows;

  let viewportHeight = 0;
  let mounted;

  let lines = [];
  let visible = lines;

  onMount(async () => {
    mounted = true;
    rows = contents.getElementsByTagName("log-row");

    for await (const line of source) {
      lines.push(line);
      visible = lines;
    }
  });

  $: if (mounted) refresh();

  async function refresh() {
    const { scrollTop } = viewport;
    await tick();

    console.log("refresh", start, end, lines.length, rows.length);
  }

  async function handleScroll() {
    const { scrollTop } = viewport;
    console.log("handleScroll", scrollTop);
  }

  function handleKeydown(event) {
    switch (event.keyCode) {
      case 8:
      case 37:
      case 75:
        if(start > 0) {
          start--;
          refresh();
        }
        break;
      case 32:
      case 39:
      case 74:
        start++;
        refresh();
        break;

      case 71: // 'G' show last lines
        start = lines.length - 10;
        refresh();
        break;

      case 103: // 'g' show first lines
        start = 0;
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
