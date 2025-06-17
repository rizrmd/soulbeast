import { motion } from "motion/react";
import { DataLoader } from "../engine/DataLoader";
import { useLocal } from "../lib/use-local";
import { Ability, SoulBeastName, SoulBeastUI } from "../types";
import { SmallCard } from "./Card/SmallCard";
const CardSelection = () => {
  const local = useLocal({
    selected: {
      index: 0,
      cards: { "0": undefined, "1": undefined } as Record<
        string,
        SoulBeastName | undefined
      >,
      card: undefined as void | SoulBeastUI,
    },
    hover: "",
    scroll: null as HTMLDivElement | null,
    cardsEl: {} as Record<string, HTMLDivElement>,
    ability: {
      hover: "",
      selected: "",
      current: null as null | Ability,
    },
    pressed: false,
  });
  const card = local.selected.card;
  const ability = local.ability.current;
  const count = Object.values(local.selected.cards).filter((e) => e).length;
  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="p-3 flex items-stretch gap-3 max-h-[20%] flex-1">
        <SmallCard cardName="Keth Stalker" />
        <SmallCard cardName="Bone Thurak" />
      </div>
      <div className="relative flex items-center justify-center pointer-events-none h-[3%]">
        <motion.img
          src="/img/battle/vs.webp"
          className={cn("absolute w-1/5 z-[10] mb-[10px]")}
          animate={{ scale: 0.8 }}
          initial={{ scale: 0.6 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        ></motion.img>
        <div className="h-[1px] mt-[5px] bg-gradient-to-r from-black/0 to-black/0 via-[#feac59] absolute w-full z-[9]"></div>
      </div>
      <div className="p-3 flex items-stretch gap-3 max-h-[15%] flex-1">
        {["0", "1"].map((index) => {
          return (
            <SmallCard
              key={index}
              selected={local.selected.index === parseInt(index)}
              cardName={local.selected.cards[index]}
              className={
                local.selected.cards[index]
                  ? "shadow-2xl shadow-amber-400"
                  : " "
              }
              onClick={() => {
                local.selected.index = parseInt(index);

                if (local.selected.cards[index]) {
                  local.selected.card = DataLoader.getSoulBeast(
                    local.selected.cards[index]
                  ) as unknown as SoulBeastUI;

                  const el = local.cardsEl[local.selected.card.name];
                  if (el) {
                    el.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                      inline: "center",
                    });
                  }
                }

                local.render();
              }}
            />
          );
        })}
      </div>
      <div
        className={cn(
          "overflow-x-auto overflow-y-hidden snap-x snap-mandatory overscroll-x-auto flex h-[40%] px-[10px] gap-[10px] flex-nowrap relative items-stretch mt-3",
          css`
            scrollbar-color: white black;
          `
        )}
        ref={(el) => {
          if (el) local.scroll = el;
        }}
      >
        {Object.entries(DataLoader.getAllSoulBeasts()).map(
          ([, card], index) => {
            const selected =
              local.selected.cards["0"] === card.name ||
              local.selected.cards["1"] === card.name;
            return (
              <div
                className={cn("snap-center aspect-[2/3] relative", css``)}
                key={index}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  local.hover = card.name;
                  local.render();
                }}
                ref={(e) => {
                  local.cardsEl[card.name] = e as HTMLDivElement;
                }}
                onPointerOut={() => {
                  local.hover = "";
                  local.render();
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();

                  e.currentTarget.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                  });
                  if (local.hover !== card.name) {
                    local.hover = "";
                    local.render();
                    return;
                  }

                  const idx = Object.values(local.selected.cards).findIndex(
                    (e) => e === card.name
                  );

                  if (idx < 0) {
                    local.selected.cards[local.selected.index] = card.name;
                    local.selected.card = card;
                  } else {
                    local.selected.cards[idx] = undefined;
                    local.selected.card = undefined;
                  }

                  local.hover = "";
                  local.render();
                }}
              >
                <motion.img
                  src={card.image}
                  animate={{
                    scale: local.hover === card.name || selected ? 0.95 : 1,
                  }}
                  className="object-cover h-full rounded-2xl w-full pointer-events-none"
                />
                <motion.div
                  animate={{
                    opacity: selected ? 1 : 0,
                    scale: selected ? 1 : 1.2,
                  }}
                  initial={{ opacity: 0, scale: 1.2 }}
                  transition={{ ease: "easeIn", duration: 0.1 }}
                  className={cn(
                    "w-full h-full absolute inset-0 rounded-xl pointer-events-none",
                    css`
                      background-image: url("/img/battle/rect-select.webp");
                      background-size: 100% 100%;
                      background-repeat: no-repeat;
                    `
                  )}
                ></motion.div>
              </div>
            );
          }
        )}
      </div>
      <div className="flex-1 flex-col flex min-h-[170px]">
        {card ? (
          <>
            <div className="flex flex-row flex-1 items-center pr-4  ">
              <div className="flex flex-col pl-2 flex-1 justify-end">
                <motion.div
                  animate={{ y: 0, opacity: 1 }}
                  initial={{ y: 20, opacity: 0 }}
                  className="font-rocker p-2 pb-0 -mt-1 -mb-2 text-2xl"
                >
                  {card.name}
                </motion.div>
                <motion.div
                  animate={{ y: 0, opacity: 1 }}
                  initial={{ y: 20, opacity: 0 }}
                  className="p-2 pt-0 text-sm"
                >
                  {card.title}
                </motion.div>
              </div>
              <motion.div
                className={cn(
                  "font-rocker w-[150px] h-[40px] flex items-center justify-center",
                  css`
                    background-image: url("/img/battle/button.webp");
                    background-size: 150px 40px;
                  `
                )}
                onPointerDown={() => {
                  local.pressed = true;
                  local.render();
                }}
                onPointerUp={() => {
                  local.pressed = false;
                  local.render();
                }}
                animate={{
                  scale: local.pressed ? 0.96 : 1,
                  opacity: local.pressed ? 0.7 : 1,
                  y: local.pressed ? 2 : 0,
                }}
                onClick={() => {
                  if (
                    Object.values(local.selected.cards).filter((e) => e)
                      .length < 2
                  ) {
                    local.selected.index = Object.values(
                      local.selected.cards
                    ).findIndex((e) => !e);
                    local.selected.card = null as any;
                    local.render();
                  }
                }}
              >
                {count === 2 ? "To Battle" : "Next Card"}
              </motion.div>
            </div>
            <div
              className={cn("relative")}
              onPointerDown={() => {
                local.ability.hover = local.ability.selected;
                local.render();
              }}
              onPointerUp={() => {
                local.ability.selected = "";
                local.ability.current = null;
                local.render();
              }}
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{
                  y: !local.ability.selected ? 40 : 0,
                  opacity: !ability ? 0 : 1,
                  scale: local.ability.hover ? 0.96 : 1,
                }}
                className={cn(
                  "absolute border border-amber-200 min-h-[550px] h-[60vh] bottom-[10px] left-2 right-2 bg-gradient-to-t from-black from-40% to-black/60 z-100",
                  !ability && "pointer-events-none"
                )}
              >
                <BoxCorner />

                {ability && (
                  <div className="pt-0 flex flex-col items-center">
                    <div className="relative mt-5">
                      <BoxCorner />
                      <img
                        src={`/img/abilities/${ability.emoji}.webp`}
                        className="w-[200px] h-[200px] border border-amber-100"
                        alt={ability.name}
                      />
                    </div>
                    <div className="text-2xl font-rocker mt-5 px-2">
                      {ability.name}
                    </div>
                    <div className="text-center px-6">
                      {ability.description}
                    </div>

                    <div className="border-t self-stretch border-t-amber-200/50 mt-3 pt-2 px-4  flex-1 flex flex-col">
                      <div className="text-center">{ability.effect}</div>

                      <table
                        className={cn(
                          "border border-amber-200/50 m-3",
                          css`
                            td {
                              padding: 0px 6px;
                              font-size: 14px;
                              padding-bottom: 2px;

                              &.font-mono {
                                font-size: 12px;
                                padding-top: 4px;
                              }
                            }
                          `
                        )}
                      >
                        <tbody>
                          <tr className="border-b border-amber-200/50">
                            <td className="text-left border-r min-w-[110px] border-amber-200/50 pr-2">
                              Initiation Time
                            </td>
                            <td className="text-left pl-2 w-full font-mono">
                              {ability.initiationTime
                                ? `${ability.initiationTime}s`
                                : "Instant"}
                            </td>
                          </tr>
                          <tr className="border-b border-amber-200/50">
                            <td className="text-left border-r border-amber-200/50 pr-2">
                              Cast Time
                            </td>
                            <td className="text-left pl-2 w-full font-mono">
                              {ability.castTime
                                ? `${ability.castTime}s`
                                : "Instant"}
                            </td>
                          </tr>
                          <tr className="border-b border-amber-200/50">
                            <td className="text-left border-r border-amber-200/50 pr-2">
                              Cooldown
                            </td>
                            <td className="text-left pl-2 w-full font-mono">
                              {ability.cooldown}s
                            </td>
                          </tr>
                          <tr>
                            <td className="text-left border-r border-amber-200/50 pr-2">
                              Damage
                            </td>
                            <td className="text-left pl-2 w-full font-mono">
                              {ability.damage}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="flex gap-4 p-4 pt-0 flex-1 items-start">
              {card.abilities.map((ability, index) => (
                <div
                  className={cn(
                    "flex flex-1 items-stretch aspect-square relative"
                  )}
                  key={index}
                >
                  <motion.div
                    animate={{
                      opacity: local.ability.selected === ability.name ? 1 : 0,
                      scale: local.ability.selected === ability.name ? 1 : 1.2,
                    }}
                    initial={{ opacity: 0, scale: 1.2 }}
                    className={cn(
                      "absolute z-10 inset-[-10%] w-[120%]",
                      css`
                        background-image: url("/img/battle/square-select.png");
                        background-size: cover;
                      `
                    )}
                  ></motion.div>
                  <motion.div
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: local.ability.hover === ability.name ? 0.95 : 1,
                      borderWidth:
                        local.ability.selected === ability.name ? 2 : 0,
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    transition={{
                      delay:
                        (local.ability.hover || local.ability.selected) ===
                        ability.name
                          ? 0
                          : index * 0.1,
                      duration: 0.1,
                    }}
                    className={cn(
                      css`
                        background-image: url("/img/abilities/${ability.emoji}.webp");
                        background-size: cover;
                      `,
                      "w-full h-full flex-1 rounded-2xl absolute z-20 border-amber-200"
                    )}
                    onPointerDown={() => {
                      local.ability.hover = ability.name;
                      local.render();
                    }}
                    onPointerUp={() => {
                      if (local.ability.hover == ability.name) {
                        if (local.ability.selected === ability.name) {
                          local.ability.selected = "";
                          local.ability.current = null;
                        } else {
                          local.ability.current = ability;
                          local.ability.selected = ability.name;
                        }
                      }

                      local.ability.hover = "";
                      local.render();
                    }}
                    onPointerLeave={() => {
                      local.ability.hover = "";
                      local.render();
                    }}
                  ></motion.div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            animate={{ y: 0, opacity: 1 }}
            initial={{ y: 20, opacity: 0 }}
            className=" flex items-center justify-center self-stretch flex-1 flex-col"
          >
            <div className="font-rocker p-2 pb-0 text-2xl">
              {count === 1 ? "Select Last Card" : "Card Empty"}
            </div>
            <div className="p-2 pt-0">
              {" "}
              {count === 1 ? "Choose your final card" : "Select card above"}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CardSelection;

const BoxCorner = () => {
  return (
    <>
      <img
        src="/img/battle/box/top-left.png"
        className="absolute pointer-events-none top-[3px] left-[3px] w-[30px] h-[30px]"
      />
      <img
        src="/img/battle/box/top-right.png"
        className="absolute pointer-events-none top-[3px] right-[3px] w-[30px] h-[30px]"
      />
      <img
        src="/img/battle/box/bottom-left.png"
        className="absolute pointer-events-none bottom-[3px] left-[3px] w-[30px] h-[30px]"
      />
      <img
        src="/img/battle/box/bottom-right.png"
        className="absolute pointer-events-none bottom-[3px] right-[3px] w-[30px] h-[30px]"
      />
    </>
  );
};
