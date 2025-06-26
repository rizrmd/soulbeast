import React, { useState, useEffect } from "react";
import { useSnapshot } from "valtio";
import { CardSelectionScreen } from "./components/CardSelectionScreen";
import { MatchmakingScreen } from "./components/MatchmakingScreen";
import { BattleScreen } from "./components/BattleScreen";
import { networkStore, networkManager } from "./NetworkManager";
import { battleStore, battleActions } from "./BattleStore";

type BattleAppState = "card-selection" | "matchmaking" | "battle";

interface BattleAppProps {
  onExit?: () => void;
}

export const BattleApp: React.FC<BattleAppProps> = ({ onExit }) => {
  const [currentState, setCurrentState] = useState<BattleAppState>("card-selection");
  const networkSnap = useSnapshot(networkStore);

  useEffect(() => {
    // Initialize network connection when app starts
    networkManager.connect().catch(console.error);
    
    // Set player ID in battle store
    const playerId = localStorage.getItem("playerId") || `player_${Date.now()}`;
    localStorage.setItem("playerId", playerId);
    battleStore.playerId = playerId;
    
    return () => {
      // Cleanup on unmount
      if (networkSnap.matchmaking.isInQueue) {
        networkManager.leaveMatchmaking();
      }
      networkManager.disconnect();
    };
  }, []);

  useEffect(() => {
    // Handle battle start from network
    if (networkSnap.battle.isInBattle && networkSnap.battle.battleState) {
      battleActions.startBattle(
        networkSnap.battle.battleId!,
        networkSnap.battle.battleState
      );
      setCurrentState("battle");
    }
  }, [networkSnap.battle.isInBattle, networkSnap.battle.battleState]);

  const handleCardSelectionComplete = () => {
    setCurrentState("matchmaking");
  };

  const handleBattleStart = () => {
    setCurrentState("battle");
  };

  const handleBattleEnd = () => {
    // Reset to card selection for now
    setCurrentState("card-selection");
    
    // Clean up battle state
    battleActions.endBattle();
  };

  const handleExit = () => {
    // Clean up before exiting
    if (networkSnap.matchmaking.isInQueue) {
      networkManager.leaveMatchmaking();
    }
    networkManager.disconnect();
    
    if (onExit) {
      onExit();
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white relative">
      {/* Exit Button */}
      {onExit && (
        <button 
          className="fixed top-8 right-8 bg-red-500/80 hover:bg-red-500 border-0 rounded-lg text-white px-4 py-2 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 z-50"
          onClick={handleExit}
        >
          Exit Battle
        </button>
      )}

      {/* Connection Status */}
      <div className="fixed bottom-8 left-8 bg-black/80 rounded-lg px-4 py-2 text-sm z-50 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          networkSnap.network.isConnected ? 'bg-teal-400' : 'bg-red-400'
        }`} />
        <span>
          {networkSnap.network.isConnected ? 'Connected' : 'Disconnected'}
          {networkSnap.network.latency > 0 && ` (${networkSnap.network.latency}ms)`}
        </span>
      </div>

      {/* Main Content */}
      <div>
        {currentState === "card-selection" && (
          <CardSelectionScreen onSelectionComplete={handleCardSelectionComplete} />
        )}

        {currentState === "matchmaking" && (
          <MatchmakingScreen onBattleStart={handleBattleStart} />
        )}

        {currentState === "battle" && (
          <BattleScreen onBattleEnd={handleBattleEnd} />
        )}
      </div>

      {/* Loading Overlay */}
      {networkSnap.network.isConnecting && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100]">
          <div className="bg-white/10 rounded-xl p-8 text-center backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-white/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-4" />
            <p>Connecting to battle server...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleApp;