import resolve from "@rollup/plugin-node-resolve";
import dev from "rollup-plugin-dev";
import svelte from "rollup-plugin-svelte";
import { Readable } from "stream";

const port = 5000;

export default {
  input: "example/src/index.mjs",
  output: {
    sourcemap: true,
    format: "esm",
    file: "example/public/bundle.mjs"
  },
  plugins: [
    resolve.nodeResolve({ browser: true }),
    svelte(),
    dev({
      port,
      dirs: ["example/public"],
      spa: "example/public/index.html",
      basePath: "/base",
      extend(app, modules) {
        app.use(
          modules.router.get("/api/log", (ctx, next) => {
            let i = 1;
            ctx.body = new Readable({
              encoding: "utf8",
              read(size) {
                setTimeout(() => this.push(`line ${i++}\n`), 500);
              }
            });

            next();
          })
        );
      }
    })
  ]
};
