<script>
  import { onMount, onDestroy } from "svelte";

  export let source;
  export let height = "100%";
  export let visibleRows = 1000000;
  export let entries = [];
  export let visible = entries;
  export let follow = true;
  export let selected = 0;
  export let start = 0;

  let contents;
  let rows;

  onDestroy(() => source.abort());

  onMount(async () => {
    rows = contents.getElementsByTagName("log-row");

    for await (const entry of source.fetch()) {
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

    if (selected > entries.length -1) {
      selected = entries.length - 1;
      start = entries.length - visibleRows;
    }
    if (selected < 0) {
      start = 0;
      const number = selected;
      selected = 0;
      for await (const entry of source.fetch(entries[0], number)) {
        entries.splice(0, 0, entry);
        visible = entries.slice(start, start + visibleRows);
      }
    }

    if (selected < start) {
      start = selected;
    }

    if (selected >= start + visibleRows) {
      start = selected - visibleRows + 1
    }

    visible = entries.slice(start, start + visibleRows);
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
  style="height: {height};">
  <log-contents bind:this={contents}>
    {#each visible as entry, i (i)}
      <log-row>
        <slot {entry} {selected} position={start + i} />
      </log-row>
    {/each}
  </log-contents>
</log-viewport>
