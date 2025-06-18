import React, { useEffect } from "react";
import { gameActions } from "../store/game-store";

const MainMenu: React.FC = () => {
  const handleStartGame = () => {
    gameActions.initialize();
  };

  useEffect(() => {
    handleStartGame();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-white mb-2">Triarcane Battle</h1>
        <p className="text-lg text-gray-300 mb-6">Card Battle Arena</p>
        <div className="flex flex-col gap-3 w-full mb-6">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition"
            onClick={handleStartGame}
          >
            Start Game
          </button>
          <button
            className="bg-gray-700 text-gray-400 font-semibold py-2 px-4 rounded cursor-not-allowed"
            disabled
          >
            Tutorial
          </button>
          <button
            className="bg-gray-700 text-gray-400 font-semibold py-2 px-4 rounded cursor-not-allowed"
            disabled
          >
            Settings
          </button>
        </div>
        <div className="text-gray-400 text-center">
          <p>Build your deck and battle with elemental creatures!</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
