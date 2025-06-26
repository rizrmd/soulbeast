interface ImageCache {
  [key: string]: HTMLImageElement;
}

interface LoaderEvents {
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

interface LoaderConfig {
  maxRetries: number;
  retryDelay: number;
}

export class ImageLoader {
  private static instance: ImageLoader;
  private cache: ImageCache = {};
  private totalImages = 0;
  private loadedImages = 0;
  private config: LoaderConfig = {
    maxRetries: 3,
    retryDelay: 1000,
  };

  private constructor() {}

  private isLoaded = false;

  public isFinishedLoading(): boolean {
    return this.isLoaded && this.loadedImages === this.totalImages;
  }

  static getInstance(): ImageLoader {
    if (!ImageLoader.instance) {
      ImageLoader.instance = new ImageLoader();
    }
    return ImageLoader.instance;
  }

  public async loadImagesFromFolder(events?: LoaderEvents): Promise<void> {
    try {
      let imagePaths: string[] = [];

      // Development: Use require.context
      if (process.env.NODE_ENV === "development") {
      }
      // Production: Load from manifest
      else {
        const manifestResponse = await fetch("/image-manifest.json");
        const manifest = await manifestResponse.json();
        imagePaths = manifest;
      }

      await this.preloadImages(imagePaths, events);
    } catch (error) {
      events?.onError?.(error as Error);
      throw error;
    }
  }

  private async preloadImages(
    paths: string[],
    events?: LoaderEvents
  ): Promise<void> {
    this.totalImages = paths.length;
    this.loadedImages = 0;

    const loadPromises = paths.map((path) => this.loadImage(path, events));

    try {
      await Promise.all(loadPromises);
      events?.onComplete?.();
    } catch (error) {
      events?.onError?.(error as Error);
      throw error;
    }
  }

  private async loadImage(
    path: string,
    events?: LoaderEvents,
    attempt: number = 1
  ): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          this.cache[path] = img;
          this.loadedImages++;

          const progress = (this.loadedImages / this.totalImages) * 100;
          events?.onProgress?.(progress);

          resolve();
        };

        img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
        img.src = path;
      });
    } catch (error) {
      if (attempt < this.config.maxRetries) {
        // Exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);

        events?.onProgress?.(0);
        await new Promise((resolve) => setTimeout(resolve, delay));

        return this.loadImage(path, events, attempt + 1);
      }

      events?.onError?.(error as Error);
      throw error;
    }
  }

  public getImage(path: string): HTMLImageElement | undefined {
    return this.cache[path];
  }

  public clearCache(): void {
    this.cache = {};
    this.loadedImages = 0;
    this.totalImages = 0;
  }

  public getLoadingProgress(): number {
    return (this.loadedImages / this.totalImages) * 100;
  }
}

// Add to rsbuild.config.ts:
/*
export default defineConfig({
  tools: {
    bundlerChain(chain, { CHAIN_ID }) {
      // Add image manifest plugin
      if (process.env.NODE_ENV === 'production') {
        chain.plugin('image-manifest')
          .use(new class {
            apply(compiler) {
              compiler.hooks.emit.tapAsync(
                'ImageManifestPlugin',
                (compilation, callback) => {
                  const manifest = {};
                  compilation.modules.forEach(module => {
                    if (module.resource && /\.(png|jpe?g|gif|webp)$/.test(module.resource)) {
                      const key = module.resource.split('/public/img/')[1];
                      manifest[key] = `/img/${key}`;
                    }
                  });
                  compilation.assets['image-manifest.json'] = {
                    source: () => JSON.stringify(manifest, null, 2),
                    size: () => JSON.stringify(manifest).length,
                  };
                  callback();
                }
              );
            }
          })
      }
    }
  }
});
*/
