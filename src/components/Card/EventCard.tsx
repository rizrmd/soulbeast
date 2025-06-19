import { FC } from "react";
import { BattleEntity, BattleEvent } from "../../types";
import { useSnapshot } from "valtio";
import { gameStore } from "../../store/game-store";

export const EventCard: FC<{ event: BattleEvent }> = ({ event }) => {
  const game = useSnapshot(gameStore);
  const entity = game.battleState!.entities.get(event.source) as BattleEntity;

  if (!entity) return null;

  const isPlayer =
    entity.id.startsWith("player1") || entity.id.startsWith("player2");
  const playerName = isPlayer
    ? game.battleState!.players.get(entity.id)?.name
    : "Unknown";

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-md">
      <div className="text-sm mb-2">
        <span className="font-bold">{playerName}</span> -{" "}
        {new Date(event.timestamp).toLocaleTimeString()}
      </div>
      <div className="text-lg font-semibold">{event.message}</div>
      {event.ability && (
        <div className="text-sm text-gray-400">Ability: {event.ability}</div>
      )}
      {event.value !== undefined && (
        <div className="text-sm text-green-400">Value: {event.value}</div>
      )}
    </div>
  );
};
