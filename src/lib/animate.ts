import { ThreeEvent, useFrame } from "@react-three/fiber";
import {
  Container,
  ContainerRef,
  DefaultProperties,
  Image,
  Text,
} from "@react-three/uikit";
import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { SpringConfig, SpringValue, useSpring } from "react-spring";
import { ImageRef, MaskedImage } from "./masked-image";
import { useLocal } from "./use-local";

// Hook for inertial scrolling logic
const useInertialScrolling = (
  enabled: boolean,
  ref: RefObject<ContainerRef | null>
) => {
  const scrollState = useLocal({
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    isDragging: false,
    lastPointerTime: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    startX: 0, // Track starting position to detect if there was actual movement
    startY: 0,
    hasMoved: false, // Track if pointer has moved significantly
    ignoreSpring: false, // Flag to ignore spring values after a tap
    hasLoggedIgnoreSpring: false, // Flag to prevent console spam
    containerRef: null as any, // Store container ref for boundary checking
  });

  const [scrollSpring, scrollApi] = useSpring(() => ({
    x: 0,
    y: 0, // Keep y for compatibility but don't use it for horizontal-only scrolling
    config: { precision: 0.0001, clamp: true, friction: 500, tension: 1000 },
  }));

  useEffect(() => {
    if (scrollState.ignoreSpring) {
      scrollApi.stop(); // Stop any ongoing animation when ignoring spring
    }
  }, [scrollState.ignoreSpring]);

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!enabled) return;

      const currentTime = Date.now();
      // Use client coordinates for proper pixel-based tracking
      const currentX = event.nativeEvent.clientX;
      const currentY = event.nativeEvent.clientY;

      console.log("Pointer down:", {
        currentX,
        currentY,
        currentScrollX: scrollState.x,
      });

      scrollState.isDragging = true;
      scrollState.lastPointerTime = currentTime;
      scrollState.lastPointerX = currentX;
      scrollState.lastPointerY = currentY;
      scrollState.startX = currentX; // Track starting position
      scrollState.startY = currentY;
      scrollState.hasMoved = false; // Reset movement flag
      scrollState.hasLoggedIgnoreSpring = false; // Reset log flag for new interaction
      scrollState.ignoreSpring = false; // Reset ignore spring flag for new interaction
      scrollState.velocityX = 0;
      scrollState.velocityY = 0; // Always keep Y velocity at 0 for horizontal-only scrolling

      // Only stop ongoing animation if there's actually an animation running
      if (scrollSpring.x.isAnimating || scrollSpring.y.isAnimating) {
        console.log("Stopping ongoing animation");
        scrollApi.stop();
      }

      // Sync spring values with current scroll state to prevent jumps
      scrollApi.set({ x: scrollState.x, y: scrollState.y });
    },
    [enabled, scrollApi, scrollState, scrollSpring]
  );

  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!enabled) return;

      if (!scrollState.isDragging) return;

      const currentTime = Date.now();
      // Use client coordinates for proper pixel-based tracking
      const currentX = event.nativeEvent.clientX;
      const currentY = event.nativeEvent.clientY;

      // Check if pointer has moved significantly from start position
      const totalDeltaX = Math.abs(currentX - scrollState.startX);
      const totalDeltaY = Math.abs(currentY - scrollState.startY);
      const minMovement = 5; // Minimum pixels to consider it a drag, not a tap

      if (totalDeltaX > minMovement || totalDeltaY > minMovement) {
        scrollState.hasMoved = true;
        scrollState.ignoreSpring = false; // Re-enable spring control when movement detected
        scrollState.hasLoggedIgnoreSpring = false; // Reset log flag when movement detected
        // Sync spring values with current scroll state when re-enabling spring control
        scrollApi.set({ x: scrollState.x, y: scrollState.y });
      }

      // Only process scrolling if there's been significant movement
      if (!scrollState.hasMoved) {
        console.log("No movement detected, skipping scroll update");
        return;
      }

      const deltaTime = Math.max(currentTime - scrollState.lastPointerTime, 1);
      // For horizontal-only scrolling, only handle X direction
      // Moving pointer right should scroll content left (increase scroll position)
      const deltaX = scrollState.lastPointerX - currentX; // Invert direction
      // Don't calculate deltaY for horizontal-only scrolling

      // Calculate velocity (pixels per millisecond) - only for X direction
      // Use a smoothing factor to avoid erratic velocity calculations
      const velocityX = deltaX / deltaTime;
      const smoothedVelocityX = scrollState.velocityX * 0.8 + velocityX * 0.2;

      // Only accumulate X scroll position, keep Y at 0 for horizontal-only scrolling
      let newX = scrollState.x + deltaX;
      const newY = 0; // Always keep Y at 0 for horizontal-only scrolling

      // Clamp scroll position between 0 and max scroll position
      const maxScrollPosition = ref.current?.maxScrollPosition!.peek()![0]!;
      newX = Math.max(0, Math.min(newX, maxScrollPosition));

      console.log("Scroll update:", { deltaX, newX, currentX: scrollState.x });

      // Update scroll position immediately - only X direction changes
      scrollApi.set({ x: newX, y: newY });

      scrollState.x = newX;
      scrollState.y = newY;
      scrollState.velocityX = smoothedVelocityX;
      scrollState.velocityY = 0; // Always 0 for horizontal-only scrolling
      scrollState.lastPointerTime = currentTime;
      scrollState.lastPointerX = currentX;
      scrollState.lastPointerY = currentY;
    },
    [enabled, scrollApi, scrollState]
  );

  const handlePointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!enabled || !ref.current) return;

      if (!scrollState.isDragging) return;

      console.log("Pointer up:", {
        hasMoved: scrollState.hasMoved,
        velocityX: scrollState.velocityX,
        currentScrollX: scrollState.x,
      });

      // Only apply inertia if there was actual movement (not just a tap)
      if (!scrollState.hasMoved) {
        // This was just a tap, don't apply any scrolling or inertia
        console.log("Tap detected - no scrolling applied");
        // Set flag to ignore spring values and maintain current position
        console.log("Maintaining position at:", { x: scrollState.x, y: 0 });
        scrollState.ignoreSpring = true;
        scrollApi.stop(); // Stop any ongoing animation
        scrollState.isDragging = false;
        scrollState.velocityX = 0;
        scrollState.velocityY = 0;
        scrollState.hasMoved = false;
        e.stopPropagation();
        return;
      }

      // Check if we're at scroll boundaries and should stop inertia
      const currentScrollX = scrollState.x;
      const maxScrollPosition = ref.current?.maxScrollPosition!.peek()![0]!;

      // Stop inertia if at boundaries
      if (currentScrollX <= 0 || currentScrollX >= maxScrollPosition) {
        console.log("At scroll boundary - stopping inertia:", {
          currentScrollX,
          maxScrollPosition,
          atLeftBoundary: currentScrollX <= 0,
          atRightBoundary: currentScrollX >= maxScrollPosition,
        });

        scrollState.isDragging = false;
        scrollState.velocityX = 0;
        scrollState.velocityY = 0;
        scrollState.hasMoved = false;
        scrollApi.stop();
        return;
      }

      // Apply inertial scrolling based on velocity - only for horizontal direction
      // Increase momentum factor for much more glidey scrolling
      const momentumX = scrollState.velocityX * 5000; // Increased from 500 to 800 for more glide
      // No momentum for Y direction in horizontal-only scrolling

      let finalX = scrollState.x + momentumX;
      const finalY = 0; // Always keep Y at 0 for horizontal-only scrolling

      // Clamp final position to boundaries
      finalX = Math.max(0, Math.min(finalX, maxScrollPosition));

      console.log("Inertia:", {
        velocityX: scrollState.velocityX,
        momentumX,
        currentX: scrollState.x,
        finalX,
        maxScrollPosition,
        hasMoved: scrollState.hasMoved,
      });

      // Re-enable spring control for inertia
      scrollState.ignoreSpring = false;
      // Sync spring to current state before starting inertia animation
      scrollApi.set({ x: scrollState.x, y: scrollState.y });

      // Apply inertia for even smaller velocities to capture gentle swipes
      if (Math.abs(scrollState.velocityX) > 0.05) {
        // Animate to final position with much smoother deceleration
        scrollApi.start({
          x: finalX,
          y: finalY,
          onRest: () => {
            scrollState.velocityX = 0;
            scrollState.velocityY = 0;
          },
        });
      }

      scrollState.isDragging = false;
      scrollState.velocityX = 0;
      scrollState.velocityY = 0;
      scrollState.hasMoved = false;
    },
    [enabled, scrollApi, scrollState]
  );

  return {
    scrollSpring,
    scrollState,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp, // Treat pointer leave as pointer up
      onPointerCancel: handlePointerUp, // Handle pointer cancel as well
    },
  };
};

