import { useState } from "react";
import { BattleApp } from "../battle";

const MainMenu: React.FC = () => {
  const [showBattle, setShowBattle] = useState(false);

  const handleStartGame = () => {
    setShowBattle(true);
  };

  const handleExitBattle = () => {
    setShowBattle(false);
  };

  if (showBattle) {
    return <BattleApp onExit={handleExitBattle} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          SoulBeast
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Enter the arena and battle with elemental creatures
        </p>
        <button
          onClick={handleStartGame}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Start Battle vs AI
        </button>
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Choose your cards and enter battle
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
