<script>
  import { onDestroy } from "svelte";

  /**
   *   line 1    |                
   *   line 2    | -> offsetRows
   * ----------
   * | line 4 |  |
   * | line 5 |  | -> visibleRows
   * | line 5 |  |
   * ----------
   *   line 6
   */

  let {
    source,                /** data source */
    visibleRows = 24,      /** number of rows in the dom */
    offsetRows = $bindable(0),  /** number of rows from the top to the 1st. visible */
    follow = $bindable(true),
    selected = $bindable(0),
    fetchAboveRows = 2,    /** number of rows to fetch if scrolling upwards into the void */
    row
  } = $props();

  let entries = [];
  let visible = $state(entries);
  let content;

  onDestroy(() => source.abort());

  let done = false;

  $effect(() => {
    if(!done) {
      fetchFollow();
      done = true;
    }
	});

  async function fetchFollow() {
    let current;
    if (entries.length > 0) {
      current = entries[entries.length - 1];
    }

    do {
      for await (const entry of source.fetch(current)) {
        entries.push(entry);

        if (entries.length <= visibleRows) {
          visible = entries;
        } else {
          if (!follow) {
            visible = entries.slice(offsetRows, visibleRows);
          }
        }

        if (follow) {
          setSelected(entries.length - 1);

          current = entries[entries.length - 1];
        }
      }
    } while (follow);
  }

  async function setSelected(toBeSelected) {
    selected = toBeSelected;

    if (selected > entries.length - 1) {
      selected = entries.length - 1;
      offsetRows = entries.length - visibleRows;
    }

    if (selected < 0) {
      const cursor = entries[0];

      for (let i = 0; i < fetchAboveRows; i++) {
        entries.unshift();
      }

      selected += fetchAboveRows;
      offsetRows += fetchAboveRows;

      let i = 0;
      for await (const entry of source.fetch(cursor, -fetchAboveRows, fetchAboveRows)) {
        entries[i++] = entry;
        if (i >= fetchAboveRows) {
          break;
        }
      }
    }

    if (selected < offsetRows) {
      offsetRows = selected;
    }

    if (selected >= offsetRows + visibleRows) {
      offsetRows = selected - visibleRows + 1;
    }

    visible = entries.slice(offsetRows, offsetRows + visibleRows);
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

  function onkeydown(event) {
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

  function onclick(event) {
    setFollow(false);
    const totalHeight = content.getBoundingClientRect().height;
    const rowHeight = totalHeight / visibleRows;
    setSelected(offsetRows + Math.floor(event.clientY / rowHeight));
  }
</script>

<svelte:window {onkeydown} />
<log-content {onclick} {onkeydown} bind:this={content} role="none">
  {#each visible as entry, i (i)}
    {@render row(entry, selected, offsetRows + i, follow)}
  {/each}
</log-content>
