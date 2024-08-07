import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { compression } from "vite-plugin-compression2";
import { extractFromPackage } from "npm-pkgbuild";

export default defineConfig(async ({ command, mode }) => {
  const res = extractFromPackage(
    {
      dir: new URL("./", import.meta.url).pathname,
      mode
    },
    process.env
  );
  const first = await res.next();
  const pkg = first.value;
  const properties = pkg.properties;
  const base = ""; //properties["http.path"];
  const production = mode === "production";

  process.env["VITE_NAME"] = properties.name;
  process.env["VITE_DESCRIPTION"] = properties.description;
  process.env["VITE_VERSION"] = properties.version;
  process.env["VITE_API"] = properties.api;

  return {
    base,
    root: "tests/app/src",
    plugins: [
      myServerPlugin(),
      svelte({
        compilerOptions: {
          dev: !production
        }
      }),
      compression({
        algorithm: "brotliCompress",
        exclude: [
          /\.(map)$/,
          /\.(br)$/,
          /\.(gz)$/,
          /\.(png)$/,
          /\.(jpg)$/,
          /\.(gif)$/,
          /\.(webp)$/,
          /\.(heic)$/,
          /\.(avif)$/,
          /\.(jxl)$/,
          /\.(pdf)$/,
          /\.(docx)$/
        ],
        threshold: 500
      })
    ],
    server: { host: true },
    build: {
      outDir: "../../../build",
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
        res.setHeader("Content-Type", "text/plain");
        res.statusCode = 200;

        const params = new URLSearchParams(req.url.replace(/^[^\?]+\?/, ""));

        let line = parseInt(params.get("cursor") || "0");
        const offset = parseInt(params.get("offset") || "0");
        const number = parseInt(params.get("number") || "10");

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

        return;
      } else {
        next();
      }
    });
  }
});
