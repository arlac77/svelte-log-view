<script>
  import { onMount, tick } from "svelte";

  export let source;
  export let start = 0;
  export let height = "100%";
  export let visibleRows = 1000000;
  export let entries = [];
  export let visible = entries;
  export let follow = true;

  let viewport;
  let contents;
  let rows;
  let viewportHeight = 0;

  onMount(async () => {
    rows = contents.getElementsByTagName("log-row");

    for await (const entry of source) {
      entries.push(entry);

      if (entries.length <= visibleRows) {
        visible = entries;
      } else if (follow) {
        start++;
        visible = entries.slice(start);
      }
    }
  });

  async function refresh(skip) {
    if (skip > entries.length - visibleRows) {
      skip = entries.length - visibleRows;
    }
    if (skip < 0) {
      skip = 0;
    }

    start = skip;
    visible = entries.slice(start, start + visibleRows);

    // console.log("refresh", scrollTop, start, entries.length, rows.length);
  }

  async function handleScroll() {
    const { scrollTop } = viewport;
    console.log("handleScroll", scrollTop, start, entries.length, rows.length);
  }

  function handleKeydown(event) {
    console.log(event.key);
    switch (event.key) {
      case "ArrowUp":
        refresh(start - 1);
        break;
      case "ArrowDown":
        refresh(start + 1);
        break;
      case "PageUp":
        refresh(start - visibleRows);
        break;
      case "PageDown":
        refresh(start + visibleRows);
        break;
      case "G":
        refresh(entries.length - visibleRows);
        break;
      case "g":
        refresh(0);
        break;

      case "f":
        follow = !follow;
        if(follow) {
          refresh(entries.length - visibleRows);
        }
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
