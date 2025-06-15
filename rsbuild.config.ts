import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  html: {
    template: "./src/index.html",
  },
  plugins: [pluginReact()],
  tools: {
    bundlerChain(chain, { CHAIN_ID }) {
      // Add image manifest plugin
      if (process.env.NODE_ENV === "production") {
        chain.plugin("image-manifest").use(
          new (class {
            apply(compiler) {
              compiler.hooks.emit.tapAsync(
                "ImageManifestPlugin",
                (compilation, callback) => {
                  const manifest = {};
                  compilation.modules.forEach((module) => {
                    if (
                      module.resource &&
                      /\.(png|jpe?g|gif|webp)$/.test(module.resource)
                    ) {
                      const key = module.resource.split("/public/img/")[1];
                      manifest[key] = `/img/${key}`;
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
