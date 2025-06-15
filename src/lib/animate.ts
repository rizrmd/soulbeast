import React from "react";
import { useFrame } from "@react-three/fiber";
import { Container, ContainerRef } from "@react-three/uikit";
import { useEffect, useRef } from "react";
import { SpringConfig, useSpring, SpringValue } from "react-spring";
import { MaskedImage, ImageRef } from "./masked-image";

export const animBase = (
  targetValues: Record<string, any>,
  config?: SpringConfig
) => {
  const ref = useRef(null as unknown as ContainerRef);
  const initConfig = useRef({ init: false }).current;

  const [spring, api] = useSpring(() => ({ ...targetValues, config }));

  // Update spring when targetValues change
  useEffect(() => {
    api.start({ to: targetValues, config });
  }, [JSON.stringify(targetValues), config]);

  useEffect(() => {
    if (!initConfig.init && ref.current) {
      initConfig.init = true;
      for (const [k, v] of Object.entries(spring)) {
        const springValue = v as SpringValue;
        springValue.finish();
        ref.current?.setStyle({ [k]: springValue.get() });
      }
    }
  }, []);

  useFrame(() => {
    for (const [k, v] of Object.entries(spring)) {
      const springValue = v as SpringValue;
      if (springValue.isAnimating) {
        ref.current?.setStyle({ [k]: springValue.get() });
      }
    }
  });

  return ref;
};

// Animated Container component
const AnimatedContainer = React.forwardRef<
  ContainerRef,
  React.ComponentProps<typeof Container> & {
    springConfig?: SpringConfig;
  }
>(({ children, springConfig, ...props }, forwardedRef) => {
  const ref = useRef<ContainerRef>(null);
  const initConfig = useRef({ init: false }).current;

  // Extract animatable properties (focus on common layout properties)
  const animatableProps = {
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
  };

  // Filter out undefined values
  const targetValues = Object.fromEntries(
    Object.entries(animatableProps).filter(([_, value]) => value !== undefined)
  );

  const [spring, api] = useSpring(() => ({
    ...targetValues,
    config: springConfig || { tension: 300, friction: 30 },
  }));

  // Update spring when target values change
  useEffect(() => {
    if (Object.keys(targetValues).length > 0) {
      api.start({ to: targetValues, config: springConfig });
    }
  }, [JSON.stringify(targetValues), springConfig, api]);

  // Initialize styles on first render
  useEffect(() => {
    if (
      !initConfig.init &&
      ref.current &&
      Object.keys(targetValues).length > 0
    ) {
      initConfig.init = true;
      for (const [k, v] of Object.entries(spring)) {
        const springValue = v as SpringValue;
        springValue.finish();
        ref.current?.setStyle({ [k]: springValue.get() });
      }
    }
  }, [spring, targetValues]);

  // Apply animated values each frame
  useFrame(() => {
    if (ref.current && Object.keys(targetValues).length > 0) {
      for (const [k, v] of Object.entries(spring)) {
        const springValue = v as SpringValue;
        if (springValue.isAnimating) {
          ref.current?.setStyle({ [k]: springValue.get() });
        }
      }
    }
  });

  // Combine refs
  useEffect(() => {
    if (forwardedRef) {
      if (typeof forwardedRef === "function") {
        forwardedRef(ref.current);
      } else {
        forwardedRef.current = ref.current;
      }
    }
  }, [forwardedRef]);

  return React.createElement(Container, { ref, ...props }, children);
});

AnimatedContainer.displayName = "AnimatedContainer";

// Animated MaskedImage component
const AnimatedMaskedImage = React.forwardRef<
  ImageRef,
  React.ComponentProps<typeof MaskedImage> & {
    springConfig?: SpringConfig;
  }
>(({ children, springConfig, ...props }, forwardedRef) => {
  const ref = useRef<ImageRef>(null);
  const initConfig = useRef({ init: false }).current;

  // Extract animatable properties (focus on common layout properties)
  const animatableProps = {
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
  };

  // Filter out undefined values
  const targetValues = Object.fromEntries(
    Object.entries(animatableProps).filter(([_, value]) => value !== undefined)
  );

  const [spring, api] = useSpring(() => ({
    ...targetValues,
    config: springConfig || { tension: 300, friction: 30 },
  }));

  // Update spring when target values change
  useEffect(() => {
    if (Object.keys(targetValues).length > 0) {
      api.start({ to: targetValues, config: springConfig });
    }
  }, [JSON.stringify(targetValues), springConfig, api]);

  // Initialize styles on first render
  useEffect(() => {
    if (
      !initConfig.init &&
      ref.current &&
      Object.keys(targetValues).length > 0
    ) {
      initConfig.init = true;
      for (const [k, v] of Object.entries(spring)) {
        const springValue = v as SpringValue;
        springValue.finish();
        ref.current?.setStyle({ [k]: springValue.get() });
      }
    }
  }, [spring, targetValues]);

  // Apply animated values each frame
  useFrame(() => {
    if (ref.current && Object.keys(targetValues).length > 0) {
      for (const [k, v] of Object.entries(spring)) {
        const springValue = v as SpringValue;
        if (springValue.isAnimating) {
          ref.current?.setStyle({ [k]: springValue.get() });
        }
      }
    }
  });

  // Combine refs
  useEffect(() => {
    if (forwardedRef) {
      if (typeof forwardedRef === "function") {
        forwardedRef(ref.current);
      } else {
        forwardedRef.current = ref.current;
      }
    }
  }, [forwardedRef]);

  return React.createElement(MaskedImage, { ref, ...props }, children);
});

AnimatedMaskedImage.displayName = "AnimatedMaskedImage";

// Export as animate.Container and animate.MaskedImage
export const animate = {
  Container: AnimatedContainer,
  MaskedImage: AnimatedMaskedImage, // Add MaskedImage to animate namespace
};
