import React, { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { networkManager, networkStore } from "../NetworkManager";
import { gameStore } from "../../engine/GameStore";

interface MatchmakingScreenProps {
  onBattleStart: () => void;
}

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({
  onBattleStart,
}) => {
  const networkSnap = useSnapshot(networkStore);
  const gameSnap = useSnapshot(gameStore);
  const [selectedMode, setSelectedMode] = useState<"PVP" | "PVE">("PVE");
  const [readyCountdown, setReadyCountdown] = useState(0);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    networkManager.connect().catch(console.error);

    return () => {
      // Clean up on unmount
      if (networkSnap.matchmaking.isInQueue) {
        networkManager.leaveMatchmaking();
      }
    };
  }, []);

  useEffect(() => {
    // Handle battle start
    if (networkSnap.battle.isInBattle) {
      onBattleStart();
    }
  }, [networkSnap.battle.isInBattle, onBattleStart]);

  useEffect(() => {
    // Handle ready countdown
    if (
      networkSnap.matchmaking.matchFound &&
      networkSnap.matchmaking.readyTimeoutMs > 0
    ) {
      const startTime = Date.now();
      const duration = networkSnap.matchmaking.readyTimeoutMs;

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
        setReadyCountdown(remaining);

        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [
    networkSnap.matchmaking.matchFound,
    networkSnap.matchmaking.readyTimeoutMs,
  ]);

  const handleStartMatchmaking = () => {
    setSelectedMode("PVE");

    if (gameSnap.player1Cards.length === 0) {
      alert("Please select at least one SoulBeast card first!");
      return;
    }

    const playerCards = gameSnap.player1Cards.map((card) => ({
      cardName: card.cardName,
      configuration: card.configuration,
    }));

    networkManager.joinMatchmaking(selectedMode, playerCards);
  };

  const handleCancelMatchmaking = () => {
    networkManager.leaveMatchmaking();
  };

  const handleConfirmReady = () => {
    networkManager.confirmReady();
  };

  if (!networkSnap.network.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm border border-white/20 max-w-lg w-full">
          <h2 className="text-xl font-semibold mb-4">
            Connecting to Battle Server...
          </h2>
          {networkSnap.network.connectionError && (
            <p className="text-red-400">
              Error: {networkSnap.network.connectionError}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (networkSnap.matchmaking.matchFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm border border-white/20 max-w-lg w-full">
          <h2 className="text-xl font-semibold mb-2">Match Found!</h2>
          <p className="mb-8">Get ready for battle!</p>

          <div className="my-8 text-center">
            <div className="text-5xl font-bold text-indigo-400 mb-2">
              {readyCountdown}
            </div>
            <p>seconds to confirm</p>
          </div>

          <div className="flex gap-4 justify-center mb-4">
            <button
              className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 rounded-lg text-white px-6 py-3 text-base font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleConfirmReady}
              disabled={networkSnap.matchmaking.isReady}
            >
              {networkSnap.matchmaking.isReady ? "Ready!" : "Confirm Ready"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p>
              You: {networkSnap.matchmaking.isReady ? "✅ Ready" : "⏳ Waiting"}
            </p>
            <p>
              Opponent:{" "}
              {networkSnap.matchmaking.opponentReady
                ? "✅ Ready"
                : "⏳ Waiting"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (networkSnap.matchmaking.isInQueue) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm border border-white/20 max-w-lg w-full text-center">
          <h2 className="text-xl font-semibold mb-2">Finding Match...</h2>
          <p className="mb-8">
            Searching for{" "}
            {selectedMode === "PVP" ? "another player" : "AI opponent"}...
          </p>

          <div className="my-8">
            <div className="w-12 h-12 border-4 border-white/30 border-t-indigo-400 rounded-full animate-spin mx-auto" />
          </div>

          <button
            className="bg-gradient-to-r from-red-500 to-red-600 border-0 rounded-lg text-white px-6 py-3 text-base font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/40"
            onClick={handleCancelMatchmaking}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm border border-white/20 max-w-lg w-full">
        <h1 className="text-center mb-8 text-2xl font-bold">
          Battle Matchmaking
        </h1>

        {/* Selected Cards Display */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">
            Your Selected SoulBeasts:
          </h3>
          {gameSnap.player1Cards.length === 0 ? (
            <p className="text-red-400">
              No cards selected! Please go to card selection first.
            </p>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {gameSnap.player1Cards.map((card, index) => (
                <div key={index} className="bg-white/10 p-2 rounded text-sm">
                  {card.configuration.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mode Selection */}
        {/* <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Select Battle Mode:</h3>
          <div className="flex justify-center mt-4 gap-4">
            <button
              className={`bg-white/10 border-2 border-white/30 rounded-lg text-white px-6 py-3 cursor-pointer transition-all duration-300 hover:bg-white/20 ${
                selectedMode === "PVE"
                  ? "bg-indigo-500/30 border-indigo-400"
                  : ""
              }`}
              onClick={() => setSelectedMode("PVE")}
            >
              vs AI
            </button>
            <button
              className={`bg-white/10 border-2 border-white/30 rounded-lg text-white px-6 py-3 cursor-pointer transition-all duration-300 hover:bg-white/20 ${
                selectedMode === "PVP"
                  ? "bg-indigo-500/30 border-indigo-400"
                  : ""
              }`}
              onClick={() => setSelectedMode("PVP")}
            >
              vs Player
            </button>
          </div>
        </div> */}

        {/* Connection Status */}
        <div className="mb-8 text-center">
          <p>
            Connection:
            <span
              className={
                networkSnap.network.isConnected
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {networkSnap.network.isConnected ? " Connected" : " Disconnected"}
            </span>
          </p>
          {networkSnap.network.latency > 0 && (
            <p>Latency: {networkSnap.network.latency}ms</p>
          )}
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 rounded-lg text-white px-6 py-3 text-base font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleStartMatchmaking}
            disabled={
              gameSnap.player1Cards.length === 0 ||
              !networkSnap.network.isConnected
            }
          >
            Start Matchmaking
          </button>
        </div>
      </div>
    </div>
  );
};
