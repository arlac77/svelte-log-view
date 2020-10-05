import resolve from "@rollup/plugin-node-resolve";
import dev from "rollup-plugin-dev";
import svelte from "rollup-plugin-svelte";
import { Readable } from "stream";

const port = 5000;

const basedir = "tests/app";

export default {
  input: `${basedir}/src/index.mjs`,
  output: {
    sourcemap: true,
    format: "esm",
    file: `${basedir}/public/bundle.main.mjs`
  },
  plugins: [
    dev({
      port,
      dirs: [`${basedir}/public`],
      spa: `${basedir}/public/index.html`,
      basePath: `/components/svelte-log-view/${basedir}`,
      extend(app, modules) {
        app.use(
          modules.router.get("/api/log", (ctx, next) => {
            let i = 1;
            ctx.body = new Readable({
              encoding: "utf8",
              read(size) {
                if (i < 20) {
                  setTimeout(() => this.push(`line ${i++}\n`), 120);
                }
              }
            });

            next();
          })
        );
        app.use(
          modules.router.get("/api/back/log", (ctx, next) => {
            let line = 0;

            const m = ctx.request.url.match(/\?cursor=(.+)/);
            if(m) {
              line = parseInt(m[1]);
            }

            let i = 0;
            ctx.body = new Readable({
              encoding: "utf8",
              read(size) {
                if (i++ < 20) {
                  setTimeout(() => this.push(`line ${--line}\n`), 120);
                }
              }
            });

            next();
          })
        );
      }
    }),
    svelte(),
    resolve({
      browser: true,
      dedupe: importee =>
        importee === "svelte" || importee.startsWith("svelte/")
    })
  ]
};
