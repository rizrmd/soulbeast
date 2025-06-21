import { FC } from "react";
import { useSnapshot } from "valtio";
import { cn } from "../lib/cn";
import { gameStore } from "../store/game-store";
import { EnemyCard } from "./Card/EnemyCard";
import { PlayerCard } from "./Card/PlayerCard";
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
      <div className={cn("gap-1 px-6 flex")}>
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
      <div className="flex flex-col">
        {p1.map((_, idx) => {
          return <PlayerCard idx={idx} key={idx} />;
        })}
      </div>
    </div>
  );
};

export default BattleArena;
