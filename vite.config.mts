import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { extractFromPackage } from "npm-pkgbuild";

export default defineConfig(async ({ command, mode }) => {
  const res = extractFromPackage({
    dir: new URL("./", import.meta.url).pathname
  });
  const first = await res.next();
  const pkg = first.value;
  const properties = pkg.properties;
  const base = properties["http.path"] + "/";
  const production = mode === "production";

  process.env["VITE_NAME"] = properties.name;
  process.env["VITE_DESCRIPTION"] = properties.description;
  process.env["VITE_VERSION"] = properties.version;
  process.env["VITE_API"] = properties.api;

  const open = process.env.CI ? {} : { open: base };

  return {
    base,
    root: "tests/app/src",
    worker: { format: "es" },
    plugins: [
      myServerPlugin(),
      svelte({
        compilerOptions: {
          dev: !production
        }
      })
    ],
    server: { host: true, ...open },
    build: {
      outDir: "../../../build",
      target: "esnext",
      emptyOutDir: true,
      minify: production,
      sourcemap: true
    }
  };
});

const myServerPlugin = () => ({
  name: "configure-server",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url.indexOf("/api/log") >= 0) {
        const params = new URLSearchParams(req.url.replace(/^[^\?]+\?/, ""));

        let line = parseInt(params.get("cursor")) || 0;
        const offset = parseInt(params.get("offset")) || 0;
        const number = parseInt(params.get("number")) || 20;

        line += offset;

        let i = 0;

        if (i++ < number) {
          let interval = setInterval(() => {
            res.write(`line ${line++}\n`);
            if (i++ > number) {
              clearInterval(interval);
              interval = undefined;
              res.end();
            }
          }, 80);
        } else {
          res.end();
        }

        res.statusCode = 200;
        return;
      } else {
        next();
      }
    });
  }
});
