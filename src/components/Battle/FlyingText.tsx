import React, { useState, useEffect, FC } from "react";
import { motion } from "motion/react";
import { useLocal } from "../../lib/use-local";
import { cn } from "../../lib/cn";
import { css } from "goober";

interface FlyingTextItem {
  id: string;
  text: string;
  title?: string;
  icon?: string;
  color: string;
  x: number;
  y: number;
  direction: "up" | "down";
  startTime: number;
}

// Global state for flying text items
let flyingTextItems: FlyingTextItem[] = [];
let flyingTextListeners: (() => void)[] = [];

const addFlyingTextItem = (item: FlyingTextItem) => {
  flyingTextItems.push(item);
  flyingTextListeners.forEach((listener) => listener());
};

const removeFlyingTextItem = (id: string) => {
  flyingTextItems = flyingTextItems.filter((item) => item.id !== id);
  flyingTextListeners.forEach((listener) => listener());
};

const getRelativePosition = (
  element: HTMLDivElement,
  parent: HTMLDivElement
) => {
  const elementRect = element.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();

  return {
    x: elementRect.left - parentRect.left + elementRect.width / 2,
    y: elementRect.top - parentRect.top + elementRect.height / 2,
  };
};

export const useFlyingText = (arg: {
  div: React.RefObject<HTMLDivElement | null>;
  direction: "down" | "up";
}) => {
  const flying = {
    add: (params: {
      icon?: string;
      title?: string;
      value: string;
      color?: string;
    }) => {
      if (!arg.div.current) return;

      const id = Math.random().toString(36).substring(2, 9);
      const rect = arg.div.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const item: FlyingTextItem = {
        id,
        text: params.value,
        title: params.title,
        icon: params.icon,
        color: params.color || "#ffffff",
        x,
        y,
        direction: arg.direction,
        startTime: Date.now(),
      };

      addFlyingTextItem(item);
    },
  };

  return flying;
};

const dist = 30;

const FlyingTextComponent: React.FC<{
  item: FlyingTextItem;
  parent: HTMLDivElement;
}> = ({ item, parent }) => {
  const local = useLocal({ done: false });
  useEffect(() => {
    const timer = setTimeout(() => {
      removeFlyingTextItem(item.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [item.id]);

  // Calculate relative position based on parent
  const parentRect = parent.getBoundingClientRect();
  const relativeX = item.x - parentRect.left;
  const relativeY = item.y - parentRect.top;

  return (
    <div
      className={cn(
        "absolute z-[7] flex pointer-events-none",
        css`
          left: ${relativeX}px;
          top: ${relativeY}px;
        `
      )}
    >
      <motion.div
        animate={
          !local.done
            ? { y: item.direction === "up" ? -dist : dist, opacity: 1 }
            : { y: item.direction === "up" ? -dist * 2 : dist * 2, opacity: 0 }
        }
        initial={
          !local.done
            ? { y: 0, opacity: 0 }
            : { y: item.direction === "up" ? dist : -dist, opacity: 1 }
        }
        transition={{
          duration: 1,
          ease: local.done ? "easeIn" : "easeOut",
          onComplete() {
            setTimeout(() => {
              local.done = true;
              local.render();
            }, 500);
          },
        }}
        className={cn("flex flex-col ")}
      >
        {item.title && (
          <div className="font-megrim text-xs font-black skew-x-[-10deg] bg-black ml-1 px-1 whitespace-nowrap text-white">
            {item.title.toLowerCase()}
          </div>
        )}
        <div className="flex flex-row skew-x-[-10deg]">
          {item.icon && <img src={item.icon} className="w-[25px] h-[25px]" />}
          <div
            className={cn(
              "font-megrim text-base font-black px-2",
              css`
                background-color: ${item.color};
                color: white;
              `
            )}
          >
            {item.text}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const FlyingTextRoot: FC<{ parent: HTMLDivElement }> = ({ parent }) => {
  const [items, setItems] = useState<FlyingTextItem[]>([]);

  useEffect(() => {
    const updateItems = () => {
      setItems([...flyingTextItems]);
    };

    flyingTextListeners.push(updateItems);

    return () => {
      flyingTextListeners = flyingTextListeners.filter(
        (listener) => listener !== updateItems
      );
    };
  }, []);

  return (
    <>
      {items.map((item) => (
        <FlyingTextComponent key={item.id} item={item} parent={parent} />
      ))}
    </>
  );
};
