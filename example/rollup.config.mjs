import resolve from "@rollup/plugin-node-resolve";
import dev from "rollup-plugin-dev";
import svelte from "rollup-plugin-svelte";

const port = 5000;

export default {
  input: "example/src/index.mjs",
  output: {
    sourcemap: true,
    format: "esm",
    file: "example/public/bundle.mjs"
  },
  plugins: [
    resolve({ browser: true }),
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
            const s = new Readable();

            s._read = function(n) {
              let i = 1;
              this.push(`n = ${n}`);
              setInterval(() => {
                this.push(`line ${i}`);
                i++;
              }, 500);
            };

            ctx.body = s;

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
