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

            const params = new URLSearchParams(
              ctx.request.url.replace(/^[^\?]+\?/, "")
            );

            let line = parseInt(params.get("cursor")) || 0;
            const offset = parseInt(params.get("offset")) || 0;
            let number = parseInt(params.get("number")) || 20;

            line += offset;

            let i = 0;
            ctx.body = new Readable({
              encoding: "utf8",
              read(size) {
                if (i++ < number) {
                  setTimeout(
                    () => this.push(`line ${(line ++)}\n`),
                    80
                  );
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