// Extended SpringConfig with optional delay and from values
export interface ExtendedSpringConfig extends SpringConfig {
  delay?: number;
  from?: Record<string, any>;
  duration?: number;
}

// Types for different UI components
type AnimatableRef = {
  setStyle: (styles: Record<string, any>) => void;
};

// Core animation hook that provides the most complete animation logic
export const useAnimatedElement = <T extends AnimatableRef>(
  targetValues: Record<string, any>,
  springConfig?: ExtendedSpringConfig
) => {
  const ref = useRef<T>(null);
  const isAnimatingRef = useRef(false);

  const { delay, from, duration, ...config } = springConfig || {};

  const [springs, api] = useSpring(() => ({
    from: from || targetValues,
    to: targetValues,
    delay: delay || 0,
    config,
    onStart: () => {
      isAnimatingRef.current = true;
    },
    onRest: () => {
      isAnimatingRef.current = false;
    },
  }));

  // Handle target value changes and trigger animations
  useEffect(() => {
    api.stop();
    api.start({
      to: targetValues,
      delay: delay || 0,
      config,
      onStart: () => {
        isAnimatingRef.current = true;
      },
      onRest: () => {
        isAnimatingRef.current = false;
      },
    });
  }, [api, targetValues, delay, config]);

  // Apply spring values to the element's styles on each frame
  useFrame(() => {
    if (!ref.current) return;

    let hasActiveAnimation = false;
    const newStyles: Record<string, any> = {};

    for (const [key, s] of Object.entries(springs)) {
      if (s instanceof SpringValue) {
        // Always apply the current spring value
        newStyles[key] = s.get();

        // Check if there's any active animation (including delayed ones)
        if (s.isAnimating || s.isDelayed) {
          hasActiveAnimation = true;
        }
      }
    }

    // Update animation state
    if (!hasActiveAnimation && isAnimatingRef.current) {
      isAnimatingRef.current = false;
    }

    if (hasActiveAnimation || isAnimatingRef.current) {
      ref.current.setStyle(newStyles);
      isAnimatingRef.current = true;
    }
  });

  return { ref, springs, api, isAnimating: isAnimatingRef.current };
};

