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
    rows = contents.getElementsByTagName("virtual-list-row");

    for await (const line of source) {
      lines.push(line);
      visible = lines;
    }
  });

  $: if (mounted) refresh(lines);

  async function refresh(items, first) {
    const { scrollTop } = viewport;
    await tick();

    console.log("refresh", start, end, items.length, rows.length);

    let contentHeight = 0 - scrollTop;

    for (end = start; end < rows.length && contentHeight < viewportHeight; end++, contentHeight += lineHeight) {
      let row = rows[end - start];
      if(!row) {
        await tick();
        line = rows[end - start];

        console.log(lineHeight, end);
      }
    }
  }

  async function handleScroll() {
    const { scrollTop } = viewport;
    console.log("handleScroll", scrollTop);
  }

  function handleKeydown(event) {
    //console.log(event.keyCode);
    switch (event.keyCode) {
      case 8:
      case 37:
      case 75:
        // entriesLoadPrevious();
        break;
      case 32:
      case 39:
      case 74:
        //  entriesLoadNext();
        break;

      case 71: // 'G' show last lines
        start = lines.length - 10;
        refresh(lines);
        break;

      case 103: // 'g' show first lines
        start = 0;
        refresh(lines);
        break;
    }
  }
</script>

<style>
  virtual-list-viewport {
    position: relative;
    overflow-y: auto;
    display: block;
  }
  virtual-list-contents,
  virtual-list-row {
    display: block;
  }
  virtual-list-row {
    overflow: hidden;
  }
</style>

<svelte:window on:keydown={handleKeydown} />
<virtual-list-viewport
  bind:this={viewport}
  bind:offsetHeight={viewportHeight}
  on:scroll={handleScroll}
  style="height: {height};">

  <virtual-list-contents bind:this={contents}>
    {#each visible as line, i (i)}
      <virtual-list-row>
        <slot {line} />
      </virtual-list-row>
    {/each}
  </virtual-list-contents>
</virtual-list-viewport>
