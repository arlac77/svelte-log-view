<script>
  import { onMount } from "svelte";

  export let source;
  export let start = 0;
  export let height = "100%";
  export let visibleRows = 1000000;
  export let entries = [];
  export let visible = entries;
  export let follow = true;
  export let selected = 0;

  let viewport;
  let contents;
  let rows;
  let viewportHeight = 0;

  onMount(async () => {
    rows = contents.getElementsByTagName("log-row");

    for await (const entry of source()) {
      entries.push(entry);

      if (entries.length <= visibleRows) {
        visible = entries;
      } else if (follow) {
        start++;
        visible = entries.slice(start);
      }
    }
  });

  async function refresh(firstLine) {
    if (selected > entries.length - visibleRows) {
      selected = entries.length - visibleRows;
    }
    if (selected < 0) {
      selected = 0;
    }

    if (firstLine > entries.length - visibleRows) {
      firstLine = entries.length - visibleRows;
    }
    if (firstLine < 0) {
      for await (const entry of source(entries[0], -1)) {
        entries.splice(0, 0, entry);

        if (firstLine++ === 0) {
          break;
        }
      }
      firstLine = 0;
    }

    start = firstLine;
    visible = entries.slice(start, start + visibleRows);
  }

  async function handleScroll() {
    const { scrollTop } = viewport;
    console.log("handleScroll", scrollTop, start, entries.length, rows.length);
  }

  function handleKeydown(event) {
    switch (event.key) {
      case "ArrowUp":
        selected--;
        refresh(start - 1);
        break;
      case "ArrowDown":
        selected++;

        refresh(start + 1);
        break;
      case "PageUp":
        selected -= visibleRows;

        refresh(start - visibleRows);
        break;
      case "PageDown":
        selected += visibleRows;

        refresh(start + visibleRows);
        break;
      case "G":
        selected = entries.length - visibleRows;

        refresh(entries.length - visibleRows);
        break;
      case "g":
        selected = 0;
        refresh(0);
        break;

      case "f":
        follow = !follow;
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
        <slot {entry} {selected} i={start + i} />
      </log-row>
    {/each}
  </log-contents>
</log-viewport>