// Utility to extract animatable properties for different component types
export const extractAnimatableProps = {
  container: (props: any) => ({
    width: props.width,
    height: props.height,
    marginTop: props.marginTop,
    marginRight: props.marginRight,
    marginBottom: props.marginBottom,
    marginLeft: props.marginLeft,
    paddingTop: props.paddingTop,
    paddingRight: props.paddingRight,
    paddingBottom: props.paddingBottom,
    paddingLeft: props.paddingLeft,
    borderTopWidth: props.borderTopWidth,
    borderRightWidth: props.borderRightWidth,
    borderBottomWidth: props.borderBottomWidth,
    borderLeftWidth: props.borderLeftWidth,
    borderWidth: props.borderWidth,
    borderTopLeftRadius: props.borderTopLeftRadius,
    borderTopRightRadius: props.borderTopRightRadius,
    borderBottomLeftRadius: props.borderBottomLeftRadius,
    borderBottomRightRadius: props.borderBottomRightRadius,
    borderRadius: props.borderRadius,
    borderOpacity: props.borderOpacity,
    backgroundOpacity: props.backgroundOpacity,
    backgroundColor: props.backgroundColor,
    positionTop: props.positionTop,
    positionRight: props.positionRight,
    positionBottom: props.positionBottom,
    positionLeft: props.positionLeft,
  }),

  defaultProperties: (props: any) => ({
    width: props.width,
    height: props.height,
    marginTop: props.marginTop,
    marginRight: props.marginRight,
    marginBottom: props.marginBottom,
    marginLeft: props.marginLeft,
    paddingTop: props.paddingTop,
    paddingRight: props.paddingRight,
    paddingBottom: props.paddingBottom,
    paddingLeft: props.paddingLeft,
    borderTopWidth: props.borderTopWidth,
    borderRightWidth: props.borderRightWidth,
    borderBottomWidth: props.borderBottomWidth,
    borderLeftWidth: props.borderLeftWidth,
    borderWidth: props.borderWidth,
    borderTopLeftRadius: props.borderTopLeftRadius,
    borderTopRightRadius: props.borderTopRightRadius,
    borderBottomLeftRadius: props.borderBottomLeftRadius,
    borderBottomRightRadius: props.borderBottomRightRadius,
    borderRadius: props.borderRadius,
    borderOpacity: props.borderOpacity,
    positionTop: props.positionTop,
    positionRight: props.positionRight,
    positionBottom: props.positionBottom,
    positionLeft: props.positionLeft,
    opacity: props.opacity,
  }),

  image: (props: any) => ({
    width: props.width,
    height: props.height,
    marginTop: props.marginTop,
    marginRight: props.marginRight,
    marginBottom: props.marginBottom,
    marginLeft: props.marginLeft,
    paddingTop: props.paddingTop,
    paddingRight: props.paddingRight,
    paddingBottom: props.paddingBottom,
    paddingLeft: props.paddingLeft,
    borderTopWidth: props.borderTopWidth,
    borderRightWidth: props.borderRightWidth,
    borderBottomWidth: props.borderBottomWidth,
    borderLeftWidth: props.borderLeftWidth,
    borderWidth: props.borderWidth,
    borderTopLeftRadius: props.borderTopLeftRadius,
    borderTopRightRadius: props.borderTopRightRadius,
    borderBottomLeftRadius: props.borderBottomLeftRadius,
    borderBottomRightRadius: props.borderBottomRightRadius,
    borderRadius: props.borderRadius,
    borderOpacity: props.borderOpacity,
    positionTop: props.positionTop,
    positionRight: props.positionRight,
    positionBottom: props.positionBottom,
    positionLeft: props.positionLeft,
    opacity: props.opacity,
  }),

  text: (props: any) => ({
    width: props.width,
    height: props.height,
    marginTop: props.marginTop,
    marginRight: props.marginRight,
    marginBottom: props.marginBottom,
    marginLeft: props.marginLeft,
    paddingTop: props.paddingTop,
    paddingRight: props.paddingRight,
    paddingBottom: props.paddingBottom,
    paddingLeft: props.paddingLeft,
    opacity: props.opacity,
    fontSize: props.fontSize,
  }),
};

