import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  html: {
    template: "./src/index.html",
  },
  plugins: [pluginReact()],
  server: {
    proxy: {
      "/api": {
        target: process.env.BACKEND_URL || "http://localhost:3001",
        changeOrigin: true,
        secure: process.env.NODE_ENV === "production",
      },
      "/health": {
        target: process.env.BACKEND_URL || "http://localhost:3001",
        changeOrigin: true,
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  source: {
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
      "process.env.BACKEND_URL": JSON.stringify(process.env.BACKEND_URL || "http://localhost:3001"),
    },
  },
  tools: {
    bundlerChain(chain, { CHAIN_ID }) {
      // Add image manifest plugin
      if (process.env.NODE_ENV === "production") {
        chain.plugin("image-manifest").use(
          new (class {
            apply(compiler: any) {
              compiler.hooks.emit.tapAsync(
                "ImageManifestPlugin",
                (compilation: any, callback: any) => {
                  const manifest: Record<string, string> = {};
                  compilation.modules.forEach((module: any) => {
                    if (
                      module.resource &&
                      /\.(png|jpe?g|gif|webp)$/.test(module.resource)
                    ) {
                      const key = module.resource.split("/public/img/")[1];
                      if (key) {
                        manifest[key] = `/img/${key}`;
                      }
                    }
                  });
                  compilation.assets["image-manifest.json"] = {
                    source: () => JSON.stringify(manifest, null, 2),
                    size: () => JSON.stringify(manifest).length,
                  };
                  callback();
                }
              );
            }
          })()
        );
      }
    },
  },
});
