import { motion } from "motion/react";
import { css } from "goober";
import { BattleEntity, StatusEffect } from "../../types";

interface StatusIconProps {
  entity: BattleEntity;
  className?: string;
}

const getStatusIcon = (type: StatusEffect['type']): string => {
  switch (type) {
    case 'buff':
      return '✨'; // Sparkles for buffs
    case 'debuff':
      return '💀'; // Skull for debuffs
    case 'dot':
      return '🔥'; // Fire for damage over time
    case 'hot':
      return '🌱'; // Plant for heal over time
    default:
      return '❓';
  }
};

const getStatusColor = (type: StatusEffect['type']): string => {
  switch (type) {
    case 'buff':
      return '#22c55e'; // Green
    case 'debuff':
      return '#ef4444'; // Red
    case 'dot':
      return '#f97316'; // Orange
    case 'hot':
      return '#10b981'; // Emerald
    default:
      return '#6b7280'; // Gray
  }
};

const statusIconStyles = css`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  max-width: 120px;
  
  .status-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    backdrop-filter: blur(4px);
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
    }
    
    .status-icon {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }
    
    .duration-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 0 0 4px 4px;
      transition: width 0.3s ease;
    }
    
    .tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 1000;
      margin-bottom: 4px;
      
      &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.9);
      }
    }
    
    &:hover .tooltip {
      opacity: 1;
    }
  }
`;

const StatusIcon: React.FC<StatusIconProps> = ({ entity, className = "" }) => {
  if (!entity.statusEffects || entity.statusEffects.length === 0) {
    return null;
  }

  // Group status effects by name to avoid duplicates
  const uniqueEffects = entity.statusEffects.reduce((acc, effect) => {
    acc[effect.name] = effect;
    return acc;
  }, {} as Record<string, StatusEffect>);

  const effects = Object.values(uniqueEffects);

  return (
    <motion.div
      className={`${statusIconStyles} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {effects.map((effect, index) => {
        const icon = getStatusIcon(effect.type);
        const color = getStatusColor(effect.type);
        const durationPercent = Math.max(0, Math.min(100, (effect.duration / 10000) * 100)); // Assuming max 10 seconds for visual purposes
        
        return (
          <motion.div
            key={`${effect.name}-${index}`}
            className="status-item"
            style={{
              borderColor: color,
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            whileHover={{ scale: 1.1 }}
          >
            <img 
              src={`/img/abilities/${icon}.webp`}
              alt={effect.name}
              className="status-icon"
            />
            
            {/* Duration bar */}
            <div 
              className="duration-bar"
              style={{ 
                width: `${durationPercent}%`,
                backgroundColor: color
              }}
            />
            
            {/* Tooltip */}
            <div className="tooltip">
              <div style={{ fontWeight: 'bold', color }}>{effect.name}</div>
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
    </motion.div>
  );
};

export { StatusIcon };
export default StatusIcon;