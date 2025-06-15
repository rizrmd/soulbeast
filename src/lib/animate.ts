import { useFrame } from "@react-three/fiber";
import {
  Container,
  ContainerRef,
  DefaultProperties,
  Image,
  Text,
} from "@react-three/uikit";
import React, { useEffect, useMemo, useRef } from "react";
import { SpringConfig, SpringValue, useSpring } from "react-spring";
import { ImageRef, MaskedImage } from "./masked-image";
import { useLocal } from "./use-local";

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

    // Always apply styles, whether animating or not
    ref.current.setStyle(newStyles);

    // Update animation state
    if (!hasActiveAnimation && isAnimatingRef.current) {
      isAnimatingRef.current = false;
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
>(({ children, springConfig, ...props }, forwardedRef) => {
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
    props.positionTop,
    props.positionRight,
    props.positionBottom,
    props.positionLeft,
  ]);

  // Use the core animation hook
  const { ref } = useAnimatedElement<ContainerRef>(targetValues, springConfig);

  // Combine refs using the utility
  useCombineRefs(ref, forwardedRef);

  return React.createElement(Container, { ref, ...props }, children);
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
