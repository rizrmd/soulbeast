import { getValueTransition, motion } from "motion/react";
import { useSnapshot } from "valtio";
import { cn } from "../../lib/cn";
import { useLocal } from "../../lib/use-local";
import { gameStore } from "../../store/game-store";
import { useEffect } from "react";

export const PlayerCasting = ({ entityId }: { entityId: string }) => {
  const game = useSnapshot(gameStore);

  const local = useLocal(
    {
      castTime: 0,
      timer: null as any,
      interrupted: false as false | { by: string; ability: string },
      interruptTimeout: null as any,
      lastPercent: 0,
    },
    () => {
      entity?.on("cast_start", (event) => {
        if (event.source === entityId) {
          clearTimeout(local.timer);
          local.castTime = event.ability?.castTime!;
          local.timer = setInterval(() => {
            local.render();
          }, 100);
          clearTimeout(local.interruptTimeout);
          local.interrupted = false;
          local.render();
        }
      });
      entity?.on("cast_complete", (event) => {
        if (event.source === entityId) {
          clearTimeout(local.timer);
          clearTimeout(local.interruptTimeout);
          local.timer = null;
          local.interrupted = false;
          local.render();
        }
      });
      entity?.on("cast_interrupted", (event) => {
        if (event.target === entityId) {
          local.interrupted = {
            by: event.source,
            ability: event.ability?.name || "",
          };
          local.render();

          clearTimeout(local.timer);
          // Clear interrupted state after 2.5 seconds
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

  const currentPercent =
    100 - Math.round(((casting?.timeRemaining || 0) / local.castTime) * 100);

  useEffect(() => {
    local.lastPercent = currentPercent;
  }, [currentPercent]);

  if (!casting && !local.interrupted) return null;

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
              ? local.interrupted.ability
              : casting?.ability.name}
          </div>
          {local.interrupted ? (
            <div className="font-texturina text-sm leading-4 text-red-500 capitalize">
              Interrupted By{" "}
              {game.battleState?.entities.get(local.interrupted.by)?.character
                .name || "unknown"}
            </div>
          ) : (
            <div className="text-xs font-texturina min-w-[30px] text-right ">
              {casting && Math.round(casting.timeRemaining * 10) / 10}
            </div>
          )}
        </motion.div>
        <div className="h-[2px]">
          {!local.interrupted &&
            !!currentPercent &&
            !!local.lastPercent &&
            local.lastPercent <= currentPercent && (
              <motion.div
                className={cn("bg-amber-400 h-[2px]")}
                animate={{
                  width: `${currentPercent}%`,
                }}
                initial={{ width: "0%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              ></motion.div>
            )}
        </div>
      </div>
    </>
  );
};
