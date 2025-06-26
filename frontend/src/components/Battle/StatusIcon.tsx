import { motion } from "motion/react";
import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { cn } from "../../lib/cn";
import { useLocal } from "../../lib/use-local";
import { gameStore } from "../../engine/GameStore";
import { StatusEffect } from "../../../../core/types";

interface StatusIconProps {
  entityId: string;
  className?: string;
}

const getStatusColor = (type: StatusEffect["type"]): string => {
  switch (type) {
    case "buff":
      return "#22c55e"; // Green
    case "debuff":
      return "#ef4444"; // Red
    case "dot":
      return "#f97316"; // Orange
    case "hot":
      return "#10b981"; // Emerald
    default:
      return "#6b7280"; // Gray
  }
};

const StatusIcon: React.FC<StatusIconProps> = ({
  entityId,
  className = "",
}) => {
  const game = useSnapshot(gameStore);
  const local = useLocal({});
  const entity = game.battleState?.entities.get(entityId);

  useEffect(() => {
    entity?.on("status_applied", local.render);
    entity?.on("status_removed", local.render);
  }, []);

  if (!entity) {
    return null;
  }
  if (!entity.statusEffects || entity.statusEffects.length === 0) {
    return null;
  }

  // Group status effects by name to avoid duplicates
  const uniqueEffects = entity.statusEffects.reduce(
    (acc, effect) => {
      acc[effect.name] = effect;
      return acc;
    },
    {} as Record<string, StatusEffect>
  );

  const effects = Object.values(uniqueEffects);

  return (
    <div className={cn("flex flex-wrap gap-0.5 max-w-[120px]", className)}>
      {effects.map((effect, index) => {
        const color = getStatusColor(effect.type);
        const durationPercent = Math.max(
          0,
          Math.min(100, (effect.duration / 10000) * 100)
        ); // Assuming max 10 seconds for visual purposes

        return (
          <motion.div
            key={`${effect.name}-${index}`}
            className={cn(
              "relative flex items-center justify-center w-6 h-6",
              "bg-black/30 border-2 cursor-pointer",
              "hover:scale-110 hover:shadow-[0_0_8px_rgba(255,255,255,0.3)]",
              "group"
            )}
            style={{
              borderColor: color,
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <img
              src={`/img/abilities/${effect.ability?.slug}.webp`}
              alt={effect.name}
              className="w-6 h-6 object-contain"
            />

            {/* Duration bar */}
            <div
              className="absolute bottom-0 left-0 h-0.5 bg-white/80"
              style={{
                width: `${durationPercent}%`,
                backgroundColor: color,
              }}
            />

            {/* Tooltip */}
            <div
              className={cn(
                "absolute bottom-full left-1/2 -translate-x-1/2 mb-1",
                "bg-black/90 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap",
                "pointer-events-none opacity-0 z-[1000]",
                "group-hover:opacity-100",
                "before:content-[''] before:absolute before:top-full before:left-1/2",
                "before:-translate-x-1/2 before:border-4 before:border-transparent",
                "before:border-t-black/90"
              )}
            >
              <div style={{ fontWeight: "bold", color }}>{effect.name}</div>
              <div>Type: {effect.type}</div>
              <div>Value: {effect.value}</div>
              <div>Duration: {(effect.duration / 1000).toFixed(1)}s</div>
              {effect.tickInterval && (
                <div>Tick: {(effect.tickInterval / 1000).toFixed(1)}s</div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export { StatusIcon };
export default StatusIcon;
