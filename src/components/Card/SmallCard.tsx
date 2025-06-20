import { motion } from "motion/react";
import { FC, useEffect } from "react";
import { DataLoader } from "../../engine/DataLoader";
import { useLocal } from "../../lib/use-local";
import { SoulBeastName } from "../../types";

export const SmallCard: FC<{
  cardName?: SoulBeastName;
  variant?: "regular" | "radial";
  selected?: boolean;
  onClick?: (cardName: string) => void;
  className?: string;
}> = ({ cardName, variant = "regular", selected, onClick, className }) => {
  const local = useLocal({
    clicked: false,
    selected: null as unknown as boolean,
    selsize: { w: 0, h: 0 },
  });
  const card = (cardName && DataLoader.getSoulBeast(cardName)) || {
    abilities: [],
    composition: {},
    name: "???",
    title: "",
    image: "/img/battle/ornament.webp",
  };

  useEffect(() => {
    if (local.selected === null) {
      local.selected = false;
    }
    local.selected = selected || false;
    local.render();
  }, [selected]);

  return (
    <motion.div
      className={cn(
        "flex flex-1 rounded-3xl relative flex-col items-center",
        css`
          background-image: url("${card.image}");
          background-size: cover;
        `,
        className
      )}
      onPointerDown={() => {
        local.clicked = true;
        local.render();
      }}
      onPointerUp={() => {
        if (local.clicked && onClick) {
          onClick(card.name);
        }
        local.clicked = false;
        local.render();
      }}
      onPointerLeave={() => {
        local.clicked = false;
        local.render();
      }}
      animate={{
        opacity: local.clicked ? 0.5 : 1,
        scale: local.clicked ? 0.95 : 1,
      }}
    >
      <motion.img
        src="/img/battle/line-select.webp"
        className={cn(
          "absolute top-0 w-[80%] pointer-events-none",
          css`
            margin-top: -${local.selsize.h / 2}px;
          `
        )}
        animate={{
          opacity: local.selected ? 1 : 0,
          y: local.selected ? 0 : -10,
        }}
        transition={{ ease: "easeInOut" }}
        initial={{ opacity: 0, y: -10, scaleY: -1 }}
        ref={(e) => {
          let render = false;
          if (e?.offsetHeight) {
            local.selsize.h = e.offsetHeight;
            render = true;
          }
          if (e?.offsetWidth) {
            local.selsize.w = e.offsetWidth;
            render = true;
          }
          if (render) {
            local.render();
          }
        }}
      />

      <div
        className={cn(
          "self-stretch flex-1 rounded-3xl flex flex-col items-center justify-end leading-0 pb-5",
          variant === "regular" &&
            "bg-gradient-to-t from-black/90 from-15% to-80% to-slate-50/0",
          variant === "radial" && "bg-conic-90 from-black/80 to-black/0"
        )}
      >
        <div className="font-rocker text-xl leading-4 text-shadow-black text-shadow-sm">{card.name}</div>
        {card.title && (
          <div className="text-[13px] leading-5 ">{card.title}</div>
        )}
      </div>

      <motion.img
        src="/img/battle/line-select.webp"
        className={cn(
          "absolute bottom-0 w-[80%] pointer-events-none",
          css`
            margin-bottom: -${local.selsize.h / 2}px;
          `
        )}
        animate={{
          opacity: local.selected ? 1 : 0,
          y: local.selected ? 0 : 20,
        }}
        transition={{ ease: "easeInOut" }}
        initial={{ opacity: 0, y: 20 }}
      />
    </motion.div>
  );
};
