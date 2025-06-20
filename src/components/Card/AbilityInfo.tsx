import { motion } from "motion/react";
import { FC } from "react";
import { Ability } from "../../types";

interface AbilityInfoProps {
  ability: Ability | null;
  isSelected: boolean;
  isHovered: boolean;
  onClose: () => void;
  className?: string;
}

const AbilityInfo: FC<AbilityInfoProps> = ({
  ability,
  isSelected,
  isHovered,
  onClose,
  className,
}) => {
  return (
    <div
      className={cn(className ? className : "relative")}
      onPointerDown={() => {
        // Keep the modal open when hovering/interacting
      }}
      onPointerUp={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{
          y: !isSelected ? 40 : 0,
          opacity: !ability ? 0 : 1,
          scale: isHovered ? 0.96 : 1,
        }}
        className={cn(
          "absolute border border-amber-200 min-h-[550px] h-[60vh] bottom-[10px] left-2 right-2 bg-gradient-to-t from-black from-40% to-black/60 z-100",
          !ability && "pointer-events-none"
        )}
      >
        <BoxCorner />

        {ability && (
          <div className="pt-0 flex flex-col items-center">
            <div className="relative mt-5">
              <BoxCorner />
              <img
                src={`/img/abilities/${ability.emoji}.webp`}
                className="w-[200px] h-[200px] pointer-events-none border border-amber-100"
                alt={ability.name}
              />
            </div>
            <div className="text-2xl font-rocker mt-5 px-2">{ability.name}</div>
            <div className="text-center px-6">{ability.description}</div>

            <div className="border-t self-stretch border-t-amber-200/50 mt-3 pt-2 px-4  flex-1 flex flex-col">
              <div className="text-center">{ability.effect}</div>

              <table
                className={cn(
                  "border border-amber-200/50 m-3",
                  css`
                    td {
                      padding: 0px 6px;
                      font-size: 14px;
                      padding-bottom: 2px;

                      &.font-mono {
                        font-size: 12px;
                        padding-top: 4px;
                      }
                    }
                  `
                )}
              >
                <tbody>
                  <tr className="border-b border-amber-200/50">
                    <td className="text-left border-r min-w-[110px] border-amber-200/50 pr-2">
                      Initiation Time
                    </td>
                    <td className="text-left pl-2 w-full font-mono">
                      {ability.initiationTime
                        ? `${ability.initiationTime}s`
                        : "Instant"}
                    </td>
                  </tr>
                  <tr className="border-b border-amber-200/50">
                    <td className="text-left border-r border-amber-200/50 pr-2">
                      Cast Time
                    </td>
                    <td className="text-left pl-2 w-full font-mono">
                      {ability.castTime ? `${ability.castTime}s` : "Instant"}
                    </td>
                  </tr>
                  <tr className="border-b border-amber-200/50">
                    <td className="text-left border-r border-amber-200/50 pr-2">
                      Cooldown
                    </td>
                    <td className="text-left pl-2 w-full font-mono">
                      {ability.cooldown}s
                    </td>
                  </tr>
                  <tr className="border-b border-amber-200/50">
                    <td className="text-left border-r border-amber-200/50 pr-2">
                      Damage
                    </td>
                    <td className="text-left pl-2 w-full font-mono">
                      {ability.damage}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-left border-r border-amber-200/50 pr-2">
                      Target
                    </td>
                    <td className="text-left pl-2 w-full font-mono capitalize">
                      {ability.target.split("-").join(" ")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const BoxCorner = () => {
  return (
    <>
      <img
        src="/img/battle/box/top-left.png"
        className="absolute pointer-events-none top-[3px] left-[3px] w-[30px] h-[30px]"
      />
      <img
        src="/img/battle/box/top-right.png"
        className="absolute pointer-events-none top-[3px] right-[3px] w-[30px] h-[30px]"
      />
      <img
        src="/img/battle/box/bottom-left.png"
        className="absolute pointer-events-none bottom-[3px] left-[3px] w-[30px] h-[30px]"
      />
      <img
        src="/img/battle/box/bottom-right.png"
        className="absolute pointer-events-none bottom-[3px] right-[3px] w-[30px] h-[30px]"
      />
    </>
  );
};

export default AbilityInfo;
