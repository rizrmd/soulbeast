import { FC } from "react";
import { useSnapshot } from "valtio";
import { gameStore } from "../store/game-store";
import { EnemyCard } from "./Card/EnemyCard";
import { PlayerCard } from "./Card/PlayerCard";
import { cn } from "../lib/cn";
export const BattleArena: FC = () => {
  const game = useSnapshot(gameStore);
  const entities = [...game.battleState!.entities.values()];
  const p2 = entities.filter((e) => e.id.startsWith("player2"));
  const p1 = entities.filter((e) => e.id.startsWith("player1"));

  return (
    <div className="flex flex-col items-stretch h-full">
      <div
        className={cn(
          "absolute max-w-[3%] top-[0px] left-[0px] pointer-events-none"
        )}
      >
        <img src="/img/battle/orn2.svg" width={20} />
        <img
          src="/img/battle/orn1.svg"
          width={10}
          className="mt-[5px] ml-[0px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/80 w-full h-full"></div>
      </div>
      <div className={cn("gap-1 px-6 flex min-h-[200px]")}>
        {p2.map((e, idx) => (
          <EnemyCard key={e.id} idx={idx} />
        ))}
      </div>
      {/* <div className="flex flex-col items-stretch px-4 font-mono text-[11px] whitespace-pre-wrap overflow-auto">
        {game.battleState?.events.map((e, idx) => {
          return (
            <div key={idx}>
              {e.source.substring(12)} {e.type} {e.ability} {e.target} {e.value}
            </div>
          );
        })}
      </div> */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 "></div>
        {/* Countdown Display */}
        {game.battleState?.countdownActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-4 animate-pulse">
                {Math.ceil(game.battleState.countdownTimeRemaining)}
              </div>
              <div className="text-xl text-gray-300 uppercase tracking-wider">
                Get Ready!
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
