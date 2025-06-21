import { motion } from "motion/react";
import { FC } from "react";
import { useSnapshot } from "valtio";
import { DataLoader } from "../../engine/DataLoader";
import { cn } from "../../lib/cn";
import { useLocal } from "../../lib/use-local";
import { gameStore } from "../../store/game-store";
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
          onClick={(e) => {
            e.stopPropagation();
            local.detail = !local.detail;
            local.render();
          }}
        >
          <img
            src={`/img/abilities/${ability.emoji}.webp`}
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
            Pick Target: {ability.target.replace(/W/, ' ')}
          </div>
        </div>
        <div
          className={cn(
            !local.detail ? "min-h-[200px]" : " min-h-[150px]",
            "flex flex-1 mt-5 border-t border-[#f9daab] justify-center transition-all ease-in-out"
          )}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {ability.target.includes("enemy") &&
            enemy.map((e, idx) => {
              return (
                <Portrait
                  key={idx}
                  entity={e}
                  className={cn(idx >= 1 && "border-l border-[#f9daab]")}
                />
              );
            })}
          {ability.target.includes("friend") &&
            friend.map((e, idx) => {
              return (
                <Portrait
                  key={idx}
                  entity={e}
                  className={cn(idx >= 1 && "border-l border-[#f9daab]")}
                />
              );
            })}
          {ability.target === "self" && <Portrait entity={self!} />}
        </div>
      </motion.div>
    </>
  );
};

const Portrait: FC<{ entity: BattleEntity; className?: string }> = ({
  entity,
  className,
}) => {
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
    >
      <img src={card.image} className="absolute inset-0 " />
      <div className="flex flex-col p-2 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-black/0 ">
        <div className="font-rocker text-shadow-2xs text-shadow-black">
          {card.name}
        </div>
        <div className="flex">
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
      </div>
    </div>
  );
};
