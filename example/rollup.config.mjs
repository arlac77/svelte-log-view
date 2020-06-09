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
        async function wait(msecs = 100) {
          return new Promise(resolve => setTimeout(resolve, msecs));
        }

        app.use(
          modules.router.get("/api/log", async (ctx, next) => {
            let i = 1;

            ctx.body = new Readable({
              encoding: "utf8",
              read(size) {
                setTimeout(() => {
                  this.push(`line ${i}\n`);
                  i++;
                }, 1000);
              }
            });

            /*
            for (let i = 1; i < 100; i++) {
              s.push(`api line ${i}`);
              await wait(100);
            }*/

            /*
            const lines = [];
            for (let i = 1; i < 100; i++) {
              lines.push(`api line ${i}`);
            }
            ctx.body = lines.join("\n");
            */

            next();
          })
        );
      }
    })
  ]
};
