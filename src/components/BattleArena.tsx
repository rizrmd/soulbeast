import { FC } from "react";
import { useSnapshot } from "valtio";
import { gameStore } from "../store/game-store";
import { EnemyCard } from "./Card/EnemyCard";
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
      <div className={cn("gap-1 px-6 flex")}>
        {p2.map((e, idx) => (
          <EnemyCard key={e.id} idx={idx} />
        ))}
      </div>
    </div>
  );
};

export default BattleArena;
