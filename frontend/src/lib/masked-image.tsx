import {
  ImageProperties as BaseImageProperties,
  createImageState,
  setupImage,
} from "@pmndrs/uikit/internals";
// import { Image as UIKitImage } from "@react-three/uikit"; // Unused import
import { ParentProvider, useParent } from "@react-three/uikit/dist/context.js";
import { DefaultProperties } from "@react-three/uikit/dist/default.js";
import {
  ComponentInternals,
  useComponentInternals,
} from "@react-three/uikit/dist/ref.js";
import {
  AddHandlers,
  R3FEventMap,
  usePropertySignals,
} from "@react-three/uikit/dist/utils.js";
import {
  ReactNode,
  RefAttributes,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Object3D } from "three";

// Helper function to parse dimension values
const parseDimension = (value: any): number | undefined => {
  if (typeof value === "number") {
    return value > 0 ? value : undefined;
  }
  if (typeof value === "string") {
    // Skip percentage and other non-pixel values
    if (
      value.includes("%") ||
      value.includes("em") ||
      value.includes("rem") ||
      value.includes("vw") ||
      value.includes("vh")
    ) {
      return undefined;
    }
    // Parse numeric values (with or without 'px')
    const numericValue = parseFloat(value.replace(/[^\d.]/g, ""));
    return !isNaN(numericValue) && numericValue > 0 ? numericValue : undefined;
  }
  return undefined;
};

// Function to extract dimensions from SVG content
const extractSVGDimensions = (
  svgContent: string
): { width: number; height: number } => {
  try {
    // Parse SVG to extract viewBox or width/height attributes
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = svgDoc.querySelector("svg");

    if (!svgElement) {
      return { width: 512, height: 512 }; // Default fallback
    }

    // Try to get explicit width/height first
    const widthAttr = svgElement.getAttribute("width");
    const heightAttr = svgElement.getAttribute("height");

    if (widthAttr && heightAttr) {
      const width = parseFloat(widthAttr.replace(/[^\d.]/g, ""));
      const height = parseFloat(heightAttr.replace(/[^\d.]/g, ""));
      if (!isNaN(width) && !isNaN(height)) {
        return { width, height };
      }
    }

    // Try to extract from viewBox
    const viewBox = svgElement.getAttribute("viewBox");

    if (viewBox) {
      const parts = viewBox.split(/[\s,]+/);
      if (parts.length >= 4) {
        const width = parseFloat(parts[2]);
        const height = parseFloat(parts[3]);
        if (!isNaN(width) && !isNaN(height)) {
          return { width, height };
        }
      }
    }

    // Final fallback
    return { width: 512, height: 512 };
  } catch (error) {
    console.warn("Failed to parse SVG dimensions:", error);
    return { width: 512, height: 512 };
  }
};

// Function to create a transparent image from SVG mask
const createTransparentImageFromSVG = async (
  svgMask: string,
  width?: number,
  height?: number,
  imageSmoothing: "pixelated" | "low" | "medium" | "high" = "high"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Extract SVG dimensions from content
    const svgDimensions = extractSVGDimensions(svgMask);

    // Parse the provided dimensions to ensure they're valid numbers
    const parsedWidth = parseDimension(width);
    const parsedHeight = parseDimension(height);

    // Use explicit dimensions if provided and valid, otherwise use SVG dimensions
    // Only apply minimum size when no explicit dimensions are provided
    const baseWidth = parsedWidth || svgDimensions.width;
    const baseHeight = parsedHeight || svgDimensions.height;

    const canvasWidth = parsedWidth ? baseWidth : Math.max(baseWidth, 230); // Ensure minimum quality only for auto-sized
    const canvasHeight = parsedHeight ? baseHeight : Math.max(baseHeight, 230);

    // Ensure we have valid dimensions
    if (canvasWidth <= 0 || canvasHeight <= 0) {
      const fallbackWidth = 460;
      const fallbackHeight = 460;

      // Create a simple fallback canvas
      const canvas = document.createElement("canvas");
      canvas.width = fallbackWidth;
      canvas.height = fallbackHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL());
        return;
      }
    }

    // Create SVG mask image
    const maskImg = new Image();
    const svgBlob = new Blob([svgMask], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    maskImg.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(svgUrl);
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Configure image resampling based on algorithm choice
      if (imageSmoothing === "pixelated") {
        // Disable smoothing for pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;
      } else {
        // Enable high-quality rendering with specified resampling algorithm
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = imageSmoothing;
      }

      // Clear canvas with transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the SVG as a transparent image
      ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(svgUrl);
      resolve(canvas.toDataURL());
    };

    maskImg.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error("Failed to load SVG mask"));
    };

    maskImg.src = svgUrl;
  });
};

