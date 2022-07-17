import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig(async ({ command, mode }) => {
  const { extractFromPackage } = await import(
    new URL("node_modules/npm-pkgbuild/src/module.mjs", import.meta.url)
  );
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
      if(req.url.endsWith('/api/log')) {
        const params = new URLSearchParams(
          req.url.replace(/^[^\?]+\?/, "")
        );

        let line = parseInt(params.get("cursor")) || 0;
        const offset = parseInt(params.get("offset")) || 0;
        const number = parseInt(params.get("number")) || 20;

        console.log("MIDDLEWARE",req.url);
        line += offset;

        let i = 0;
        res.body = new Readable({
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
        res.status = 200;
        return;
      }
      next();
    });
  }
});

/*
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
