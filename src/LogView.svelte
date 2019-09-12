<script>
  import { onMount } from "svelte";
  export let source;

  let data = "";

  onMount(async () => {
    for await (const line of source) {
      data += line + "\n";
    }
  });
</script>

<div class="log">{data}</div>