// Utility to filter out undefined values and create memoized target values
export const useAnimatableTargetValues = (
  animatableProps: Record<string, any>,
  dependencies: any[]
) => {
  return useMemo(() => {
    return Object.fromEntries(
      Object.entries(animatableProps).filter(
        ([_, value]) => value !== undefined
      )
    );
  }, dependencies);
};

// Utility to combine refs properly
export const useCombineRefs = <T>(
  internalRef: React.RefObject<T>,
  forwardedRef: React.ForwardedRef<T>
) => {
  useEffect(() => {
    if (forwardedRef && internalRef.current) {
      if (typeof forwardedRef === "function") {
        forwardedRef(internalRef.current);
      } else {
        forwardedRef.current = internalRef.current;
      }
    }
  });
};

// Animated Container component using the modular approach
const AnimatedContainer = React.forwardRef<
  ContainerRef,
  React.ComponentProps<typeof Container> & {
    springConfig?: ExtendedSpringConfig;
  }
>(({ children, springConfig, overflow, ...props }, forwardedRef) => {
  const animatableProps = extractAnimatableProps.container(props);

  // Create memoized target values
  const targetValues = useAnimatableTargetValues(animatableProps, [
    props.width,
    props.height,
    props.marginTop,
    props.marginRight,
    props.marginBottom,
    props.marginLeft,
    props.paddingTop,
    props.paddingRight,
    props.paddingBottom,
    props.paddingLeft,
    props.borderTopWidth,
    props.borderRightWidth,
    props.borderBottomWidth,
    props.borderLeftWidth,
    props.borderWidth,
    props.borderTopLeftRadius,
    props.borderTopRightRadius,
    props.borderBottomLeftRadius,
    props.borderBottomRightRadius,
    props.borderRadius,
    props.borderOpacity,
    props.backgroundOpacity,
    props.backgroundColor,
    props.positionTop,
    props.positionRight,
    props.positionBottom,
    props.positionLeft,
  ]);

  // Use the core animation hook
  const { ref } = useAnimatedElement<ContainerRef>(targetValues, springConfig);

  // Add inertial scrolling when overflow is "scroll"
  const isScrollable = overflow === "scroll";
  const { scrollSpring, handlers, scrollState } = useInertialScrolling(
    isScrollable,
    ref
  );

  // Combine refs using the utility
  useCombineRefs(ref, forwardedRef);

  // Apply scroll position when scrollable
  useFrame(() => {
    if (isScrollable && ref.current && ref.current.scrollPosition) {
      // Store the container ref for boundary checking
      scrollState.containerRef = ref.current;

      let scrollX, scrollY;

      // Use spring values unless we're ignoring them after a tap
      if (scrollState.ignoreSpring) {
        scrollX = scrollState.x;
        scrollY = 0;
        // Only log once to avoid console spam
        if (!scrollState.hasLoggedIgnoreSpring) {
          console.log("Ignoring spring, using state values:", {
            scrollX,
            scrollY,
          });
          scrollState.hasLoggedIgnoreSpring = true;
        }
      } else {
        scrollX = scrollSpring.x.get();
        scrollY = 0; // Always 0 for horizontal-only scrolling

        // Apply scroll position to the container with bounds checking
        // Only apply positive scroll values for horizontal scrolling
        const maxScrollPosition = ref.current!.maxScrollPosition!.peek()![0]!;
        const clampedX = Math.max(0, Math.min(scrollX, maxScrollPosition));
        const clampedY = 0; // Always 0 for horizontal-only scrolling

        // Only update if the scroll position has actually changed to avoid unnecessary updates
        const currentScrollPos = ref.current.scrollPosition.value;
        if (
          !currentScrollPos ||
          Math.abs(currentScrollPos[0] - clampedX) > 0.1 ||
          Math.abs(currentScrollPos[1] - clampedY) > 0.1
        ) {
          ref.current.scrollPosition.value = [clampedX, clampedY];
        }

        // Update our internal state to match the spring value during animation (but not when ignoring spring)
        if (!scrollState.ignoreSpring && scrollSpring.x.isAnimating) {
          scrollState.x = scrollX;
        }
      }
    }
  });

  // Prepare container props with pointer handlers if scrollable
  const containerProps = isScrollable
    ? { ref, overflow, ...handlers, ...props }
    : { ref, overflow, ...props };

  return React.createElement(Container, containerProps, children);
});