// Function to create a masked image data URL
const createMaskedImageDataURL = async (
  imageSrc: string,
  svgMask: string,
  maskSize: "full" | "full-width" | "full-height" | "original" = "full",
  width?: number,
  height?: number,
  imgFit: "cover" | "contain" | "fill" = "cover",
  imgCoverPosition:
    | "center"
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right" = "top-left",
  maskFit: "cover" | "contain" | "fill" = "fill",
  maskCoverPosition:
    | "center"
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right" = "center",
  imageSmoothing: "pixelated" | "low" | "medium" | "high" = "high"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Extract SVG dimensions from content first
    const svgDimensions = extractSVGDimensions(svgMask);

    // Load the SVG mask
    const maskImg = new Image();
    const svgBlob = new Blob([svgMask], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    maskImg.onload = () => {
      // Load the main image
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        // Step 0: Get all dimensions
        const sourceWidth = img.naturalWidth;
        const sourceHeight = img.naturalHeight;
        const parsedWidth = parseDimension(width);
        const parsedHeight = parseDimension(height);

        // Determine target dimensions (what the user wants to display)
        let targetWidth: number;
        let targetHeight: number;

        if (parsedWidth && parsedHeight) {
          targetWidth = parsedWidth;
          targetHeight = parsedHeight;
        } else if (parsedWidth) {
          targetWidth = parsedWidth;
          targetHeight =
            (svgDimensions.height / svgDimensions.width) * targetWidth;
        } else if (parsedHeight) {
          targetHeight = parsedHeight;
          targetWidth =
            (svgDimensions.width / svgDimensions.height) * targetHeight;
        } else if (width && height) {
          // Use raw width/height values (e.g., from container size)
          targetWidth = width;
          targetHeight = height;
        } else {
          // Fallback to SVG dimensions
          targetWidth = svgDimensions.width;
          targetHeight = svgDimensions.height;
        }

        // Step 1: Create high-quality canvas
        // Maintain target aspect ratio while ensuring minimum quality
        const qualityThreshold = 512;
        const targetAspectRatio = targetWidth / targetHeight;

        let canvasWidth: number;
        let canvasHeight: number;

        // Determine which dimension needs upscaling for quality
        if (Math.max(targetWidth, targetHeight) < qualityThreshold) {
          // Scale up while maintaining aspect ratio
          if (targetWidth > targetHeight) {
            canvasWidth = qualityThreshold;
            canvasHeight = qualityThreshold / targetAspectRatio;
          } else {
            canvasHeight = qualityThreshold;
            canvasWidth = qualityThreshold * targetAspectRatio;
          }
        } else {
          // Use target dimensions, but don't exceed source size unnecessarily
          canvasWidth = Math.min(targetWidth, sourceWidth * 2);
          canvasHeight = Math.min(targetHeight, sourceHeight * 2);
        }

        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          URL.revokeObjectURL(svgUrl);
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Configure image resampling
        if (imageSmoothing === "pixelated") {
          ctx.imageSmoothingEnabled = false;
        } else {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = imageSmoothing;
        }

        // Step 2: Calculate scaling factors
        const canvasToTargetScale = Math.min(
          canvasWidth / targetWidth,
          canvasHeight / targetHeight
        );

        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Step 3: Draw image to canvas with proper fitting
        if (imgFit === "cover") {
          // Scale image to cover entire canvas
          const scaleX = canvasWidth / sourceWidth;
          const scaleY = canvasHeight / sourceHeight;
          const scale = Math.max(scaleX, scaleY);

          const scaledWidth = sourceWidth * scale;
          const scaledHeight = sourceHeight * scale;

          let offsetX: number, offsetY: number;
          switch (imgCoverPosition) {
            case "top-left":
              offsetX = 0;
              offsetY = 0;
              break;
            case "top-center":
              offsetX = (canvasWidth - scaledWidth) / 2;
              offsetY = 0;
              break;
            case "top-right":
              offsetX = canvasWidth - scaledWidth;
              offsetY = 0;
              break;
            case "bottom-left":
              offsetX = 0;
              offsetY = canvasHeight - scaledHeight;
              break;
            case "bottom-center":
              offsetX = (canvasWidth - scaledWidth) / 2;
              offsetY = canvasHeight - scaledHeight;
              break;
            case "bottom-right":
              offsetX = canvasWidth - scaledWidth;
              offsetY = canvasHeight - scaledHeight;
              break;
            case "center":
            default:
              offsetX = (canvasWidth - scaledWidth) / 2;
              offsetY = (canvasHeight - scaledHeight) / 2;
              break;
          }
          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        } else if (imgFit === "contain") {
          // Scale image to fit within canvas
          const scaleX = canvasWidth / sourceWidth;
          const scaleY = canvasHeight / sourceHeight;
          const scale = Math.min(scaleX, scaleY);

          const scaledWidth = sourceWidth * scale;
          const scaledHeight = sourceHeight * scale;
          const offsetX = (canvasWidth - scaledWidth) / 2;
          const offsetY = (canvasHeight - scaledHeight) / 2;

          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        } else {
          // Fill entire canvas
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        }

        // Step 4: Prepare mask at correct size
        let maskWidth: number, maskHeight: number, maskX: number, maskY: number;

        if (maskSize === "original") {
          // Use SVG original size relative to target, then scale to canvas
          const scaleToTarget = Math.min(
            targetWidth / svgDimensions.width,
            targetHeight / svgDimensions.height
          );
          maskWidth = svgDimensions.width * scaleToTarget * canvasToTargetScale;
          maskHeight =
            svgDimensions.height * scaleToTarget * canvasToTargetScale;
          maskX = (canvasWidth - maskWidth) / 2;
          maskY = (canvasHeight - maskHeight) / 2;
        } else if (maskSize === "full-width") {
          // Mask spans full target width
          maskWidth = targetWidth * canvasToTargetScale;
          maskHeight = (svgDimensions.height / svgDimensions.width) * maskWidth;
          maskX = (canvasWidth - maskWidth) / 2;
          maskY = (canvasHeight - maskHeight) / 2;
        } else if (maskSize === "full-height") {
          // Mask spans full target height
          maskHeight = targetHeight * canvasToTargetScale;
          maskWidth = (svgDimensions.width / svgDimensions.height) * maskHeight;
          maskX = (canvasWidth - maskWidth) / 2;
          maskY = (canvasHeight - maskHeight) / 2;
        } else {
          // maskSize === "full" - apply maskFit behavior to canvas area
          if (maskFit === "fill") {
            // FILL: Resize mask to match all four corners of canvas, ignoring aspect ratio
            maskWidth = canvasWidth;
            maskHeight = canvasHeight;
            maskX = 0;
            maskY = 0;
          } else if (maskFit === "cover") {
            // COVER: Resize to match canvas width while maintaining aspect ratio, use maskCoverPosition as anchor
            maskWidth = canvasWidth;
            maskHeight =
              (svgDimensions.height / svgDimensions.width) * canvasWidth;

            // Position based on maskCoverPosition
            maskX = 0; // Always fill width
            switch (maskCoverPosition) {
              case "top-left":
              case "top-center":
              case "top-right":
                maskY = 0;
                break;
              case "bottom-left":
              case "bottom-center":
              case "bottom-right":
                maskY = canvasHeight - maskHeight;
                break;
              case "center":
              default:
                maskY = (canvasHeight - maskHeight) / 2;
                break;
            }
          } else {
            // CONTAIN: Resize to match canvas size while maintaining aspect ratio, may be smaller (letterbox)
            const scaleX = canvasWidth / svgDimensions.width;
            const scaleY = canvasHeight / svgDimensions.height;
            const scale = Math.min(scaleX, scaleY);

            maskWidth = svgDimensions.width * scale;
            maskHeight = svgDimensions.height * scale;
            maskX = (canvasWidth - maskWidth) / 2;
            maskY = (canvasHeight - maskHeight) / 2;
          }
        }

        // Step 5: Apply mask with composite operation
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(maskImg, maskX, maskY, maskWidth, maskHeight);

        URL.revokeObjectURL(svgUrl);
        resolve(canvas.toDataURL());
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error("Failed to load image"));
      };

      img.src = imageSrc;
    };

    maskImg.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error("Failed to load SVG mask"));
    };

    maskImg.src = svgUrl;
  });
};

