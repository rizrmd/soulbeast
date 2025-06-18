import { motion } from "motion/react";
import { FC, useEffect } from "react";
import { DataLoader } from "../../engine/DataLoader";
import { useLocal } from "../../lib/use-local";
import { BattleEntity, SoulBeastUI } from "../../types";
import { useSnapshot } from "valtio";
import { gameStore } from "../../store/game-store";

export const EnemyCard: FC<{
  idx: number;
}> = ({ idx }) => {
  const game = useSnapshot(gameStore);
  const entity = game.battleState!.entities.get(
    `player2_card${idx}`
  ) as BattleEntity;

  const local = useLocal({
    image: "",
    hover: { card: false, ability: "" },
    card: null as null | SoulBeastUI,
    tick: false,
    ival: null as any,
    lastTick: Date.now(),
    abilityStartTime: {} as Record<string, number>,
    abilityCastTime: {} as Record<string, number>,
  });
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
    <div className={cn("flex flex-col flex-1 relative")}>
      <motion.div
        animate={{
          scale: local.hover.card ? 0.9 : 1,
          opacity: local.hover.card ? 0.8 : 1,
        }}
        {...cardEvents}
      >
        <div
          className={cn(
            "h-[80px] overflow-hidden pointer-events-none skew-x-[-10deg]  pl-[10px]"
          )}
        >
          <img src={local.image} className={cn("w-full")} />
        </div>
      </motion.div>
      <div className="absolute h-[80px] w-full bg-gradient-to-t from-black/90 from-10% to-40% to-black/0 pointer-events-none z-10"></div>
      <div className="absolute z-20 left-[15px] top-[55px] w-full flex flex-col">
        <div
          className="text-white text-[18px] text-shadow-lg text-shadow-black font-rocker h-[30px] -mt-[10px]"
          {...cardEvents}
        >
          {cardName}
        </div>
        <div className="flex gap-1 mr-5 items-center -ml-2" {...cardEvents}>
          <div className="flex-1 mr-1">
            <div className="border-[#f9daab] border p-[2px] skew-x-[-12deg]">
              <div
                className="bg-[#f9daab] h-[2px] rounded-full"
                style={{
                  width: `${(hp.current / hp.max) * 100}%`,
                }}
              ></div>
            </div>
          </div>
          <div className="text-white flex leading-0">
            <sup className="text-xs -mt-[3px] pr-1">{hp.current}</sup>
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
        <div className="h-[26px] self-stretch -ml-3 mr-7 mt-3 flex items-stretch gap-1">
          {card?.abilities.map((ability, index) => {
            let cooldown = 0;
            let casting = 0;

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

            if (entity.currentCast?.ability.name === ability.name) {
              casting = entity.currentCast.timeRemaining;
            }

            if (casting && !local.abilityCastTime[ability.name]) {
              local.abilityCastTime[ability.name] = casting;
            }

            if (!casting) {
              delete local.abilityCastTime[ability.name];
            }
            
            if (casting && !local.tick) {
              local.tick = true;
              setTimeout(() => local.render());
            }

            const maxCooldown = local.abilityStartTime[ability.name];
            const maxCasting = local.abilityCastTime[ability.name];

            return (
              <motion.div
                key={index}
                className=" flex-1"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  local.hover.ability = ability.emoji;
                  local.render();
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  local.hover.ability = "";
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
                <div
                  className={cn(
                    css`
                      background-image: url("/img/abilities/${ability.emoji}.webp");
                      background-size: 100%;
                      background-repeat: no-repeat;
                    `,
                    "skew-x-[-10deg] border-b-2 w-full h-full flex flex-col items-end py-[2px] px-[2px] relative",
                    cooldown ? "border-b-transparent" : "border-b-white"
                  )}
                >
                  {maxCooldown && (
                    <>
                      <div className="absolute bg-black/50 inset-0" />
                      {cooldown && (
                        <motion.div
                          className={cn(
                            "bg-white h-full absolute right-0 top-0 bottom-0"
                          )}
                          animate={{
                            width: `${Math.round((cooldown / maxCooldown) * 100)}%`,
                          }}
                          initial={{ width: "100%" }}
                        ></motion.div>
                      )}
                      {casting && (
                        <motion.div
                          className={cn(
                            "bg-amber-500 h-full absolute left-0 top-0 bottom-0"
                          )}
                          animate={{
                            width: `${Math.round((casting / maxCasting) * 100)}%`,
                          }}
                          initial={{ width: "100%" }}
                        ></motion.div>
                      )}

                      <div className="absolute bottom-0 right-0 text-black text-xs bg-white/50 w-full flex items-center justify-center leading-0 h-[15px] pb-1">
                        {Math.round(cooldown * 10) / 10}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
