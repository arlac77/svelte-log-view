import { readFile } from "fs/promises";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

const encodingOptions = { encoding: "utf8" };

export default defineConfig(async ({ command, mode }) => {
  const pkg = JSON.parse(
    await readFile(
      new URL("package.json", import.meta.url).pathname,
      encodingOptions
    )
  );

  const production = mode === "production";

  process.env["VITE_NAME"] = pkg.name;
  process.env["VITE_DESCRIPTION"] = pkg.description;
  process.env["VITE_VERSION"] = pkg.version;

  const base = `/components/${pkg.name}/example/`;

  return {
    base,
    root: "tests/app/src",
    worker: { format: "es" },
    plugins: [
      svelte({
        compilerOptions: {
          dev: !production
        }
      })
    ],
    optimizeDeps: {
      exclude: [
        ...Object.keys(pkg.dependencies).filter(d => d.startsWith("svelte"))
      ]
    },
    server: { host: true },
    build: {
      outDir: "../build",
      target: "esnext",
      emptyOutDir: true,
      minify: production,
      sourcemap: true
    }
  };
});

/*

import { Readable } from "stream";

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
*/