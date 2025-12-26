<script>
  import { onDestroy } from "svelte";

  /**
   *   line 1    |                   \
   *   line 2    | -> offsetEntries.  |
   * ----------                       |
   * | line 4 |  |                    |
   * | line 5 |  | -> numberOfVisibleEntries. | -> maxBufferedEntries
   * | line 5 |  |                    |
   * ----------                       |
   *   line 6                        /
   */

  let {
    source /** data source */,
    entries = $bindable([]),
    offsetEntries = $bindable(
      0
    ) /** number of entries from the top to the 1st. visible */,
    follow = $bindable(true),
    selected = $bindable(0),
    numberOfEntriesToFetch = 10 /** number of entries to fetch if we reach outside of the buffered area */,
    maxBufferedEntries = 1024,
    entryElement
  } = $props();

  let contentHeight = $state();
  let numberOfVisibleEntries = $derived.by(() => {
    console.log("contentHeight",contentHeight);
    const n = Math.ceil(contentHeight / entryHeight);
    return n;
  });

  let visibleEntries = $derived.by(() => {
    return entries.slice(offsetEntries, offsetEntries + numberOfVisibleEntries);
  });
  let entryHeight = 19.13;

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
      offsetEntries = entries.length - numberOfVisibleEntries;
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

    if (selected >= offsetEntries + numberOfVisibleEntries) {
      offsetEntries = selected - numberOfVisibleEntries + 1;
    }

    visibleEntries = entries.slice(
      offsetEntries,
      offsetEntries + numberOfVisibleEntries
    );
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
        setSelected(selected - numberOfVisibleEntries);
        break;
      case "PageDown":
        setFollow(false);
        setSelected(selected + numberOfVisibleEntries);
        break;
      case "Home":
      case "g":
        setFollow(false);
        setSelected(Number.MIN_SAFE_INTEGER + 1);
        break;
      case "End":
      case "G":
        setFollow(false);
        setSelected(Number.MAX_SAFE_INTEGER - 1);
        break;
      case "f":
        setFollow(!follow);
        break;
    }
  }

  function onclick(event) {
    setFollow(false);
    setSelected(offsetEntries + Math.floor(event.clientY / entryHeight));
  }
</script>

<svelte:window {onkeydown} />
<log-content
  {onclick}
  {onkeydown}
  bind:clientHeight={contentHeight}
  role="presentation"
>
  {#each visibleEntries as entry, i (i)}
    {@render entryElement(entry, selected, offsetEntries + i, follow)}
  {/each}
</log-content>
