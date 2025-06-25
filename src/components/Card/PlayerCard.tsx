import { css } from "goober";
import { motion } from "motion/react";
import { FC, useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import { cn } from "../../lib/cn";
import { useLocal } from "../../lib/use-local";
import { gameStore } from "../../store/game-store";
import { BattleEntity } from "../../types";
import { useFlyingText } from "../Battle/FlyingText";
import { PlayerTarget } from "../Battle/PlayerTarget";
import StatusIcon from "../Battle/StatusIcon";

const cornerWidth = 50;

export const PlayerCard: FC<{ idx: number }> = ({ idx }) => {
  const game = useSnapshot(gameStore);
  const entity = game.battleState!.entities.get(
    `player1_card${idx}`
  ) as BattleEntity;
  const hpRef = useRef<HTMLDivElement>(null);

  const flyingText = useFlyingText({ div: hpRef, direction: "up" });

  const local = useLocal(
    {
      init: false,
      touched: false,
      hover: { card: false, ability: "" },
      tick: false,
      ival: null as any,
      lastTick: Date.now(),
      abilityStartTime: {} as Record<string, number>,
      abilityCastTime: {} as Record<string, number>,
    },
    () => {
      local.init = true;
      local.render();

      entity.on("damage", (event) => {
        if (event.target === `player1_card${idx}`) {
          flyingText.add({
            color: "#ff4444",
            value: `${event.value}`,
            title: event.ability?.name,
            icon: `/img/abilities/${event.ability?.slug}.webp`,
          });
        }
        local.render();
      });

      entity.on("heal", (event) => {
        if (event.target === `player1_card${idx}`) {
          flyingText.add({
            color: "#08ab08",
            value: `${event.value}`,
            title: event.ability?.name,
            icon: `/img/abilities/${event.ability?.slug}.webp`,
          });
        }
        local.render();
      });

      entity.on("status_applied", local.render);
      entity.on("status_removed", local.render);
    }
  );

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

  const card = entity.character;
  const hp = { current: entity.hp, max: entity.maxHp };

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

  const casting = entity.currentCast;
  const isDead = entity.hp <= 0;

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

      <div className={cn("flex flex-col mb-4 relative player-card")}>
        {game.selectedEntity === entity.id && <PlayerTarget card={card!} />}
        <div className="hidden">{game.battleState?.events.length}</div>
        <div className="flex items-end mb-2" {...cardEvents}>
          <div className="border-t border-[#f9daab] relative">
            <div className="font-rocker px-2 text-lg pt-2 pb-1" ref={hpRef}>
              {card.name}
            </div>
            <div className="flex gap-p px-2 flex-col items-stretch w-[150px] relative">
              {isDead && (
                <div className="flex flex-col items-stretch w-full">
                  <div className="h-[1px] mt-[5px] bg-gradient-to-r from-black/0 from-0% via-50% to-100% to-black/0 via-[#f9daab] w-full"></div>
                  <div className="relative flex items-center justify-center w-full">
                    <div className="absolute bg-black px-2 mt-[-5px] font-rocker text-[#f9daab] text-sm font-black capitalize">
                      Dead
                    </div>
                  </div>
                </div>
              )}
              {!isDead && (
                <>
                  <div className="flex-1 mr-1 skew-x-[50deg]">
                    <div className="border-[#f9daab] border p-[2px]">
                      <motion.div
                        animate={{
                          width: `${(Math.ceil(hp.current) / Math.ceil(hp.max)) * 100}%`,
                        }}
                        transition={{ duration: 0.7 }}
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
                        {Math.ceil(hp.current)}
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
                </>
              )}
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
                  : "h-[50px] -mt-[50px] items-start justify-start top-0 right-0 bottom-0 overflow-hidden"
              )}
            >
              <img
                src={card.image}
                className={cn(
                  "w-full absolute left-0 bottom-0 right-2 object-cover transition-all duration-300 border border-[#f9daab] border-b-0",
                  !local.hover.card
                    ? "opacity-0 translate-y-3 scale-95"
                    : "opacity-100"
                )}
              />
              <motion.img
                src={card.image}
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

              <div
                className={cn(
                  "absolute z-[2] bottom-0 text-[9px]  w-full flex justify-center items-end",
                  css`
                    margin-left: ${cornerWidth / 2}px;
                  `
                )}
              >
                <StatusIcon
                  entityId={entity.id}
                  className="mb-1 skew-x-[-10deg]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[100px] mt-2 px-2">
          {entity.character.abilities.map((ability, index) => {
            const selected = game.selectedAbility === ability.name;

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
              <div
                key={index}
                className={cn("flex-1 p-2 relative skew-x-[-10deg]")}
                onClick={(e) => {
                  e.stopPropagation();
                  if (local.touched) {
                    local.touched = false;
                    return;
                  }
                  if (gameStore.selectedAbility === ability.name) {
                    gameStore.selectedAbility = "";
                  } else {
                    gameStore.selectedAbility = ability.name;
                  }
                  gameStore.selectedEntity = entity.id;
                }}
                onTouchStart={() => {
                  local.touched = true;
                  if (gameStore.selectedAbility === ability.name) {
                    gameStore.selectedAbility = "";
                  } else {
                    gameStore.selectedAbility = ability.name;
                  }
                  gameStore.selectedEntity = entity.id;
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  local.hover.ability = ability.slug;
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
              >
                {selected && (
                  <motion.div
                    animate={{ y: 0, opacity: 1 }}
                    initial={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute pointer-events-none text-[#f9daab] top-[-18px] left-0 right-0 flex justify-center"
                  >
                    ▼
                  </motion.div>
                )}

                <div
                  className={cn(
                    "absolute inset-0 m-1",
                    maxCasting
                      ? "border-3 border-[#febc00]"
                      : selected && "border rounded-lg border-[#f9daab]"
                  )}
                ></div>
                {maxCasting && (
                  <div className="absolute top-3 left-3 font-black font-rocker text-sm text-[#febc00]">
                    Casting
                  </div>
                )}

                {maxCooldown && (
                  <div className="absolute top-3 left-3 font-black font-rocker text-sm text-[white]">
                    Cooldown
                  </div>
                )}
                <motion.img
                  animate={
                    maxCasting
                      ? { scale: 0.95 }
                      : {
                          scale:
                            local.hover.ability === ability.slug || selected
                              ? 0.9
                              : 1,
                        }
                  }
                  transition={{ duration: 0.2 }}
                  src={`/img/abilities/${ability.slug}.webp`}
                  className={cn(
                    "w-full  h-full object-cover pointer-events-none transition-all",
                    (maxCooldown || maxCasting) && "opacity-50"
                  )}
                />

                {maxCasting && (
                  <>
                    {casting?.timeRemaining && (
                      <div
                        className={cn(
                          "absolute bottom-[34px] h-[3px] left-1 right-1 flex justify-end "
                        )}
                      >
                        <motion.div
                          animate={{
                            width: `calc(${Math.round((casting?.timeRemaining / maxCasting) * 100)}% )`,
                          }}
                          initial={{ width: "100%" }}
                          className="bg-[#febc00]  h-full"
                        ></motion.div>
                      </div>
                    )}

                    <div
                      className={cn(
                        "absolute  text-black text-xs bg-[#febc00]  flex flex-col items-center justify-center pb-1",
                        "h-[25px] leading-0 left-2 bottom-2 right-2"
                      )}
                    >
                      <>{Math.round(casting!.timeRemaining * 10) / 10}</>
                    </div>
                  </>
                )}
                {maxCooldown && (
                  <>
                    {cooldown && (
                      <div
                        className={cn(
                          "absolute bottom-[33px] h-[3px] left-2 right-2 flex justify-end "
                        )}
                      >
                        <motion.div
                          animate={{
                            width: `calc(${Math.round((cooldown / maxCooldown) * 100)}% )`,
                          }}
                          initial={{ width: "100%" }}
                          className="bg-white  h-full"
                        ></motion.div>
                      </div>
                    )}

                    <div
                      className={cn(
                        "absolute  text-black text-xs bg-white/70  flex flex-col items-center justify-center pb-1",
                        "h-[25px] leading-0 left-2 bottom-2 right-2"
                      )}
                    >
                      <>{Math.round(cooldown * 10) / 10}</>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const BoxCorner = () => {
  return (
    <>
      <img
        src="/img/battle/boxsq/box-tl.webp"
        className="absolute pointer-events-none top-[3px] left-[3px] w-[30px] h-[30px]"
      />
      <img
        src="/img/battle/boxsq/box-tr.webp"
        className="absolute pointer-events-none top-[3px] right-[3px] w-[30px] h-[30px]"
      />
      <img
        src="/img/battle/boxsq/box-bl.webp"
        className="absolute pointer-events-none bottom-[3px] left-[3px] w-[30px] h-[30px]"
      />
      <img
        src="/img/battle/boxsq/box-br.webp"
        className="absolute pointer-events-none bottom-[3px] right-[3px] w-[30px] h-[30px]"
      />
    </>
  );
};
