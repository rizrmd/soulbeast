import { motion } from "motion/react";
import { FC, useEffect } from "react";
import { useSnapshot } from "valtio";
import { DataLoader } from "../../engine/DataLoader";
import { useLocal } from "../../lib/use-local";
import { gameStore } from "../../store/game-store";
import { Ability, BattleEntity, SoulBeastUI } from "../../types";

const cornerWidth = 50;

export const PlayerCard: FC<{ idx: number }> = ({ idx }) => {
  const game = useSnapshot(gameStore);
  const entity = game.battleState!.entities.get(
    `player1_card${idx}`
  ) as BattleEntity;

  const local = useLocal(
    {
      init: false,
      image: "",
      hover: { card: false, ability: "" },
      card: null as null | SoulBeastUI,
      tick: false,
      ival: null as any,
      lastTick: Date.now(),
      abilityStartTime: {} as Record<string, number>,
      abilityCastTime: {} as Record<string, number>,
      selectedAbility: null as null | Ability,
      showAbilityInfo: false,
    },
    () => {
      local.init = true;
      local.render();
    }
  );
  useEffect(() => {
    if (entity.character.name) {
      local.card = DataLoader.getSoulBeast(entity.character.name);
      local.image = local.card?.image ?? "";
      local.render();
    }
  }, [entity.character.name]);

  useEffect(() => {
    clearInterval(local.ival);
    if (local.tick) {
      local.ival = setInterval(() => {
        local.lastTick = Date.now();
        if (
          Object.keys(local.abilityStartTime).length === 0 &&
          Object.keys(local.abilityCastTime).length === 0
        ) {
          clearInterval(local.ival);
          local.tick = false;
        }
        local.render();
      }, 100);
    }
  }, [local.tick]);

  const card = local.card;
  const hp = { current: entity.hp, max: entity.maxHp };

  if (!local.image) return null;

  const cardEvents = {
    onPointerDown: () => {
      local.hover.card = !local.hover.card;
      local.render();
    },
  };

  if (!card) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {local.hover.card && (
        <div
          className="fixed inset-0 z-50"
          onPointerUp={() => {
            local.hover.card = false;
            local.render();
          }}
        ></div>
      )}
      <div className={cn("flex flex-col mb-4")}>
        <div className="hidden">{game.battleState?.events.length}</div>
        <div className="flex items-end mb-2" {...cardEvents}>
          <div className="border-t border-[#f9daab] relative">
            <div className="font-rocker px-2 text-lg pt-2 pb-1">
              {card.name}
            </div>
            <div className="flex gap-p px-2 flex-col items-stretch w-[130px]">
              <div className="flex-1 mr-1 skew-x-[50deg]">
                <div className="border-[#f9daab] border p-[2px]">
                  <motion.div
                    animate={{ width: `${(hp.current / hp.max) * 100}%` }}
                    className="bg-[#f9daab] h-[2px] rounded-full "
                  ></motion.div>
                </div>
              </div>
              <div
                className={cn(
                  "flex justify-between absolute -right-[42px] -bottom-[7px]",
                  local.hover.card ? "z-[22]" : "z-[3] "
                )}
              >
                <div></div>
                <div className="text-white flex leading-0">
                  <sup className="text-xs pr-1 w-[23px] text-right">
                    {hp.current}
                  </sup>
                  <svg
                    width="25"
                    height="15"
                    viewBox="0 0 25 15"
                    fill="none"
                    className="absolute ml-[10px] opacity-55"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 14L24 1" stroke="#f9daab" />
                  </svg>

                  <sub className="text-xs"> {hp.max}</sub>
                </div>
              </div>
            </div>
          </div>
          <div
            className={cn(
              "self-stretch relative",
              css`
                width: ${cornerWidth}px;
              `
            )}
          >
            <div
              className={cn(
                "absolute inset-0",
                local.hover.card ? "z-[21]" : "z-[2]",
                css`
                  background: linear-gradient(
                    to top right,
                    rgba(0, 0, 0, 0) 0%,
                    rgba(0, 0, 0, 0) calc(50% - 0.8px),
                    #f9daab 50%,
                    rgba(0, 0, 0, 0) calc(50% + 0.8px),
                    rgba(0, 0, 0, 0) 100%
                  );
                `
              )}
            ></div>
            <svg
              width={cornerWidth}
              height="50"
              className={cn(
                "absolute inset-0",
                local.hover.card ? "z-[21]" : "z-[2]"
              )}
              viewBox={`0 0 ${cornerWidth} 50`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={`M0 0L${cornerWidth} 50H0V0Z`} fill="black" />
            </svg>
          </div>
          <div className={cn("flex-1 border-b relative border-[#f9daab]")}>
            <div
              className={cn(
                "absolute z-[1] flex items-end justify-end right-0 top-0 bottom-0 h-[58px] -mt-[58px] w-full bg-gradient-to-b from-black to-black/0 from-5% to-40%",
                css`
                  width: calc(100% + ${cornerWidth}px);
                `
              )}
            ></div>
            <div
              className={cn(
                "absolute z-0 flex w-full",
                css`
                  width: calc(100% + ${cornerWidth}px);
                `,
                local.hover.card
                  ? "h-[207px] -mt-[58px] z-20 items-end justify-start right-0 bottom-0"
                  : "h-[58px] -mt-[58px] items-start justify-start top-0 right-0 bottom-0 overflow-hidden"
              )}
            >
              <img
                src={local.image}
                className={cn(
                  "w-full absolute left-0 bottom-0 right-2 object-cover transition-all duration-300 border border-[#f9daab] border-b-0",
                  !local.hover.card ? "opacity-0 translate-y-3 scale-95" : "opacity-100"
                )}
              />
              <motion.img
                src={local.image}
                className={cn(
                  "w-full object-cover rounded",
                  local.hover.card && "hidden"
                )}
                animate={{ y: 0 }}
                initial={{ y: "-50%" }}
                transition={{
                  duration: 50,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeOut",
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex ">
          {card.abilities.map((ability, index) => {
            return (
              <motion.div
                key={index}
                className="flex-1 p-2"
                onClick={() => {
                  local.selectedAbility = ability;
                  local.showAbilityInfo = true;
                  local.render();
                }}
                onPointerDown={() => {
                  local.hover.ability = ability.emoji;
                  local.render();
                }}
                onPointerUp={() => {
                  local.hover.ability = "";
                  local.render();
                }}
                onPointerLeave={() => {
                  local.hover.ability = "";
                  local.render();
                }}
                animate={{
                  scale: local.hover.ability === ability.emoji ? 0.9 : 1,
                }}
              >
                <img
                  src={`/img/abilities/${ability.emoji}.webp`}
                  className="rounded-2xl"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
};
