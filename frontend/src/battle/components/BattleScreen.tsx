import React, { useEffect } from "react";
import { useSnapshot } from "valtio";
import { battleStore, battleActions, BattleEntity } from "../BattleStore";
import { networkStore, networkManager } from "../NetworkManager";

interface BattleScreenProps {
  onBattleEnd: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ onBattleEnd }) => {
  const battleSnap = useSnapshot(battleStore);
  const networkSnap = useSnapshot(networkStore);

  useEffect(() => {
    // Update battle store when network battle state changes
    if (networkSnap.battle.battleState) {
      battleActions.updateBattleState(networkSnap.battle.battleState);
    }
  }, [networkSnap.battle.battleState]);

  useEffect(() => {
    // Handle battle end
    if (!networkSnap.battle.isInBattle && battleSnap.isInBattle) {
      battleActions.endBattle();
      onBattleEnd();
    }
  }, [networkSnap.battle.isInBattle, battleSnap.isInBattle, onBattleEnd]);

  useEffect(() => {
    // Update connection state
    battleActions.setConnectionState(
      networkSnap.network.isConnected,
      networkSnap.network.latency
    );
  }, [networkSnap.network.isConnected, networkSnap.network.latency]);

  const handleEntityClick = (entity: BattleEntity) => {
    if (battleActions.isEntitySelectable(entity.id)) {
      battleActions.selectEntity(entity.id);
    } else if (battleActions.isEntityTargetable(entity.id)) {
      battleActions.selectTarget(entity.id);
      
      // If we have selected ability and target, execute action
      if (battleSnap.uiState.selectedAbility && battleSnap.uiState.selectedEntity) {
        executeAction();
      }
    }
  };

  const handleAbilityClick = (abilityName: string) => {
    battleActions.selectAbility(abilityName);
  };

  const executeAction = () => {
    if (!battleSnap.uiState.selectedEntity || !battleSnap.uiState.selectedAbility) {
      return;
    }

    const action = {
      type: "ABILITY_USE",
      entityId: battleSnap.uiState.selectedEntity,
      abilityName: battleSnap.uiState.selectedAbility,
      targetId: battleSnap.uiState.targetEntity,
    };

    battleActions.setActionInProgress(true);
    networkManager.sendPlayerAction(action);
    
    // Reset selection after action
    battleActions.selectEntity(null);
    battleActions.selectAbility(null);
    battleActions.selectTarget(null);
  };





  if (!battleSnap.battleState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div className="flex justify-center items-center h-screen text-2xl">
          Waiting for battle to start...
        </div>
      </div>
    );
  }

  const playerEntities = battleActions.getPlayerEntities();
  const opponentEntities = battleActions.getOpponentEntities();
  const selectedEntity = battleSnap.uiState.selectedEntity 
    ? battleSnap.battleState.entities.find(e => e.id === battleSnap.uiState.selectedEntity)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Status Panel */}
      <div className="fixed top-8 left-8 bg-black/80 rounded-lg p-4 text-white z-50">
        <div>Phase: {battleSnap.battleState.phase}</div>
        <div>Turn: {battleSnap.battleState.currentTurn}</div>
        <div>Time: {Math.ceil(battleSnap.battleState.timeRemaining / 1000)}s</div>
        <div>Latency: {battleSnap.latency}ms</div>
        {battleSnap.uiState.actionInProgress && (
          <div className="text-orange-400">Action in progress...</div>
        )}
      </div>

      {/* Notifications */}
      <div className="fixed top-8 right-8 z-50 flex flex-col gap-2">
        {battleSnap.notifications.map((notification, index) => (
          <div
            key={index}
            className="bg-black/90 rounded-lg p-4 border-l-4 border-indigo-500 text-white max-w-xs"
          >
            {notification}
          </div>
        ))}
      </div>

      {/* Battlefield */}
      <div className="grid grid-rows-[1fr_auto_1fr] h-screen p-8 gap-8">
        {/* Opponent Entities */}
        <div className="flex justify-center items-center gap-8 flex-wrap">
          {opponentEntities.map((entity) => (
            <div
              key={entity.id}
              className={`bg-white/10 rounded-xl p-4 backdrop-blur-sm border-2 cursor-pointer transition-all duration-300 min-w-[150px] text-center hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/30 ${
                battleActions.isEntityTargetable(entity.id) ? 'border-red-400' : 'border-white/20'
              }`}
              onClick={() => handleEntityClick(entity)}
            >
              <h4>{entity.name}</h4>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden my-2">
                <div 
                  className="h-full bg-gradient-to-r from-red-400 via-orange-400 to-teal-400 transition-all duration-300"
                  style={{ width: `${(entity.health / entity.maxHealth) * 100}%` }}
                />
              </div>
              <div>{entity.health}/{entity.maxHealth}</div>
              {entity.statusEffects.length > 0 && (
                <div className="text-xs text-orange-400">
                  Effects: {entity.statusEffects.length}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* UI Panel */}
        <div className="bg-black/80 rounded-xl p-4 backdrop-blur-sm border border-white/20">
          {selectedEntity ? (
            <div>
              <h3>Selected: {selectedEntity.name}</h3>
              <div>Health: {selectedEntity.health}/{selectedEntity.maxHealth}</div>
              
              {selectedEntity.playerId === battleSnap.playerId && (
                <div className="flex gap-2 flex-wrap mt-4">
                  {selectedEntity.abilities.map((abilityName) => (
                    <button
                      key={abilityName}
                      className={`border rounded-md text-white px-3 py-2 cursor-pointer transition-all duration-200 ${
                        battleSnap.uiState.selectedAbility === abilityName 
                          ? 'bg-indigo-500 border-indigo-500' 
                          : 'bg-indigo-500/30 border-indigo-500 hover:bg-indigo-500/50'
                      }`}
                      onClick={() => handleAbilityClick(abilityName)}
                    >
                      {abilityName}
                    </button>
                  ))}
                </div>
              )}
              
              {battleSnap.uiState.selectedAbility && (
                <div className="mt-4 text-orange-400">
                  Select a target for {battleSnap.uiState.selectedAbility}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3>Select an entity to view details</h3>
              <p>Click on your entities to select them and use abilities</p>
            </div>
          )}
        </div>

        {/* Player Entities */}
        <div className="flex justify-center items-center gap-8 flex-wrap">
          {playerEntities.map((entity) => (
            <div
              key={entity.id}
              className={`bg-white/10 rounded-xl p-4 backdrop-blur-sm border-2 cursor-pointer transition-all duration-300 min-w-[150px] text-center hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/30 ${
                battleSnap.uiState.selectedEntity === entity.id 
                  ? 'border-indigo-500 bg-indigo-500/20' 
                  : 'border-teal-400'
              }`}
              onClick={() => handleEntityClick(entity)}
            >
              <h4>{entity.name}</h4>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden my-2">
                <div 
                  className="h-full bg-gradient-to-r from-red-400 via-orange-400 to-teal-400 transition-all duration-300"
                  style={{ width: `${(entity.health / entity.maxHealth) * 100}%` }}
                />
              </div>
              <div>{entity.health}/{entity.maxHealth}</div>
              {entity.statusEffects.length > 0 && (
                <div className="text-xs text-orange-400">
                  Effects: {entity.statusEffects.length}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Battle End Overlay */}
      {battleSnap.battleState.phase === 'ended' && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100]">
          <div className="bg-white/10 rounded-xl p-12 text-center backdrop-blur-sm">
            <h2 className="text-4xl mb-4">
              {battleSnap.battleState.winner === battleSnap.playerId ? 'Victory!' : 'Defeat!'}
            </h2>
            <p className="mb-8">
              Winner: {battleSnap.battleState.winner}
            </p>
            <button
              onClick={onBattleEnd}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 rounded-lg text-white px-6 py-3 text-base cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
            >
              Return to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};