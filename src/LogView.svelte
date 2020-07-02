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

  async function refresh(items) {
    const { scrollTop } = viewport;
    await tick();

    let contentHeight = - scrollTop;

    console.log("refresh", contentHeight, items.length, rows.length);

    /*    
    let i = start;
    while (contentHeight < viewportHeight && i < rows.length) {
      let row = rows[i - start];
      if (!row) {
        end = i + 1;
        await tick();
        line = rows[i - start];
      }
      contentHeight += lineHeight;
      i += 1;
    }
    end = i;
    const remaining = items.length - end;
    */
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
        break;

      case 103: // 'g' show first lines
        break;
    }
  }
</script>

<style>
  virtual-list-viewport {
    position: relative;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
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

<svelte:window on:keydown={handleKeydown}/>
<virtual-list-viewport
  bind:this={viewport}
  bind:offsetHeight={viewportHeight}
  on:scroll={handleScroll}
  style="height: {height};">

  <virtual-list-contents
    bind:this={contents}>
    {#each visible as line, i (i)}
      <virtual-list-row>
        <slot {line} />
      </virtual-list-row>
    {/each}
  </virtual-list-contents>
</virtual-list-viewport>
