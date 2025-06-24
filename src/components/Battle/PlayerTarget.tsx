import { motion } from "motion/react";
import { FC } from "react";
import { useSnapshot } from "valtio";
import { DataLoader } from "../../engine/DataLoader";
import { cn } from "../../lib/cn";
import { useLocal } from "../../lib/use-local";
import { gameActions, gameStore } from "../../store/game-store";
import { BattleEntity, SoulBeastUI } from "../../types";
import { AbilityTable } from "../Card/AbilityInfo";

export const PlayerTarget: FC<{ card: SoulBeastUI }> = ({ card }) => {
  const local = useLocal({ detail: false });
  const game = useSnapshot(gameStore);

  const ability = card.abilities.find((e) => e.name === game.selectedAbility);
  if (!game.selectedAbility || !game.selectedEntity || !ability) return null;

  const entities = [...game.battleState!.entities.values()];
  const cur = game.selectedEntity.split("_")[0];
  const friend = entities.filter((e) => e.id.startsWith(cur));
  const enemy = entities.filter((e) => !e.id.startsWith(cur));
  const self = entities.find((e) => e.id === game.selectedEntity);

  let cooldown = false;
  const casting = self?.currentCast;

  // Check if ability is in cooldown
  const cooldownState = self?.abilityCooldowns.get(ability.name);
  if (cooldownState) {
    cooldown = true;
  }

  // Check if ability has initial delay
  const initialState = self?.abilityInitiationTimes.get(ability.name);
  if (initialState) {
    cooldown = true;
  }

  return (
    <>
      <motion.div
        className={cn(
          "absolute bg-black border-t border-b border-[#f9daab] z-30  bottom-0 left-[0px] right-[0px] mb-[80px] flex flex-col items-stretch"
        )}
        animate={{ y: 0, opacity: 1 }}
        initial={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <div
          className={cn("p-2 flex items-center mb-4")}
          onPointerDown={(e) => {
            local.detail = !local.detail;
            local.render();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <img
            src={`/img/abilities/${ability.slug}.webp`}
            className="w-[100px] h-[100px] object-cover pointer-events-none rounded-xl"
          />
          <div className={cn("flex-1 flex flex-col", !local.detail && "pl-3")}>
            <div className="flex flex-col">
              {local.detail ? (
                <AbilityTable ability={ability} />
              ) : (
                <>
                  <div className="font-black text-2xl font-megrim lowercase">
                    {ability.name}
                  </div>
                  <div className="text-sm">{ability.description}</div>
                  <div className="text-sm border-t border-t-white/50 pt-1 mt-2">
                    {ability.effect}
                    <span className="opacity-50 text-[10px] pl-2">
                      Click for detail
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="h-[1px] mt-[5px] bg-gradient-to-r from-black/0 from-0% via-50% to-100% to-black/0 via-[#f9daab]"></div>
        <div className="relative flex items-center justify-center">
          <div className="absolute bg-black px-2 mt-[-5px] font-rocker font-black capitalize">
            Pick Target: {ability.target.replace(/W/, " ")}
          </div>
        </div>
        <div
          className={cn(
            !local.detail ? "min-h-[200px]" : " min-h-[150px]",
            "relative flex flex-1 mt-5 border-t border-[#f9daab] justify-center transition-all ease-in-out"
          )}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {(cooldown || casting) && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center px-2 z-[40] font-rocker font-black capitalize">
              {casting
                ? "Casting " + casting.ability.name
                : cooldown
                  ? "Ability in Cooldown"
                  : ""}
            </div>
          )}
          {ability.target.includes("enemy") &&
            enemy.map((e, idx) => {
              if (e.hp === 0) return null;
              const total = enemy.filter((e) => e.hp > 0).length;

              return (
                <Portrait
                  key={idx}
                  entity={e}
                  hp={e.hp}
                  className={cn(
                    total > 1 && idx >= 1 && "border-l border-[#f9daab]",
                    total <= 1 && "skew-x-[-10deg]"
                  )}
                  onClick={() => {
                    gameActions.executeAbility(
                      game.selectedEntity!,
                      game.selectedAbility!,
                      e.id
                    );
                    gameStore.selectedAbility = null;
                  }}
                />
              );
            })}
          {ability.target.includes("friend") &&
            friend.map((e, idx) => {
              if (e.hp === 0) return null;
              const total = friend.filter((e) => e.hp > 0).length;
              return (
                <Portrait
                  key={idx}
                  entity={e}
                  hp={e.hp}
                  className={cn(
                    total > 1 && idx >= 1 && "border-l border-[#f9daab]",
                    total <= 1 && "skew-x-[-10deg]"
                  )}
                  onClick={() => {
                    gameActions.executeAbility(
                      game.selectedEntity!,
                      game.selectedAbility!,
                      e.id
                    );
                    gameStore.selectedAbility = null;
                  }}
                />
              );
            })}
          {ability.target === "self" && (
            <Portrait
              entity={self!}
              hp={self!.hp}
              onClick={() => {
                gameActions.executeAbility(
                  game.selectedEntity!,
                  game.selectedAbility!,
                  self!.id
                );
                gameStore.selectedAbility = null;
              }}
              className="skew-x-[-10deg]"
            />
          )}
        </div>
      </motion.div>
    </>
  );
};

const Portrait: FC<{
  entity: BattleEntity;
  hp: number;
  className?: string;
  onClick?: () => void;
}> = ({ entity, className, onClick }) => {
  const local = useLocal(
    {
      card: null as null | SoulBeastUI,
    },
    () => {
      local.card = DataLoader.getSoulBeast(entity.character.name);
      local.render();
    }
  );

  const card = local.card;

  if (!card) return null;
  const hp = { current: entity.hp, max: entity.maxHp };

  return (
    <div
      className={cn("flex-1 overflow-hidden relative max-w-[50%]", className)}
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <img src={card.image} className="absolute inset-0 pointer-events-none " />
      <div className="flex flex-col p-2 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-black/0 ">
        <div className="font-rocker text-shadow-2xs text-shadow-black">
          {card.name}
        </div>
        <div className="flex">
          <div className="flex-1 mr-1">
            <div className="border-[#f9daab] border p-[2px] skew-x-[-12deg]">
              <div
                className={cn(
                  "bg-[#f9daab] h-[2px] rounded-full",
                  css`
                    width: ${(Math.ceil(hp.current) / Math.ceil(hp.max)) *
                    100}%;
                  `
                )}
              ></div>
            </div>
          </div>
          <div className="text-white flex leading-0">
            <sup className="text-xs -mt-[3px] pr-1">
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
              <path d="M1 14L24 1" stroke="#fff" />
            </svg>

            <sub className="text-xs"> {hp.max}</sub>
          </div>
        </div>
      </div>
    </div>
  );
};
