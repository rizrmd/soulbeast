import React, { useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import BattleArena from "./components/BattleArena";
import CardSelection from "./components/CardSelection";
import MainMenu from "./components/MainMenu";
import ResultsScreen from "./components/ResultsScreen";
import { gameActions, gameStore } from "./store/game-store";
import { FlyingTextRoot } from "./components/Battle/FlyingText";
import { cn } from "./lib/cn";
import { CardDeck } from "./components/CardDeck";

const App = () => {
  const state = useSnapshot(gameStore);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gameActions.initialize();

    if (
      document.documentElement.clientHeight <
      document.documentElement.scrollHeight
    ) {
      document.getElementById("root")!.style.maxHeight =
        `${document.documentElement.clientHeight}px`;
    }
  }, []);

  const renderCurrentScreen = () => {
    if (state.isLoading) {
      return null;
    }

    switch (state.currentScreen) {
      case "menu":
        return <MainMenu />;
      case "cardSelection":
        return <CardSelection />;
      case "cardDeck":
        return <CardDeck />;
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
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      className={cn("h-full select-none flex items-stretch justify-center")}
    >
      <div
        className={cn(
          `max-w-[500px] w-full shadow-sm shadow-gray-600 contain-content`
        )}
        ref={ref}
      >
        {ref.current && <FlyingTextRoot parent={ref.current} />}
        {renderCurrentScreen()}
      </div>
    </div>
  );
};

export default App;
