import React, { useEffect, useCallback } from "react";
import { useSnapshot } from "valtio";
import { gameStore, gameActions } from "../store/gameStore";
import { BattleEntity } from "../types";

const BattleArena: React.FC = () => {
  const state = useSnapshot(gameStore);

  // Keyboard shortcuts for quick actions
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!state.battleState || !state.selectedEntity) return;

      const entity = state.battleState.entities.get(state.selectedEntity);
      if (!entity || !entity.isAlive || !entity.id.startsWith("player1_"))
        return;

      const key = event.key.toLowerCase();
      const abilityIndex = parseInt(key) - 1;

      // Number keys 1-4 for abilities
      if (
        abilityIndex >= 0 &&
        abilityIndex < entity.character.abilities.length
      ) {
        const ability = entity.character.abilities[abilityIndex];
        if (!entity.abilityCooldowns.has(ability.name)) {
          gameActions.selectAbilityForTargeting(entity.id, ability.name);
        }
        event.preventDefault();
      }

      // Space for auto-attack (first ability)
      if (key === " " || key === "spacebar") {
        const firstAbility = entity.character.abilities[0];
        if (firstAbility && !entity.abilityCooldowns.has(firstAbility.name)) {
          gameActions.selectAbilityForTargeting(entity.id, firstAbility.name);
        }
        event.preventDefault();
      }
    },
    [state.battleState, state.selectedEntity]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  if (!state.battleState) {
    return <div className="loading-battle">Loading battle...</div>;
  }

  const getCardImage = (cardName: string) => {
    const imageName = cardName.toLowerCase().replace(/\s+/g, "-");
    return `/img/cards/${imageName}.webp`;
  };

  const getHealthPercentage = (entity: BattleEntity) => {
    return (entity.hp / entity.maxHp) * 100;
  };

  // New: Render status/effect bar (e.g., Soul Flame)
  const renderStatusBar = (entity: BattleEntity) => {
    if (!entity.statusEffects.length) return null;
    const effect = entity.statusEffects[0];
    // Use a fallback emoji/icon based on effect name
    const effectIcon =
      effect.name && effect.name.toLowerCase().includes("soul") ? "🔥" : "✨";
    // If you have a max duration, use it; otherwise, just show a full bar if duration > 0
    const maxDuration = effect.duration > 1 ? effect.duration : 1;
    return (
      <div className="flex items-center gap-2 mb-2">
        <img
          src={`/img/abilities/${effectIcon}.webp`}
          alt={effect.name || "Status"}
          className="w-10 h-10 rounded bg-black/40 border border-gray-700 object-cover"
        />
        <span className="text-base font-bold text-white font-mono mr-2 min-w-[80px]">
          {effect.name || "Status"}
        </span>
        <div className="flex-1 h-5 bg-black/60 rounded overflow-hidden border border-gray-800 relative">
          <div
            className="absolute left-0 top-0 h-full bg-green-700"
            style={{
              width: `${Math.max(
                0,
                Math.min(100, (effect.duration / maxDuration) * 100)
              )}%`,
            }}
          />
          <span
            className="relative z-10 w-full text-center block text-xs font-bold text-white tracking-wider"
            style={{ textShadow: "0 1px 2px #000" }}
          >
            {effect.duration.toFixed(1)} s
          </span>
        </div>
      </div>
    );
  };

  // Card panel layout
  const renderCardPanel = (entity: BattleEntity, isPlayer1: boolean) => {
    const healthPercentage = getHealthPercentage(entity);
    const isDead = !entity.isAlive;
    // For enemy (player2), use two-column layout
    if (!isPlayer1) {
      return (
        <div
          key={entity.id}
          className={`flex flex-row bg-[#23232a] rounded-2xl overflow-hidden border border-gray-800 min-h-[260px] max-w-2xl mx-auto w-full shadow-lg ${isDead ? "opacity-40 grayscale" : ""} transition-all duration-200`}
          onClick={() => {
            if (
              state.selectedAbility &&
              state.selectedEntity &&
              state.selectedEntity !== entity.id
            ) {
              gameActions.selectTarget(entity.id);
            }
          }}
        >
          {/* Card Art */}
          <div className="w-1/2 aspect-[4/5] relative flex-shrink-0 flex items-center justify-center bg-black/60">
            <img
              src={getCardImage(entity.character.name)}
              alt={entity.character.name}
              onError={(e) =>
                ((e.target as HTMLImageElement).src =
                  "/img/cards/placeholder.jpg")
              }
              className="object-cover w-full h-full rounded-l-2xl"
            />
          </div>
          {/* Info Panel */}
          <div className="flex flex-col w-1/2 px-6 py-6 gap-3 justify-between bg-black/60">
            {/* Status Bar (above name) */}
            {renderStatusBar(entity)}
            {/* Name and Title */}
            <div className="mb-1">
              <div className="text-2xl font-bold font-[UnifrakturCook] text-white drop-shadow-lg leading-none">
                {entity.character.name}
              </div>
              <div className="text-base font-mono text-gray-300 tracking-wide">
                {entity.character.title}
              </div>
            </div>
            {/* Health Bar */}
            <div className="relative w-full h-4 bg-gray-900 rounded-full overflow-hidden mb-2 border border-gray-800">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#e43c3c] to-[#fbbf24]"
                style={{ width: `${healthPercentage}%` }}
              />
              <span
                className="relative z-10 w-full text-center block text-xs font-bold text-white tracking-wider"
                style={{ textShadow: "0 1px 2px #000" }}
              >
                {Math.round(entity.hp)}/{entity.maxHp}
              </span>
            </div>
            {/* Abilities Row (bottom, small, no border) */}
            <div className="flex gap-2 mt-2 justify-center">
              {entity.character.abilities.map((ability, idx) => {
                const isOnCooldown = entity.abilityCooldowns.has(ability.name);
                const cooldownTime =
                  entity.abilityCooldowns.get(ability.name) || 0;
                const isCasting =
                  entity.currentCast &&
                  entity.currentCast.ability.name === ability.name;
                return (
                  <div
                    key={ability.name + idx}
                    className={`relative flex flex-col items-center w-16 h-16 bg-transparent rounded-lg`}
                  >
                    <img
                      src={`/img/abilities/${ability.emoji}.webp`}
                      alt={ability.name}
                      className="w-12 h-12 rounded bg-black/30 object-cover border border-gray-700"
                    />
                    <div className="text-[10px] text-white font-mono mt-1 text-center leading-tight tracking-wide drop-shadow-md">
                      {ability.name}
                    </div>
                    {/* Cooldown overlay */}
                    {isOnCooldown && (
                      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg z-10">
                        <span className="text-xs text-indigo-200 font-bold drop-shadow">
                          {Math.ceil(cooldownTime)}s
                        </span>
                      </div>
                    )}
                    {/* Casting overlay */}
                    {isCasting && (
                      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center rounded-lg bg-yellow-400 bg-opacity-20">
                        <span className="text-xs text-yellow-200 font-bold">
                          Casting...
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div
        key={entity.id}
        className={`flex flex-col items-center bg-[#23232a] rounded-2xl overflow-hidden p-0 border border-gray-800 ${
          isDead ? "opacity-40 grayscale" : ""
        } transition-all duration-200 min-h-[420px] max-w-xl mx-auto w-full`}
        onClick={() => {
          if (
            state.selectedAbility &&
            state.selectedEntity &&
            state.selectedEntity !== entity.id
          ) {
            gameActions.selectTarget(entity.id);
          } else if (isPlayer1 && entity.isAlive) {
            gameActions.selectEntity(entity.id);
          }
        }}
      >
        {/* Card Art */}
        <div className="w-full aspect-[4/5] relative flex-shrink-0">
          <img
            src={getCardImage(entity.character.name)}
            alt={entity.character.name}
            onError={(e) =>
              ((e.target as HTMLImageElement).src =
                "/img/cards/placeholder.jpg")
            }
            className="object-cover w-full h-full rounded-t-2xl"
          />
        </div>
        <div className="flex flex-col w-full px-6 pt-4 pb-4 gap-2">
          {/* Status Bar (TOBE: above name) */}
          {renderStatusBar(entity)}
          {/* Name and Title */}
          <div className="mb-1">
            <div className="text-2xl font-bold font-[UnifrakturCook] text-white drop-shadow-lg leading-none">
              {entity.character.name}
            </div>
            <div className="text-base font-mono text-gray-300 tracking-wide">
              {entity.character.title}
            </div>
          </div>
          {/* Health Bar (TOBE: thin, light, numbers inside) */}
          <div className="relative w-full h-4 bg-gray-900 rounded-full overflow-hidden mb-2 border border-gray-800">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#e43c3c] to-[#fbbf24]"
              style={{ width: `${healthPercentage}%` }}
            />
            <span
              className="relative z-10 w-full text-center block text-xs font-bold text-white tracking-wider"
              style={{ textShadow: "0 1px 2px #000" }}
            >
              {Math.round(entity.hp)}/{entity.maxHp}
            </span>
          </div>
          {/* Abilities Row (TOBE: bottom, small, no border) */}
          <div className="flex gap-2 mt-2 justify-center">
            {entity.character.abilities.map((ability, idx) => {
              const isOnCooldown = entity.abilityCooldowns.has(ability.name);
              const cooldownTime =
                entity.abilityCooldowns.get(ability.name) || 0;
              const isCasting =
                entity.currentCast &&
                entity.currentCast.ability.name === ability.name;
              return (
                <div
                  key={ability.name + idx}
                  className={`relative flex flex-col items-center w-16 h-16 bg-transparent rounded-lg cursor-${
                    isPlayer1 && !isOnCooldown && !isCasting
                      ? "pointer"
                      : "default"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPlayer1 && !isOnCooldown && !isCasting) {
                      gameActions.selectAbilityForTargeting(
                        entity.id,
                        ability.name
                      );
                    }
                  }}
                >
                  <img
                    src={`/img/abilities/${ability.emoji}.webp`}
                    alt={ability.name}
                    className="w-12 h-12 rounded bg-black/30 object-cover border border-gray-700"
                  />
                  <div className="text-[10px] text-white font-mono mt-1 text-center leading-tight tracking-wide drop-shadow-md">
                    {ability.name}
                  </div>
                  {/* Cooldown overlay */}
                  {isOnCooldown && (
                    <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg z-10">
                      <span className="text-xs text-indigo-200 font-bold drop-shadow">
                        {Math.ceil(cooldownTime)}s
                      </span>
                    </div>
                  )}
                  {/* Casting overlay */}
                  {isCasting && (
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center rounded-lg bg-yellow-400 bg-opacity-20">
                      <span className="text-xs text-yellow-200 font-bold">
                        Casting...
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTargetingPopup = () => {
    if (!state.selectedAbility || !state.selectedEntity || !state.battleState)
      return null;

    const casterEntity = state.battleState.entities.get(state.selectedEntity);
    if (!casterEntity) return null;

    const ability = casterEntity.character.abilities.find(
      (a) => a.name === state.selectedAbility
    );
    if (!ability) return null;

    const isPlayer1Entity = state.selectedEntity.startsWith("player1_");
    const enemyPrefix = isPlayer1Entity ? "player2_" : "player1_";

    const isSelfTargetingAbility =
      ability.effect.toLowerCase().includes("heal") && ability.damage === 0;
    const isAreaEffect =
      ability.effect.toLowerCase().includes("all enemies") ||
      ability.effect.toLowerCase().includes("hits all");
    const requiresTargeting =
      ability.damage > 0 && !isSelfTargetingAbility && !isAreaEffect;

    let validTargets: BattleEntity[] = [];
    if (requiresTargeting) {
      validTargets = Array.from(state.battleState.entities.values()).filter(
        (entity) => entity.id.startsWith(enemyPrefix) && entity.isAlive
      );
    }

    const canInvoke = !requiresTargeting || state.targetEntity;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-[#19191b] rounded-2xl shadow-2xl border-2 border-indigo-700 max-w-lg w-full p-8 relative animate-fadeIn">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
            onClick={() => gameActions.selectEntity(state.selectedEntity!)}
            aria-label="Close"
          >
            ×
          </button>
          <div className="mb-4">
            <div className="flex items-center gap-4">
              <img
                src={`/img/abilities/${ability.emoji}.webp`}
                alt={ability.name}
                className="w-14 h-14 rounded-lg border border-gray-700 shadow"
              />
              <div>
                <h4 className="text-2xl font-[UnifrakturCook] text-white drop-shadow mb-1">
                  {ability.name}
                </h4>
                <p className="text-gray-300 text-sm font-mono leading-snug">
                  {ability.description}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-6 mb-6 text-sm font-mono text-indigo-200">
            {ability.damage > 0 && (
              <div className="bg-indigo-900/60 px-3 py-1 rounded-lg">
                Damage:{" "}
                <span className="font-bold text-pink-300">
                  {ability.damage}
                </span>
              </div>
            )}
            {ability.castTime && ability.castTime > 0 && (
              <div className="bg-indigo-900/60 px-3 py-1 rounded-lg">
                Cast Time:{" "}
                <span className="font-bold text-yellow-200">
                  {ability.castTime}s
                </span>
              </div>
            )}
            {ability.cooldown > 0 && (
              <div className="bg-indigo-900/60 px-3 py-1 rounded-lg">
                Cooldown:{" "}
                <span className="font-bold text-blue-300">
                  {ability.cooldown}s
                </span>
              </div>
            )}
          </div>
          {requiresTargeting && (
            <div className="mb-6">
              <h5 className="text-lg font-bold text-white mb-2 font-mono">
                Select Target:
              </h5>
              <div className="grid grid-cols-2 gap-4">
                {validTargets.map((target) => {
                  const isSelected = state.targetEntity === target.id;
                  const healthPercentage = getHealthPercentage(target);
                  return (
                    <div
                      key={target.id}
                      className={`relative bg-[#23232a] rounded-xl border-2 shadow flex flex-col items-center p-3 cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "border-yellow-400 ring-2 ring-yellow-300"
                          : "border-transparent hover:border-indigo-400"
                      }`}
                      onClick={() => gameActions.selectTarget(target.id)}
                    >
                      <img
                        src={getCardImage(target.character.name)}
                        alt={target.character.name}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-700 mb-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/img/cards/placeholder.jpg";
                        }}
                      />
                      <div className="text-white font-bold text-base font-[UnifrakturCook] mb-1 text-center drop-shadow">
                        {target.character.name}
                      </div>
                      <div className="text-xs text-gray-300 font-mono mb-1">
                        {Math.round(target.hp)}/{target.maxHp} HP
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${healthPercentage}%`,
                            background:
                              healthPercentage > 60
                                ? "#4CAF50"
                                : healthPercentage > 30
                                ? "#FF9800"
                                : "#F44336",
                          }}
                        />
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-yellow-300 text-xl font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-4 mt-4">
            <button
              className="px-5 py-2 rounded-lg bg-gray-800 text-gray-300 font-bold font-mono hover:bg-gray-700 transition"
              onClick={() => gameActions.selectEntity(state.selectedEntity!)}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 rounded-lg bg-indigo-700 text-white font-bold font-mono hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (requiresTargeting && state.targetEntity) {
                  gameActions.executeAbility(
                    state.selectedEntity!,
                    state.selectedAbility!,
                    state.targetEntity
                  );
                } else if (!requiresTargeting) {
                  gameActions.executeAbility(
                    state.selectedEntity!,
                    state.selectedAbility!
                  );
                }
              }}
              disabled={!canInvoke}
            >
              Invoke
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Restore getPlayerEntities with proper typing
  const getPlayerEntities = (isPlayer1: boolean): BattleEntity[] => {
    const prefix = isPlayer1 ? "player1_" : "player2_";
    return Array.from(state.battleState!.entities.values()).filter(
      (entity: BattleEntity) => entity.id.startsWith(prefix)
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Battle Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-gray-900 rounded-t-xl shadow">
        <div className="text-lg text-white font-mono">
          Battle Time:{" "}
          {Math.floor(
            (state.battleState.currentTime - state.battleState.startTime) / 1000
          )}
          s
        </div>
        <div className="flex gap-8">
          <div className="text-indigo-300 font-semibold">
            Player 1:{" "}
            {
              getPlayerEntities(true).filter((e: BattleEntity) => e.isAlive)
                .length
            }{" "}
            card alive
          </div>
          <div className="text-pink-300 font-semibold">
            Player 2:{" "}
            {
              getPlayerEntities(false).filter((e: BattleEntity) => e.isAlive)
                .length
            }{" "}
            card alive
          </div>
        </div>
      </div>
      {/* Main Battle Area */}
      <div className="flex-1 flex gap-8 px-8 py-6">
        {/* Player 1 Card(s) */}
        <div className="flex-1 flex flex-col gap-4">
          {getPlayerEntities(true).map((entity: BattleEntity) =>
            renderCardPanel(entity, true)
          )}
        </div>
        {/* Player 2 Card(s) */}
        <div className="flex-1 flex flex-col gap-4">
          {getPlayerEntities(false).map((entity: BattleEntity) =>
            renderCardPanel(entity, false)
          )}
        </div>
      </div>
      {/* Targeting Popup */}
      {renderTargetingPopup()}
      {/* Battle Log */}
      <div className="bg-gray-900 rounded-b-xl shadow px-8 py-4 mt-4">
        <h4 className="text-lg font-semibold text-white mb-2">Battle Log</h4>
        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
          {state.recentEvents
            .slice(-5)
            .reverse()
            .map((event, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 ${
                  event.type === "death" ? "text-red-400" : "text-indigo-300"
                }`}
              >
                <span className="text-xs font-mono bg-gray-700 rounded px-2 py-1">
                  {Math.floor(
                    (event.timestamp - state.battleState!.startTime) / 1000
                  )}
                  s
                </span>
                <span className="text-sm">{event.message}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BattleArena;
