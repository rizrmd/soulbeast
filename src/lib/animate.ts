import { useFrame } from "@react-three/fiber";
import {
  Container,
  ContainerRef,
  DefaultProperties,
  Image,
  Text,
} from "@react-three/uikit";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SpringConfig, SpringValue, useSpring } from "react-spring";
import { ImageRef, MaskedImage } from "./masked-image";

// Extended SpringConfig with optional delay and from values
export interface ExtendedSpringConfig extends SpringConfig {
  delay?: number;
  from?: Record<string, any>;
}

// Types for different UI components
type AnimatableRef = {
  setStyle: (styles: Record<string, any>) => void;
};

// Core animation hook that provides the most complete animation logic
export const useAnimatedElement = <T extends AnimatableRef>(
  targetValues: Record<string, any>,
  springConfig?: ExtendedSpringConfig,
  visibility?: string
) => {
  const ref = useRef<T>(null);

  // Extract delay and from values from config
  const { delay, from, ...config } = springConfig || {};

  // Create spring animation with target values
  const [springs, api] = useSpring(() => ({
    to: targetValues,
    from: from || {},
    delay: delay || 0,
    config: config,
  }));

  // Update animation when target values change (and not hidden)
  useEffect(() => {
    if (visibility !== "hidden") {
      api.start({
        to: targetValues,
        config: config,
      });
    } else {
      const cur = ref.current as { isVisible?: boolean };
      if (cur.isVisible) {
        api.stop();
      }
    }
  }, [targetValues, api, config, visibility]);

  // Use frame loop to apply animated values to the element
  useFrame(() => {
    if (ref.current && ref.current.setStyle && visibility !== "hidden") {
      let isAnimating = false;
      const currentStyles: Record<string, any> = {};
      Object.entries(springs).forEach(([key, s]) => {
        if (s instanceof SpringValue) {
          if (s.isAnimating || s.isDelayed || !s.hasAnimated) {
            isAnimating = true;
            currentStyles[key] = s.get();
          }
        }
      });

      if (isAnimating) {
        ref.current.setStyle(currentStyles);
      }
    }
  });

  return { ref };
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
    visibility?: string;
  }
>(({ children, springConfig, visibility, ...props }, forwardedRef) => {
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
  const { ref } = useAnimatedElement<ContainerRef>(
    targetValues,
    springConfig,
    visibility
  );

  // Combine refs using the utility
  useCombineRefs(ref, forwardedRef);

  return React.createElement(
    Container,
    { ref, ...props, visibility },
    children
  );
});

AnimatedContainer.displayName = "AnimatedContainer";

// Animated MaskedImage component using the modular approach
const AnimatedMaskedImage = React.forwardRef<
  ImageRef,
  React.ComponentProps<typeof MaskedImage> & {
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
    props.opacity,
  ]);

  // Use the core animation hook
  const { ref } = useAnimatedElement<ImageRef>(
    targetValues,
    springConfig,
    visibility
  );

  // Combine refs using the utility
  useCombineRefs(ref, forwardedRef);

  return React.createElement(
    MaskedImage,
    { ref, ...props, visibility },
    children
  );
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
    props.opacity,
  ]);

  // Use the core animation hook
  const { ref } = useAnimatedElement<any>(
    targetValues,
    springConfig,
    visibility
  );

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
  const { ref } = useAnimatedElement<any>(
    targetValues,
    springConfig,
    visibility
  );

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
  const [animatedProps, setAnimatedProps] = useState<Record<string, any>>({});

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

  const { delay, from, ...config } = props.springConfig || {};
  const [springs, api] = useSpring(() => ({
    to: targetValues,
    from: from || {},
    delay: delay || 0,
    config,
  }));

  // Handle visibility changes to start/stop animation
  useEffect(() => {
    if (props.visibility === "hidden") {
      // Stop the animation
      api.stop();
    } else if (props.visibility === "visible") {
      // Restart the animation
      api.start({
        to: targetValues,
        from: from || {},
        delay: delay || 0,
        config: config,
      });
    }
  }, [props.visibility, targetValues, api, delay, from, config]);

  // Update animation when target values change (and not hidden)
  useEffect(() => {
    if (props.visibility !== "hidden") {
      api.start({
        to: targetValues,
        config: config,
      });
    }
  }, [targetValues, api, config, props.visibility]);

  // Initialize with target values if empty
  useEffect(() => {
    if (Object.keys(animatedProps).length === 0) {
      setAnimatedProps(targetValues);
    }
  }, [targetValues, animatedProps]);

  useFrame(() => {
    if (props.visibility === "hidden") {
      return;
    }

    let isAnimating = false;
    const currentStyles: Record<string, any> = {};

    Object.entries(springs).forEach(([key, s]) => {
      if (s instanceof SpringValue) {
        if (s.isAnimating || s.isDelayed || !s.hasAnimated) {
          isAnimating = true;
          currentStyles[key] = s.get();
        }
      }
    });

    if (isAnimating) {
      setAnimatedProps((prev) => {
        // Only update if values actually changed to prevent unnecessary re-renders
        const hasChanged = Object.entries(currentStyles).some(
          ([key, value]) => prev[key] !== value
        );
        return hasChanged ? { ...prev, ...currentStyles } : prev;
      });
    }
  });

  // Extract non-animatable props to pass through
  const { springConfig, children, visibility, ...remainingProps } = props;
  const nonAnimatableProps = Object.fromEntries(
    Object.entries(remainingProps).filter(
      ([key]) => !Object.prototype.hasOwnProperty.call(animatableProps, key)
    )
  );

  // Merge animated values with non-animatable props
  const mergedProps = { ...nonAnimatableProps, ...animatedProps };

  return React.createElement(DefaultProperties, mergedProps, children);
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
