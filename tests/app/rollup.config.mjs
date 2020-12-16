import virtual from "@rollup/plugin-virtual";
import resolve from "@rollup/plugin-node-resolve";
import dev from "rollup-plugin-dev";
import svelte from "rollup-plugin-svelte";
import postcss from "rollup-plugin-postcss";
import postcssImport from "postcss-import";
import { Readable } from "stream";

const port = 5000;
const basedir = "tests/app";
const production = !process.env.ROLLUP_WATCH;

export default {
  input: `${basedir}/src/index.mjs`,
  output: {
    sourcemap: true,
    format: "esm",
    file: `${basedir}/public/bundle.main.mjs`
  },
  plugins: [
    virtual({
      "node-fetch": "export default fetch",
      stream: "export class Readable {}",
      buffer: "export class Buffer {}"
    }),
    postcss({
      extract: true,
      sourceMap: true,
      minimize: production,
      plugins: [postcssImport]
    }),
    svelte({
      dev: !production
    }),
    resolve({
      browser: true,
      dedupe: importee =>
        importee === "svelte" || importee.startsWith("svelte/")
    }),
    dev({
      port,
      dirs: [`${basedir}/public`],
      spa: `${basedir}/public/index.html`,
      basePath: "/",
      extend(app, modules) {
        app.use(
          modules.router.get("/api/log", (ctx, next) => {
            const params = new URLSearchParams(
              ctx.request.url.replace(/^[^\?]+\?/, "")
            );

            let line = parseInt(params.get("cursor")) || 0;
            const offset = parseInt(params.get("offset")) || 0;
            const number = parseInt(params.get("number")) || 20;

            line += offset;

            let i = 0;
            ctx.body = new Readable({
              encoding: "utf8",
              read(size) {
                if (i++ < number) {
                  setTimeout(() => this.push(`line ${line++}\n`), 80);
                } else {
                  console.log("size", size);
                  try {
                    this.push();
                  } catch (e) {
                    console.log(e);
                  }
                }
              }
            });

            //setTimeout(() => ctx.body.cancel(), 5000);

            next();
          })
        );
      }
    })
  ]
};
