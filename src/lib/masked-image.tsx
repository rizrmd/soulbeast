import {
  ImageProperties as BaseImageProperties,
  createImageState,
  setupImage,
} from "@pmndrs/uikit/internals";
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
import {
  AddHandlers,
  R3FEventMap,
  usePropertySignals,
} from "@react-three/uikit/dist/utils.js";
import { ParentProvider, useParent } from "@react-three/uikit/dist/context.js";
import {
  ComponentInternals,
  useComponentInternals,
} from "@react-three/uikit/dist/ref.js";
import { DefaultProperties } from "@react-three/uikit/dist/default.js";

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
  height?: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Extract SVG dimensions from content
    const svgDimensions = extractSVGDimensions(svgMask);

    // Parse the provided dimensions to ensure they're valid numbers
    const parsedWidth = parseDimension(width);
    const parsedHeight = parseDimension(height);

    // Use explicit dimensions if provided and valid, otherwise use SVG dimensions
    // For better quality, ensure minimum size
    const baseWidth = parsedWidth || svgDimensions.width;
    const baseHeight = parsedHeight || svgDimensions.height;

    const canvasWidth = Math.max(baseWidth, 230); // Ensure minimum quality
    const canvasHeight = Math.max(baseHeight, 230);

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

      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

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
    | "bottom-right" = "top-left"
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
        // Parse the provided dimensions to ensure they're valid numbers
        const parsedWidth = parseDimension(width);
        const parsedHeight = parseDimension(height);

        // Determine canvas dimensions based on desired output size, not source image size
        let canvasWidth: number;
        let canvasHeight: number;

        if (parsedWidth && parsedHeight) {
          // Use explicit dimensions
          canvasWidth = Math.max(parsedWidth, 460);
          canvasHeight = Math.max(parsedHeight, 460);
        } else if (parsedWidth) {
          // Use width, maintain SVG aspect ratio
          canvasWidth = Math.max(parsedWidth, 460);
          canvasHeight = Math.max(
            (svgDimensions.height / svgDimensions.width) * canvasWidth,
            460
          );
        } else if (parsedHeight) {
          // Use height, maintain SVG aspect ratio
          canvasHeight = Math.max(parsedHeight, 460);
          canvasWidth = Math.max(
            (svgDimensions.width / svgDimensions.height) * canvasHeight,
            460
          );
        } else {
          // No explicit dimensions - use SVG dimensions or reasonable defaults
          canvasWidth = Math.max(svgDimensions.width, 460);
          canvasHeight = Math.max(svgDimensions.height, 460);
        }

        // Ensure we have valid dimensions
        if (canvasWidth <= 0 || canvasHeight <= 0) {
          URL.revokeObjectURL(svgUrl);
          reject(new Error("Invalid canvas dimensions"));
          return;
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

        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Calculate mask dimensions based on maskSize option
        // Scale mask to match image resolution
        let maskWidth: number;
        let maskHeight: number;
        let maskX = 0;
        let maskY = 0;

        switch (maskSize) {
          case "original":
            // Use SVG's extracted dimensions, but scale to image resolution
            const scaleX = canvasWidth / svgDimensions.width;
            const scaleY = canvasHeight / svgDimensions.height;
            const uniformScale = Math.min(scaleX, scaleY);
            maskWidth = svgDimensions.width * uniformScale;
            maskHeight = svgDimensions.height * uniformScale;
            // Center the mask
            maskX = (canvasWidth - maskWidth) / 2;
            maskY = (canvasHeight - maskHeight) / 2;
            break;
          case "full-width":
            // Scale mask to full width, maintain aspect ratio at top-left
            maskWidth = canvas.width;
            maskHeight =
              (svgDimensions.height / svgDimensions.width) * canvas.width;
            maskX = 0;
            maskY = 0;
            break;
          case "full-height":
            // Scale mask to full height, maintain aspect ratio at top-left
            maskHeight = canvas.height;
            maskWidth =
              (svgDimensions.width / svgDimensions.height) * canvas.height;
            maskX = 0;
            maskY = 0;
            break;
          case "full":
          default:
            // Scale mask to fill entire canvas
            maskWidth = canvas.width;
            maskHeight = canvas.height;
            break;
        }

        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the image with the appropriate imgFit behavior first
        if (imgFit === "cover") {
          // Scale image to cover entire canvas, cropping if necessary
          const scaleX = canvas.width / img.naturalWidth;
          const scaleY = canvas.height / img.naturalHeight;
          const scale = Math.max(scaleX, scaleY);

          const scaledWidth = img.naturalWidth * scale;
          const scaledHeight = img.naturalHeight * scale;
          
          // Calculate offset based on imgCoverPosition
          let offsetX: number;
          let offsetY: number;

          switch (imgCoverPosition) {
            case "top-left":
              offsetX = 0;
              offsetY = 0;
              break;
            case "top-center":
              offsetX = (canvas.width - scaledWidth) / 2;
              offsetY = 0;
              break;
            case "top-right":
              offsetX = canvas.width - scaledWidth;
              offsetY = 0;
              break;
            case "bottom-left":
              offsetX = 0;
              offsetY = canvas.height - scaledHeight;
              break;
            case "bottom-center":
              offsetX = (canvas.width - scaledWidth) / 2;
              offsetY = canvas.height - scaledHeight;
              break;
            case "bottom-right":
              offsetX = canvas.width - scaledWidth;
              offsetY = canvas.height - scaledHeight;
              break;
            case "center":
            default:
              offsetX = (canvas.width - scaledWidth) / 2;
              offsetY = (canvas.height - scaledHeight) / 2;
              break;
          }

          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        } else if (imgFit === "contain") {
          // Scale image to fit entirely within canvas, letterboxing if necessary
          const scaleX = canvas.width / img.naturalWidth;
          const scaleY = canvas.height / img.naturalHeight;
          const scale = Math.min(scaleX, scaleY);

          const scaledWidth = img.naturalWidth * scale;
          const scaledHeight = img.naturalHeight * scale;
          const offsetX = (canvas.width - scaledWidth) / 2;
          const offsetY = (canvas.height - scaledHeight) / 2;

          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        } else {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }

        // Apply the mask using destination-in to clip to mask shape
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(maskImg, maskX, maskY, maskWidth, maskHeight);

        ctx.restore();

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
      svgMask: string;
      maskSize?: "full" | "full-width" | "full-height" | "original";
      imgFit?: "cover" | "contain" | "fill";
      imgCoverPosition?: "center" | "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
    }
) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent();
  const outerRef = useRef<Object3D>(null);
  const innerRef = useRef<Object3D>(null);
  const [maskedImageSrc, setMaskedImageSrc] = useState<string | null>(null);

  // Create masked image when src or svgMask changes
  useEffect(() => {
    if (properties.svgMask) {
      if (properties.src && typeof properties.src === "string") {
        // Create masked image when both src and svgMask are provided
        createMaskedImageDataURL(
          properties.src,
          properties.svgMask,
          properties.maskSize || "full",
          properties.width as number | undefined,
          properties.height as number | undefined,
          properties.imgFit || "cover",
          properties.imgCoverPosition || "top-center"
        )
          .then(setMaskedImageSrc)
          .catch(console.error);
      } else {
        // Create transparent image from SVG when only svgMask is provided
        createTransparentImageFromSVG(
          properties.svgMask,
          properties.width as number | undefined,
          properties.height as number | undefined
        )
          .then(setMaskedImageSrc)
          .catch(console.error);
      }
    }
  }, [
    properties.src,
    properties.svgMask,
    properties.maskSize,
    properties.width,
    properties.height,
    properties.imgFit,
    properties.imgCoverPosition,
  ]);

  // Only render when masked image is ready to prevent flash of unmasked image
  const imageProperties = useMemo(
    () => ({
      ...properties,
      src: maskedImageSrc || undefined,
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
