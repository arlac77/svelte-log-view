<script>
  import { onDestroy } from "svelte";

  let url;

  onDestroy(
    context.subscribe(value => {
      const job = value.params.job;
      const queue = value.params.queue;
      url = `${config.api}/queue/${queue}/job/${job}/log?start=0&end=10000`;
      refresh(url);
    })
  );

  let lines = [];

  async function refresh(url) {
    const data = await fetch(url);
    const json = await data.json();
    lines = json.logs.join("\n");
  }

</script>

<style>
  .log {
    white-space: pre;
    font-family: courier, "courier new", monospace;
  }
</style>

<div class="log">{lines}</div>
