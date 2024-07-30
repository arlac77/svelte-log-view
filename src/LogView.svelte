<script>
  import { onDestroy } from "svelte";

  let {
    source,
    visibleRows = 10000,
    entries = [],
    visible = entries,
    follow = $bindable(true),
    selected = $bindable(0),
    start = $bindable(0),
    row
  } = $props();

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
            visible = entries.slice(start, visibleRows);
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
      start = entries.length - visibleRows;
    }

    if (selected < 0) {
      const cursor = entries[0];

      let number = 5;

      for (let i = 0; i < number; i++) {
        entries.unshift();
      }

      selected += number;
      start += number;

      let i = 0;
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
    const height = event.target.getBoundingClientRect().height; // +4 border ?
    setSelected(start + Math.floor(event.clientY / height));
  }
</script>

<svelte:window {onkeydown} />
<log-content bind:this={content}>
  {#each visible as entry, i (i)}
    <log-row {onclick} {onkeydown} role="none">
      {@render row(entry,selected,start + i)}
    </log-row>
  {/each}
</log-content>
