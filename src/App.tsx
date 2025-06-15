import { useEffect } from "react";
import { useSnapshot } from "valtio";
import BattleArena from "./components/BattleArena";
import CardSelection from "./components/CardSelection";
import MainMenu from "./components/MainMenu";
import ResultsScreen from "./components/ResultsScreen";
import { gameActions, gameStore } from "./store/gameStore";

const App = () => {
  const state = useSnapshot(gameStore);

  useEffect(() => {
    gameActions.initialize();
  }, []);

  const renderCurrentScreen = () => {
    if (state.isLoading) {
      return (
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading game data...</p>
        </div>
      );
    }

    switch (state.currentScreen) {
      case "menu":
        return <MainMenu />;
      case "cardSelection":
        return <CardSelection />;
      case "battle":
        return <BattleArena />;
      case "results":
        return <ResultsScreen />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <div
      className={cn("min-h-screen flex items-stretch justify-center")}
    >
      <div
        className={cn(
          `max-w-[500px] w-full shadow-sm shadow-gray-600 contain-content`
        )}
      >
        {renderCurrentScreen()}
      </div>
    </div>
  );
};

export default App;