AnimatedContainer.displayName = "AnimatedContainer";

// Animated MaskedImage component using the modular approach
const AnimatedMaskedImage = React.forwardRef<
  ImageRef,
  React.ComponentProps<typeof MaskedImage> & {
    springConfig?: ExtendedSpringConfig;
    visibility?: string;
  }
>(({ children, springConfig, ...props }, forwardedRef) => {
  // Extract animatable properties using the utility
  const animatableProps = extractAnimatableProps.image(props);

  // Create memoized target values
  const targetValues = useAnimatableTargetValues(animatableProps, [
    props.width,
    props.height,
    props.marginTop,
    props.marginRight,
    props.marginBottom,
    props.marginLeft,
    props.paddingTop,
    props.paddingRight,
    props.paddingBottom,
    props.paddingLeft,
    props.borderTopWidth,
    props.borderRightWidth,
    props.borderBottomWidth,
    props.borderLeftWidth,
    props.borderWidth,
    props.borderTopLeftRadius,
    props.borderTopRightRadius,
    props.borderBottomLeftRadius,
    props.borderBottomRightRadius,
    props.borderRadius,
    props.borderOpacity,
    props.positionTop,
    props.positionRight,
    props.positionBottom,
    props.positionLeft,
    props.opacity,
  ]);

  // Use the core animation hook
  const { ref } = useAnimatedElement<ImageRef>(targetValues, springConfig);

  // Combine refs using the utility
  useCombineRefs(ref, forwardedRef);

  return React.createElement(MaskedImage, { ref, ...props }, children);
});

