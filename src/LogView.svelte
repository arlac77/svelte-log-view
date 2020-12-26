<script>
  import { onMount, onDestroy } from "svelte";

  export let source;
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
    fetchFollow();
  });

  async function fetchFollow() {
    let current;
    if (entries.length > 0) {
      current = entries[entries.length - 1];
    }

    for await (const entry of source.fetch(current, 1)) {
      entries.push(entry);

      if (entries.length <= visibleRows) {
        visible = entries;
      } else {
        if (!follow) {
          visible = entries.slice(start, visibleRows);
        }
      }

      if (follow) {
        setSelected(entries.length - 1);
      }
    }


    follow = false;
  }

  async function setSelected(toBeSelected) {
    selected = toBeSelected;

    if (selected > entries.length - 1) {
      selected = entries.length - 1;
      start = entries.length - visibleRows;
    }
    if (selected < 0) {
      const cursor = entries[0];

      let number = 5;
      let i;

      for (i = 0; i < number; i++) {
        entries.unshift(undefined);
      }

      selected += number;
      start += number;

      i = 0;
      for await (const entry of source.fetch(cursor, -number, number)) {
        entries[i++] = entry;
        if (i >= number) {
          break;
        }
        visible = entries.slice(start, start + visibleRows);
      }
    }

    if (selected < start) {
      start = selected;
    }

    if (selected >= start + visibleRows) {
      start = selected - visibleRows + 1;
    }

    visible = entries.slice(start, start + visibleRows);
  }

  function setFollow(flag) {
    if (follow === flag) {
      return;
    }

    if (flag) {
      fetchFollow();
    } else {
      source.abort();
    }

    follow = flag;
  }

  function handleKeydown(event) {
    switch (event.key) {
      case "ArrowUp":
        setFollow(false);
        setSelected(selected - 1);
        break;
      case "ArrowDown":
        setFollow(false);
        setSelected(selected + 1);
        break;
      case "PageUp":
        setFollow(false);
        setSelected(selected - visibleRows);
        break;
      case "PageDown":
        setFollow(false);
        setSelected(selected + visibleRows);
        break;
      case "G":
        setFollow(false);
        setSelected(entries.length - 1);
        break;
      case "g":
        setFollow(false);
        setSelected(0);
        break;

      case "f":
        setFollow(!follow);
        break;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />
<log-contents bind:this={contents}>
  {#each visible as entry, i (i)}
    <log-row>
      <slot {entry} {selected} position={start + i} />
    </log-row>
  {/each}
</log-contents>
