<script>
  import { onMount } from "svelte";

  export let source;
  export let height = "100%";
  export let visibleRows = 1000000;
  export let entries = [];
  export let visible = entries;
  export let follow = true;
  export let selected = 0;
  export let start = 0;

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
      } else {
        if (!follow) {
          visible = entries.slice(start, visibleRows);
        }
      }

      if (follow) {
        refresh(entries.length - 1);
      }
    }
  });

  async function refresh(toBeSelected) {
    selected = toBeSelected;

    if (selected > entries.length) {
      selected = entries.length - 1;
      start = entries.length - visibleRows;
    }
    if (selected < 0) {
      start = 0;

      for await (const entry of source(entries[0], -1)) {
        entries.splice(0, 0, entry);

        if (selected++ === 0) {
          break;
        }
      }

      selected = 0;
    }

    if (selected < start) {
      start = selected;
    }

    if (selected >= start + visibleRows) {
      start = selected - visibleRows + 1
    }

    visible = entries.slice(start, start + visibleRows);
  }

  async function handleScroll() {
    const { scrollTop } = viewport;
    console.log("handleScroll", scrollTop, start, entries.length, rows.length);
  }

  function handleKeydown(event) {
    switch (event.key) {
      case "ArrowUp":
        refresh(selected - 1);
        break;
      case "ArrowDown":
        refresh(selected + 1);
        break;
      case "PageUp":
        refresh(selected - visibleRows);
        break;
      case "PageDown":
        refresh(selected + visibleRows);
        break;
      case "G":
        refresh(entries.length - 1);
        break;
      case "g":
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
