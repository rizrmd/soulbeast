import { motion } from "motion/react";
import { DataLoader } from "../engine/DataLoader";
import { useLocal } from "../lib/use-local";
import { Ability, SoulBeastName, SoulBeastUI } from "../types";
import { SmallCard } from "./Card/SmallCard";
import { gameActions, gameStore } from "../store/game-store";
import { useSnapshot } from "valtio";
import AbilityInfo from "./Card/AbilityInfo";

const CardSelection = () => {
  const game = useSnapshot(gameStore);
  const local = useLocal(
    {
      max: {
        enemy: 1,
        player: 1,
      },
      selected: {
        index: 0,
        cards: { "0": undefined, "1": undefined } as Record<
          string,
          SoulBeastName | undefined
        >,
        card: undefined as void | SoulBeastUI,
        final: false,
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
    },
    () => {
      gameActions.selectRandomCards("player2", 1);
      // gameActions.selectRandomCards("player1",1);
      // gameActions.startBattle();
    }
  );
  const card = local.selected.card;
  const ability = local.ability.current;
  const count = Object.values(local.selected.cards).filter((e) => e).length;
  return (
    <div className="flex flex-col flex-1 h-full">
      {local.selected.final && (
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="bg-black absolute inset-0 z-[9]"
        ></motion.div>
      )}
      <div className="p-3 flex items-stretch gap-3 max-h-[20%] flex-1 justify-center">
        {[...Array(local.max.enemy)].map((_, index) => (
          <SmallCard key={index} cardName={game.player2Cards[index]} />
        ))}
      </div>
      <div className="relative flex items-center justify-center pointer-events-none h-[3%] -mt-5 mb-3">
        <motion.img
          src="/img/battle/vs.webp"
          className={cn("absolute w-1/5 z-[10] mb-[10px]")}
          animate={{
            scale: local.selected.final ? 3 : 0.8,
            opacity: local.selected.final ? 0 : 1,
          }}
          initial={{ scale: 0.6 }}
          transition={
            local.selected.final
              ? { duration: 2, ease: "backOut" }
              : {
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }
          }
        ></motion.img>
        <div className="h-[1px] mt-[5px] bg-gradient-to-r from-black/0 to-black/0 via-[#feac59] absolute w-full z-[7]"></div>
      </div>
      <div className="p-3 flex items-stretch gap-3 max-h-[15%] flex-1 justify-center">
        {[...Array(local.max.player)].map((_, index) => {
          return (
            <SmallCard
              key={index}
              selected={local.selected.index === index}
              cardName={local.selected.cards[index]}
              className={
                local.selected.cards[index]
                  ? "shadow-2xl shadow-amber-400"
                  : " "
              }
              onClick={() => {
                local.selected.index = index;

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
          "overflow-x-auto transition-all overflow-y-hidden snap-x snap-mandatory overscroll-x-auto flex h-[40%] px-[10px] gap-[10px] flex-nowrap relative items-stretch mt-3",
          css`
            scrollbar-color: white black;
          `
        )}
        ref={(el) => {
          if (el) local.scroll = el;
        }}
        onWheel={(e) => {
          e.currentTarget.scrollBy({ left: e.deltaY, behavior: "auto" });
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
                      .length < local.max.player
                  ) {
                    local.selected.index = Object.values(
                      local.selected.cards
                    ).findIndex((e) => !e);
                    local.selected.card = null as any;
                    local.render();
                  } else {
                    local.selected.final = true;
                    local.render();
                    setTimeout(() => {
                      for (const card of Object.values(local.selected.cards)) {
                        if (card)
                          gameActions.addToPlayer1(card as SoulBeastName);
                      }

                      gameActions.startBattle();
                    }, 1000);
                  }
                }}
              >
                {count === local.max.player ? "To Battle" : "Next Card"}
              </motion.div>
            </div>
            <AbilityInfo
              ability={ability}
              isSelected={!!local.ability.selected}
              isHovered={local.ability.hover === local.ability.selected}
              onClose={() => {
                local.ability.selected = "";
                local.ability.current = null;
                local.render();
              }}
            />

            <div className="flex gap-4 p-4 pt-0 flex-1 items-start">
              {card.abilities.map((ability, index) => (
                <div
                  className={cn(
                    "flex flex-1 items-stretch aspect-square relative"
                  )}
                  key={index}
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
                      "w-full h-full flex-1 rounded-2xl absolute z-[8] border-amber-200"
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
              {count === local.max.player ? "Select Last Card" : "Card Empty"}
            </div>
            <div className="p-2 pt-0">
              {" "}
              {count === local.max.player
                ? "Choose your final card"
                : "Select card above"}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CardSelection;
