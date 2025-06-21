import { css } from "goober";
import { motion } from "motion/react";
import { FC, useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import { DataLoader } from "../../engine/DataLoader";
import { cn } from "../../lib/cn";
import { useLocal } from "../../lib/use-local";
import { gameStore } from "../../store/game-store";
import { Ability, BattleEntity, SoulBeastUI } from "../../types";
import { useFlyingText } from "../Battle/FlyingText";

import AbilityInfo from "./AbilityInfo";

export const EnemyCard: FC<{
  idx: number;
}> = ({ idx }) => {
  const game = useSnapshot(gameStore);
  const entity = game.battleState!.entities.get(
    `player2_card${idx}`
  ) as BattleEntity;
  const hpRef = useRef<HTMLDivElement>(null);

  const flyingText = useFlyingText({ div: hpRef, direction: "down" });

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

      entity.on("damage", (event) => {
        if (event.target === `player2_card${idx}`)
          flyingText.add({
            color: "#ff4444",
            value: `${event.value}`,
            title: event.ability?.name,
            icon: `/img/abilities/${event.ability?.emoji}.webp`,
          });
      });

      entity.on("heal", (event) => {
        if (event.target === `player2_card${idx}`)
          flyingText.add({
            color: "#08ab08",
            value: `${event.value}`,
            title: event.ability?.name,
            icon: `/img/abilities/${event.ability?.emoji}.webp`,
          });
      });
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
  const cardName = entity.character.name;
  const hp = { current: entity.hp, max: entity.maxHp };

  const casting = entity.currentCast;
  if (!local.image) return null;

  const cardEvents = {
    onPointerDown: () => {
      local.hover.card = true;
      local.render();
    },
    onPointerUp: () => {
      local.hover.card = false;
      local.render();
    },
    onPointerLeave: () => {
      local.hover.card = false;
      local.render();
    },
  };

  return (
    <div className={cn("flex flex-col flex-1 relative enemy-card max-w-[200px]")}>
      <motion.div
        animate={{ opacity: 1, x: 0 }}
        initial={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.8, delay: idx * 0.5, ease: "easeOut" }}
        className="flex flex-col flex-1"
      >
        <div {...cardEvents}>
          <div
            className={cn(
              "h-[80px] overflow-hidden pointer-events-none skew-x-[-10deg]  pl-[10px]"
            )}
          >
            <img
              src={local.image}
              className={cn(
                "w-full transition-all duration-[2s] ease-out",
                local.hover.card && "-mt-[100px]"
              )}
            />
          </div>
        </div>
        <div className="absolute ml-2 text-[9px]  w-full flex justify-center z-[2]">
          <div className="flex text-black bg-white">
            {/* {JSON.stringify(entity.statusEffects)} */}
          </div>
        </div>
        <div className="absolute h-[80px] w-full bg-gradient-to-t from-black/90 from-10% to-40% to-black/0 pointer-events-none z-[2]"></div>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, x: 0 }}
        initial={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.8, delay: idx * 0.5, ease: "easeOut" }}
        className="absolute z-[4] left-[15px] top-[55px] w-full flex flex-col"
      >
        <div
          ref={hpRef}
          className="text-white text-[18px] text-shadow-lg text-shadow-black font-rocker h-[30px] -mt-[10px]"
          {...cardEvents}
        >
          {cardName}
        </div>
        <div className="flex gap-1 mr-5 items-center -ml-2" {...cardEvents}>
          <div className="flex-1 mr-1">
            <div className="border-[#f9daab] border p-[2px] skew-x-[-12deg]">
              <motion.div
                animate={{
                  width: `${(Math.ceil(hp.current) / Math.ceil(hp.max)) * 100}%`,
                }}
                className="bg-[#f9daab] h-[2px] rounded-full"
                transition={{ duration: 0.7 }}
              ></motion.div>
            </div>
          </div>
          <div className="text-white flex leading-0">
            <sup className="text-xs -mt-[3px] pr-1">{Math.ceil(hp.current)}</sup>
            <svg
              width="25"
              height="15"
              viewBox="0 0 25 15"
              fill="none"
              className="absolute ml-[10px] opacity-55"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1 14L24 1" stroke="#fff" />
            </svg>

            <sub className="text-xs"> {hp.max}</sub>
          </div>
        </div>
      </motion.div>
      <div className="absolute z-[4] ml-[15px] top-[90px] w-full flex flex-col">
        <div className="h-[36px] self-stretch -ml-3 mr-7 mt-3 flex items-stretch gap-1">
          {card?.abilities.map((ability, index) => {
            let cooldown = 0;
            let castTime = 0;

            if (entity.abilityCooldowns.has(ability.name)) {
              cooldown = entity.abilityCooldowns.get(ability.name)!;
            }
            if (entity.abilityInitiationTimes.has(ability.name)) {
              cooldown = entity.abilityInitiationTimes.get(ability.name)!;
            }

            if (!cooldown) {
              delete local.abilityStartTime[ability.name];
            }

            if (cooldown && !local.abilityStartTime[ability.name]) {
              local.abilityStartTime[ability.name] = cooldown;
            }

            if (cooldown && !local.tick) {
              local.tick = true;
              setTimeout(() => local.render());
            }

            if (casting?.ability.name === ability.name) {
              castTime = casting.timeRemaining;
            }

            if (castTime && !local.abilityCastTime[ability.name]) {
              local.abilityCastTime[ability.name] = castTime;
            }

            if (!castTime) {
              delete local.abilityCastTime[ability.name];
            }

            if (castTime && !local.tick) {
              local.tick = true;
              setTimeout(() => local.render());
            }

            const maxCooldown = local.abilityStartTime[ability.name];
            const maxCasting = local.abilityCastTime[ability.name];

            return (
              <motion.div
                key={index}
                className={cn(" flex-1")}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  local.hover.ability = ability.emoji;
                  local.render();
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  local.hover.ability = "";
                  local.selectedAbility = ability;
                  local.showAbilityInfo = true;
                  local.render();
                }}
                onPointerLeave={(e) => {
                  e.stopPropagation();
                  local.hover.ability = "";
                  local.render();
                }}
                animate={{
                  scale: local.hover.ability === ability.emoji ? 0.9 : 1,
                  opacity: local.hover.ability === ability.emoji ? 0.8 : 1,
                }}
              >
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: -20 }}
                  transition={{
                    delay: 0.5 + 1 * idx + index * 0.15,
                    ease: "easeOut",
                  }}
                  className="w-full h-full flex"
                >
                  <div
                    className={cn(
                      css`
                        background-image: url("/img/abilities/${ability.emoji}.webp");
                        background-size: 100%;
                        background-repeat: no-repeat;
                      `,
                      "skew-x-[-10deg] w-full h-full flex flex-col items-end py-[2px] px-[2px] relative",
                      cooldown && !maxCasting && "border-b-2 border-b-white",
                      local.hover.ability === ability.emoji
                        ? "border border-blue-50"
                        : "",
                      maxCasting && "border-4 border-amber-400"
                    )}
                  >
                    {maxCooldown && (
                      <>
                        <div className="absolute bg-black/50 inset-0" />
                        {cooldown && (
                          <motion.div
                            className={cn(
                              "bg-white/70 h-full absolute right-0 top-0 bottom-0"
                            )}
                            animate={{
                              width: `${Math.round((cooldown / maxCooldown) * 100)}%`,
                            }}
                            initial={{ width: "100%" }}
                          ></motion.div>
                        )}

                        <div
                          className={cn(
                            "absolute bottom-0 right-0 text-black text-xs bg-white/50 w-full flex flex-col items-center justify-center pb-1",
                            "h-[15px] leading-0 "
                          )}
                        >
                          <>{Math.round(cooldown * 10) / 10}</>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        <div className="font-megrim lowercase -ml-[16px] mr-8 mt-1 relative">
          {casting && (
            <>
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex justify-between items-center mb-1"
              >
                <div className="font-bold leading-4">
                  {casting.ability.name}
                </div>
                <div className="text-xs font-texturina min-w-[30px] text-right ">
                  {Math.round(casting.timeRemaining * 10) / 10}
                </div>
              </motion.div>
              <motion.div
                className={cn("bg-amber-400  h-[2px] absolute left-0 bottom-0")}
                animate={{
                  width: `${100 - Math.round((casting.timeRemaining / local.abilityCastTime[casting.ability.name]) * 100)}%`,
                }}
                initial={{ width: "0%" }}
              ></motion.div>
            </>
          )}
        </div>
      </div>

      <AbilityInfo
        ability={local.selectedAbility}
        isSelected={local.showAbilityInfo}
        isHovered={false}
        className={css`
          > div {
            position: fixed !important;
            height: 80vh;
            top: 45px;
            margin: 0px 10px;
            z-index: 100;
          }
        `}
        onClose={() => {
          local.showAbilityInfo = false;
          local.selectedAbility = null;
          local.render();
        }}
      />
    </div>
  );
};
