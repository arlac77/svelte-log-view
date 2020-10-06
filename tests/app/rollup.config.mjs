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
            let line = 0;
            let increment = 1;
            let number = 20;

            let m = ctx.request.url.match(/cursor=(.+)/);
            if (m) {
              line = parseInt(m[1]);
            }

            m = ctx.request.url.match(/number=(.+)/);
            if (m) {
              number = parseInt(m[1]);
              if (number < 0) {
                increment = -1;
                number = -number;
              }
            }

            let i = 0;
            ctx.body = new Readable({
              encoding: "utf8",
              read(size) {
                if (i++ < number) {
                  setTimeout(
                    () => this.push(`line ${(line += increment)}\n`),
                    120
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
