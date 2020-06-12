<script>
  import { onMount, tick } from "svelte";

  export let source;
  export let height = "100%";
  export let lineHeight = undefined;

  export let start = 0;
  export let end = 0;

  let viewport;
  let contents;
  let rows;

  let viewportHeight = 0;
  let mounted;

  let top = 0;
  let bottom = 0;

  let lines = [];
  let visible = lines;

  onMount(async () => {
    mounted = true;
    rows = contents.getElementsByTagName("svelte-virtual-list-row");

    for await (const line of source) {
      lines.push(line);
      visible = lines;
    }
  });

  $: if (mounted) refresh(lines, viewportHeight, lineHeight);

  async function refresh(items, viewportHeight, lineHeight) {
    const { scrollTop } = viewport;
    await tick();

    /*
    let content_height = top - scrollTop;
    let i = start;
    while (content_height < viewportHeight && i < lines.length) {
      let row = rows[i - start];
      if (!row) {
        end = i + 1;
        await tick();
        row = rows[i - start];
      }
      const row_height = (height_map[i] = lineHeight || row.offsetHeight);
      content_height += row_height;
      i += 1;
    }
    end = i;
    const remaining = items.length - end;
    average_height = (top + content_height) / end;
    bottom = remaining * average_height;
    height_map.length = items.length;
    */
  }

  async function handleScroll() {
    const { scrollTop } = viewport;
  }
</script>

<style>
  svelte-virtual-list-viewport {
    position: relative;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    display: block;
  }
  svelte-virtual-list-contents,
  svelte-virtual-list-row {
    display: block;
  }
  svelte-virtual-list-row {
    overflow: hidden;
  }
</style>

<svelte-virtual-list-viewport
  bind:this={viewport}
  bind:offsetHeight={viewportHeight}
  on:scroll={handleScroll}
  style="height: {height};">
  <svelte-virtual-list-contents
    bind:this={contents}
    style="padding-top: {top}px; padding-bottom: {bottom}px;">
    {#each visible as line, i (i)}
      <svelte-virtual-list-row><slot line={line}/></svelte-virtual-list-row>
    {/each}
  </svelte-virtual-list-contents>
</svelte-virtual-list-viewport>
