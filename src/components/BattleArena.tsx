import { FC, useEffect } from "react";
import { useSnapshot } from "valtio";
import { cn } from "../lib/cn";
import { gameStore } from "../store/game-store";
import { EnemyCard } from "./Card/EnemyCard";
import { PlayerCard } from "./Card/PlayerCard";
import { BattleEntity } from "../types";
import { motion } from "motion/react";
import { useLocal } from "../lib/use-local";

export const BattleArena: FC = () => {
  const game = useSnapshot(gameStore);
  const entities = [...game.battleState!.entities.values()];
  const p2 = entities.filter((e) => e.id.startsWith("player2"));
  const p1 = entities.filter((e) => e.id.startsWith("player1"));

  return (
    <div
      className="flex flex-col items-stretch h-full"
      onClick={() => {
        gameStore.selectedEntity = null;
        gameStore.selectedAbility = null;
      }}
    >
      <div
        className={cn(
          "absolute z-[1] max-w-[3%] top-[0px] left-[0px] pointer-events-none opacity-60"
        )}
      >
        <img src="/img/battle/orn2.svg" width={20} />
        <img
          src="/img/battle/orn1.svg"
          width={10}
          className="mt-[5px] ml-[0px]"
        />
      </div>
      <div className={cn("gap-1 px-6 flex justify-center")}>
        {p2.map((e, idx) => (
          <EnemyCard key={e.id} idx={idx} />
        ))}
      </div>
      <div
        className={cn(
          "flex-1 relative",
          css`
            background-image: url("/img/place/swamp.webp");
            background-size: cover;
          `
        )}
      >
        <div
          className={cn(
            "absolute inset-0 z-0 pointer-events-none flex flex-col justify-between"
          )}
        >
          <div className="h-[150px] bg-gradient-to-b from-black from-20% to-100% to-black/0"></div>
          <div className="h-[150px] bg-gradient-to-t from-black from-10% to-100% to-black/0"></div>
        </div>
        {game.battleState?.countdownActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-[1]">
            <div className="text-center">
              <div className="text-6xl font-black text-white font-megrim animate-pulse">
                {Math.ceil(game.battleState.countdownTimeRemaining)}
              </div>
              <div className="text-xl text-gray-300 font-rocker">
                {game.battleState.countdownTimeRemaining > 2
                  ? "Battle Starting"
                  : "Get Ready!"}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="relative">
        <div className="absolute left-0 bottom-0 flex mb-2 flex-col gap-1">
          {p1.map((entity, idx) => {
            return <Casting entityId={entity.id} key={idx} />;
          })}
        </div>
      </div>
      <div className="flex flex-col relative">
        {p1.map((_, idx) => {
          return <PlayerCard idx={idx} key={idx} />;
        })}
      </div>
    </div>
  );
};

const Casting = ({ entityId }: { entityId: string }) => {
  const game = useSnapshot(gameStore);

  const local = useLocal(
    {
      castTime: 0,
      timer: null as any,
      interrupted: false,
      interruptedBy: "",
      interruptedAbility: "",
      interruptTimeout: null as any,
    },
    () => {
      entity?.on("cast_start", () => {
        clearTimeout(local.interruptTimeout);
        local.interrupted = false;
        local.render();
      });
      entity?.on("cast_interrupted", (event) => {
        if (event.target === entityId) {
          local.interrupted = true;
          local.interruptedBy = event.source;
          local.interruptedAbility = event.ability?.name || "";
          local.render();

          // Clear interrupted state after 1 second
          clearTimeout(local.interruptTimeout);
          local.interruptTimeout = setTimeout(() => {
            local.interrupted = false;
            local.render();
          }, 2500);
        }
      });
    }
  );
  const entity = game.battleState?.entities.get(entityId);
  const casting = entity?.currentCast;

  useEffect(() => {
    clearTimeout(local.timer);
    if (casting) {
      // If there's a new cast, clear interrupted state immediately
      if (local.interrupted) {
        local.interrupted = false;
        clearTimeout(local.interruptTimeout);
      }
      if (!local.castTime) {
        local.castTime = casting?.timeRemaining;
      }
      local.timer = setInterval(() => {
        local.render();
      }, 100);
    } else if (!local.interrupted) {
      local.castTime = 0;
    }
    local.render();
  }, [game.battleState?.events.length]);

  if (
    (!casting && !local.interrupted) ||
    (!local.castTime && !local.interrupted)
  )
    return null;
  return (
    <>
      <div className="font-megrim lowercase pl-2">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "flex justify-between  mb-1",
            local.interrupted ? "flex-col" : "items-center"
          )}
        >
          <div className="font-bold leading-4">
            {local.interrupted
              ? local.interruptedAbility
              : casting?.ability.name}
          </div>
          {local.interrupted ? (
            <div className="font-texturina text-sm leading-4 text-red-500 capitalize">
              Interrupted By{" "}
              {game.battleState?.entities.get(local.interruptedBy)?.character
                .name || "unknown"}
            </div>
          ) : (
            <div className="text-xs font-texturina min-w-[30px] text-right ">
              {casting && Math.round(casting.timeRemaining * 10) / 10}
            </div>
          )}
        </motion.div>
        {!local.interrupted && (
          <motion.div
            className={cn("bg-amber-400 h-[2px]")}
            animate={{
              width: `${100 - Math.round(((casting?.timeRemaining || 0) / local.castTime) * 100)}%`,
            }}
            initial={{ width: "0%" }}
          ></motion.div>
        )}
      </div>
    </>
  );
};

export default BattleArena;
