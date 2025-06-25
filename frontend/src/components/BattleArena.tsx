import { motion } from "motion/react";
import { FC } from "react";
import { useSnapshot } from "valtio";
import { cn } from "../lib/cn";
import { gameStore } from "../engine/GameStore";
import { EnemyCard } from "./Card/EnemyCard";
import { PlayerCard } from "./Card/PlayerCard";
import { PlayerCasting } from "./Battle/PlayerCasting";

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
      <motion.div
        transition={{ duration: 1, ease: "easeInOut" }}
        animate={{ opacity: 0.5 }}
        initial={{ opacity: 0 }}
        className={cn(
          "absolute z-[1] max-w-[3%] top-[0px] left-[0px] pointer-events-none"
        )}
      >
        <img src="/img/battle/orn2.svg" width={20} />
        <img
          src="/img/battle/orn1.svg"
          width={10}
          className="mt-[5px] ml-[0px]"
        />
      </motion.div>
      <div className={cn("gap-1 px-6 flex justify-center")}>
        {p2.map((e, idx) => (
          <EnemyCard key={e.id} idx={idx} />
        ))}
      </div>
      <motion.div
        transition={{ duration: 1, ease: "easeInOut" }}
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
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
      </motion.div>
      <div className="relative">
        <div className="absolute left-0 bottom-0 flex mb-2 flex-col gap-1">
          {p1.map((entity, idx) => {
            return <PlayerCasting entityId={entity.id} key={idx} />;
          })}
        </div>
      </div>
      <div className="flex flex-col relative">
        {p1.map((_, idx) => {
          return (
            <motion.div
              transition={{
                delay: idx * 0.5,
                duration: 1,
                ease: "circOut",
              }}
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: idx != 0 ? -100 : 100 }}
              className="flex flex-col relative"
              key={idx}
            >
              <PlayerCard idx={idx} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
export default BattleArena;
