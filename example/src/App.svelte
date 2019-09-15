<script>
  import { onMount } from "svelte";

  import { LogView, lineIterator } from "../../src/index.svelte";

  async function wait(msecs) {
    return new Promise(resolve => setTimeout(resolve, msecs));
  }

  async function* lines() {
    let n = 1;

    while (true) {
      await wait(1000);
      yield `line ${n}`;
      n++;
    }
  }

  let source = lines();

/*
  onMount(async () => {
    let response = await fetch("/api/log");
    let reader = response.body.getReader();
    source = lineIterator(reader);
  });
  */
</script>

<h1>Example</h1>
<LogView {source} />