AnimatedMaskedImage.displayName = "AnimatedMaskedImage";

// Animated Image component using the modular approach
const AnimatedImage = React.forwardRef<
  any,
  React.ComponentProps<typeof Image> & {
    springConfig?: ExtendedSpringConfig;
    visibility?: string;
  }
>(({ children, springConfig, visibility, ...props }, forwardedRef) => {
  // Extract animatable properties using the utility
  const animatableProps = extractAnimatableProps.image(props);

  // Create memoized target values
  const targetValues = useAnimatableTargetValues(animatableProps, [
    props.width,
    props.height,
    props.marginTop,
    props.marginRight,
    props.marginBottom,
    props.marginLeft,
    props.paddingTop,
    props.paddingRight,
    props.paddingBottom,
    props.paddingLeft,
    props.borderTopWidth,
    props.borderRightWidth,
    props.borderBottomWidth,
    props.borderLeftWidth,
    props.borderWidth,
    props.borderTopLeftRadius,
    props.borderTopRightRadius,
    props.borderBottomLeftRadius,
    props.borderBottomRightRadius,
    props.borderRadius,
    props.borderOpacity,
    props.positionTop,
    props.positionRight,
    props.positionBottom,
    props.positionLeft,
    props.opacity,
  ]);

  // Use the core animation hook
  const { ref } = useAnimatedElement<any>(targetValues, springConfig);

  // Combine refs using the utility
  useCombineRefs(ref, forwardedRef);

  return React.createElement(Image, { ref, ...props, visibility }, children);
});

AnimatedImage.displayName = "AnimatedImage";

// Animated Text component using the modular approach
const AnimatedText = React.forwardRef<
  any,
  React.ComponentProps<typeof Text> & {
    springConfig?: ExtendedSpringConfig;
    visibility?: string;
  }
