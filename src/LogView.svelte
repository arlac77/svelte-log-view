<script>
  import { onMount } from "svelte";

  export let source;

  let lines = '';
  onMount(async () => {
  for await (const line of source) {
    lines += line + "\n";
  }
  });
</script>

<div class="log">{lines}</div>
