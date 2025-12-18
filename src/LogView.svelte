<script>
  import { onDestroy } from "svelte";

  /**
   *   line 1    |                   \
   *   line 2    | -> offsetEntries.  |
   * ----------                       |
   * | line 4 |  |                    |
   * | line 5 |  | -> visibleEntries. | -> maxBufferedEntries
   * | line 5 |  |                    |
   * ----------                       |
   *   line 6                        /
   */

  let {
    source /** data source */,
    visibleEntries = $bindable(24) /** number of rows in the dom */,
    offsetEntries = $bindable(
      0
    ) /** number of rows from the top to the 1st. visible */,
    follow = $bindable(true),
    selected = $bindable(0),
    numberOfEntriesToFetch = 10 /** number of rows to fetch if we reach outside of the buffered area */,
    maxBufferedEntries = 1024,
    row
  } = $props();

  const entries = [];
  let visible = $state(entries);
  let content;

  onDestroy(() => source.abort());

  fetchFollow();

  async function fetchFollow() {
    let current;
    if (entries.length > 0) {
      current = entries[entries.length - 1];
      if (follow) {
        setSelected(entries.length - 1);
      }
    }

    do {
      for await (const entry of source.fetch(current)) {
        entries.push(entry);

        if (entries.lenght >= maxBufferedEntries) {
          entries.shift();
        }

        if (entries.length <= visibleEntries) {
          visible = entries;
        } else {
          if (!follow) {
            visible = entries.slice(offsetEntries, visibleEntries);
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
      offsetEntries = entries.length - visibleEntries;
    }

    if (selected < 0) {
      const additionalEntries = [];

      for await (const entry of source.fetch(
        entries[0],
        -numberOfEntriesToFetch,
        numberOfEntriesToFetch
      )) {
        additionalEntries.push(entry);
      }

      entries.unshift(...additionalEntries);

      if (entries.lenght >= maxBufferedEntries) {
        entries.length = maxBufferedEntries;
      }

      selected += additionalEntries.length;
      offsetEntries += additionalEntries.length;
    }

    if (selected < offsetEntries) {
      offsetEntries = selected;
    }

    if (selected >= offsetEntries + visibleEntries) {
      offsetEntries = selected - visibleEntries + 1;
    }

    visible = entries.slice(offsetEntries, offsetEntries + visibleEntries);
  }

  function setFollow(flag) {
    if (follow !== flag) {
      follow = flag;
      if (flag) {
        fetchFollow();
      } else {
        source.abort();
      }
    }
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
        setSelected(selected - visibleEntries);
        break;
      case "PageDown":
        setFollow(false);
        setSelected(selected + visibleEntries);
        break;
      case "End":
      case "G":
        setFollow(false);
        setSelected(entries.length - 1);
        break;
      case "Home":
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
    const rowHeight = totalHeight / visibleEntries;
    setSelected(offsetEntries + Math.floor(event.clientY / rowHeight));
  }
</script>

<svelte:window {onkeydown} />
<log-content {onclick} {onkeydown} bind:this={content} role="none">
  {#each visible as entry, i (i)}
    {@render row(entry, selected, offsetEntries + i, follow)}
  {/each}
</log-content>