>(({ children, springConfig, visibility, ...props }, forwardedRef) => {
  // Extract animatable properties using the utility
  const animatableProps = extractAnimatableProps.text(props);

  // Create memoized target values
  const targetValues = useAnimatableTargetValues(animatableProps, [
    props.width,
    props.height,
    props.marginTop,
    props.marginRight,
    props.marginBottom,
    props.marginLeft,
    props.paddingTop,
    props.paddingRight,
    props.paddingBottom,
    props.paddingLeft,
    props.opacity,
    props.fontSize,
  ]);

  // Use the core animation hook
  const { ref } = useAnimatedElement<any>(targetValues, springConfig);

  // Combine refs using the utility
  useCombineRefs(ref, forwardedRef);

  return React.createElement(Text, { ref, ...props, children });
});

AnimatedText.displayName = "AnimatedText";

// Animated DefaultProperties component using the modular approach
// This properly integrates with react-three/uikit's property inheritance system
const AnimatedDefaultProperties = (
  props: React.ComponentProps<typeof DefaultProperties> & {
    springConfig?: ExtendedSpringConfig;
    children?: React.ReactNode;
    opacity?: number;
    visibility?: string;
  }
) => {
  const animatableProps = extractAnimatableProps.defaultProperties(props);
  // Create memoized target values
  const targetValues = useAnimatableTargetValues(animatableProps, [
    props.width,
    props.height,
    props.marginTop,
    props.marginRight,
    props.marginBottom,
    props.marginLeft,
    props.paddingTop,
    props.paddingRight,
    props.paddingBottom,
    props.paddingLeft,
    props.borderTopWidth,
    props.borderRightWidth,
    props.borderBottomWidth,
    props.borderLeftWidth,
    props.borderWidth,
    props.borderTopLeftRadius,
    props.borderTopRightRadius,
    props.borderBottomLeftRadius,
    props.borderBottomRightRadius,
    props.borderRadius,
    props.borderOpacity,
    props.positionTop,
    props.positionRight,
    props.positionBottom,
    props.positionLeft,
    props.opacity,
  ]);
  const local = useLocal({ props: targetValues });
  const isAnimatingRef = useRef(false);

  const { delay, from, duration, ...config } = props.springConfig || {};

  const [springs, api] = useSpring(() => ({
    from: from || targetValues,
    to: targetValues,
    delay: delay || 0,
    config,
    onStart: () => {
      isAnimatingRef.current = true;
    },
    onRest: () => {
      isAnimatingRef.current = false;
    },
  }));

  // Handle target value changes and trigger animations
  useEffect(() => {
    if (props.visibility !== "hidden") {
      api.start({
        to: targetValues,
        delay: delay || 0,
        config,
        onStart: () => {
          isAnimatingRef.current = true;
        },
        onRest: () => {
          isAnimatingRef.current = false;
        },
      });
    }
  }, [api, targetValues, props.visibility, delay, config]);

  useFrame(() => {
    if (!isAnimatingRef.current) return;

    let hasActiveAnimation = false;

    for (const [key, s] of Object.entries(springs)) {
      if (s instanceof SpringValue) {
        if (s.isAnimating || s.isDelayed) {
          local.props[key] = s.get();
          hasActiveAnimation = true;
        }
      }
    }

    if (hasActiveAnimation) {
      local.render();
    } else {
      isAnimatingRef.current = false;
    }
  });

  return React.createElement(
    DefaultProperties,
    { ...local.props },
    props.children
  );
};

AnimatedDefaultProperties.displayName = "AnimatedDefaultProperties";

/**
 * Usage example for animate.DefaultProperties:
 *
 * <animate.DefaultProperties
 *   width={100}
 *   height={50}
 *   marginTop={10}
 *   springConfig={{
 *     tension: 300,
 *     friction: 30,
 *     delay: 100,
 *     from: { width: 0, height: 0 }
 *   }}
 * >
 *   <SomeUIContent />
 * </animate.DefaultProperties>
 */

// Export as animate.Container and animate.MaskedImage
export const animate = {
  Container: AnimatedContainer,
  MaskedImage: AnimatedMaskedImage,
  Image: AnimatedImage,
  Text: AnimatedText,
  DefaultProperties: AnimatedDefaultProperties,
};
