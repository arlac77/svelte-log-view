<script>
  import {LogView} from "../../src/index.svelte";

  let data = ["line 1", "line 2", "line 3"].join("\n");
</script>

<h1>Example</h1>
<LogView {data} />