export type ImageProperties = BaseImageProperties<R3FEventMap> & {
  children?: ReactNode;
  name?: string;
};

export type ImageRef = ComponentInternals<BaseImageProperties<R3FEventMap>>;

export const MaskedImage: (
  props: Omit<ImageProperties, "src"> &
    RefAttributes<ImageRef> & {
      src?: string;
      maskText: string;
      maskSize?: "full" | "full-width" | "full-height" | "original";
      imgFit?: "cover" | "contain" | "fill";
      imgCoverPosition?:
        | "center"
        | "top-left"
        | "top-center"
        | "top-right"
        | "bottom-left"
        | "bottom-center"
        | "bottom-right";
      maskFit?: "cover" | "contain" | "fill";
      maskCoverPosition?:
        | "center"
        | "top-left"
        | "top-center"
        | "top-right"
        | "bottom-left"
        | "bottom-center"
        | "bottom-right";
      imageSmoothing?: "pixelated" | "low" | "medium" | "high";
    }
) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent();
  const outerRef = useRef<Object3D>(null);
  const innerRef = useRef<Object3D>(null);
  const [maskedImageSrc, setMaskedImageSrc] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState<[number, number] | null>(
    null
  );

  // Create masked image when src, svgMask, or container size changes
  useEffect(() => {
    if (!properties.maskText) return;

    // Get actual dimensions - use container size if width/height are percentages
    let actualWidth = parseDimension(properties.width);
    let actualHeight = parseDimension(properties.height);

    // Check if we need container size for percentage dimensions
    const needsContainerWidth =
      !actualWidth &&
      typeof properties.width === "string" &&
      properties.width.includes("%");
    const needsContainerHeight =
      !actualHeight &&
      typeof properties.height === "string" &&
      properties.height.includes("%");

    // If we need container size but don't have it yet, wait
    if ((needsContainerWidth || needsContainerHeight) && !containerSize) {
      return;
    }

    // If we have container size and dimensions are not explicitly set in pixels
    if (containerSize) {
      if (needsContainerWidth) {
        actualWidth = containerSize[0];
      }
      if (needsContainerHeight) {
        actualHeight = containerSize[1];
      }
      // If still no dimensions, use container size
      if (!actualWidth) actualWidth = containerSize[0];
      if (!actualHeight) actualHeight = containerSize[1];
    }

    if (properties.src && typeof properties.src === "string") {
      // Create masked image when both src and svgMask are provided
      createMaskedImageDataURL(
        properties.src,
        properties.maskText,
        properties.maskSize || "full",
        actualWidth,
        actualHeight,
        properties.imgFit || "cover",
        properties.imgCoverPosition || "top-center",
        properties.maskFit || "fill",
        properties.maskCoverPosition || "center",
        properties.imageSmoothing || "high"
      )
        .then(setMaskedImageSrc)
        .catch(console.error);
    } else {
      // Create transparent image from SVG when only svgMask is provided
      createTransparentImageFromSVG(
        properties.maskText,
        actualWidth,
        actualHeight,
        properties.imageSmoothing || "high"
      )
        .then(setMaskedImageSrc)
        .catch(console.error);
    }
  }, [
    properties.src,
    properties.maskText,
    properties.maskSize,
    properties.width,
    properties.height,
    properties.imgFit,
    properties.imgCoverPosition,
    properties.maskFit,
    properties.maskCoverPosition,
    properties.imageSmoothing,
    containerSize,
  ]);

  // Only render when masked image is ready to prevent flash of unmasked image
  const imageProperties = useMemo(
    () => ({
      ...properties,
      src: maskedImageSrc || undefined,
      objectFit: "fill" as const, // Ensure image fills the container exactly
      // Hide the image until masked version is ready, but respect inherited opacity
      opacity: maskedImageSrc ? properties.opacity : 0,
    }),
    [properties, maskedImageSrc]
  );

  const propertySignals = usePropertySignals(imageProperties);
  const internals = useMemo(
    () =>
      createImageState<R3FEventMap>(
        parent,
        outerRef,
        propertySignals.style,
        propertySignals.properties,
        propertySignals.default
      ),
    [parent, propertySignals]
  );

  internals.interactionPanel.name = properties.name ?? "";

  useEffect(() => {
    if (outerRef.current == null || innerRef.current == null) {
      return;
    }
    const abortController = new AbortController();
    setupImage<R3FEventMap>(
      internals,
      parent,
      propertySignals.style,
      propertySignals.properties,
      outerRef.current,
      innerRef.current,
      abortController.signal
    );
    return () => abortController.abort();
  }, [parent, propertySignals, internals]);

  useComponentInternals(
    ref,
    parent.root,
    propertySignals.style,
    internals,
    internals.interactionPanel
  );

  // Track container size for percentage dimensions
  useEffect(() => {
    if (internals.size) {
      let timeoutId: number | undefined;
      let lastValidSize: [number, number] | null = null;

      const subscription = internals.size.subscribe((size) => {
        if (size && size[0] > 0 && size[1] > 0) {
          // Only update if the size has significantly changed to prevent micro-adjustments
          const hasSignificantChange = !lastValidSize ||
            Math.abs(size[0] - lastValidSize[0]) > 1 ||
            Math.abs(size[1] - lastValidSize[1]) > 1;

          if (hasSignificantChange) {
            // Debounce size changes to prevent flickering during rapid resizes
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
              // Double-check the size is still valid before setting
              if (size[0] > 0 && size[1] > 0) {
                setContainerSize([size[0], size[1]]);
                lastValidSize = [size[0], size[1]];
              }
            }, 50); // Increased delay to allow layout to stabilize
          }
        }
      });

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        subscription?.();
      };
    }
  }, [internals.size]);

  return (
    <AddHandlers ref={outerRef} handlers={internals.handlers}>
      <primitive object={internals.interactionPanel} />
      <object3D matrixAutoUpdate={false} ref={innerRef}>
        <DefaultProperties {...internals.defaultProperties}>
          <ParentProvider value={internals}>
            {properties.children}
          </ParentProvider>
        </DefaultProperties>
      </object3D>
    </AddHandlers>
  );
});
