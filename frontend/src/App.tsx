import React, { useRef, useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import BattleArena from "./components/BattleArena";
import CardSelection from "./components/CardSelection";
import MainMenu from "./components/MainMenu";
import ResultsScreen from "./components/ResultsScreen";
import { gameActions, gameStore } from "./store/game-store";
import { FlyingTextRoot } from "./components/Battle/FlyingText";
import { cn } from "./lib/cn";
import { CardDeck } from "./components/CardDeck";
import Auth from "./components/Auth";
import { useSession, type User } from "./lib/auth";

const App = () => {
  const state = useSnapshot(gameStore);
  const ref = useRef<HTMLDivElement>(null);
  const { data: session, isPending: authLoading } = useSession();
  const [user, setUser] = useState<User | null>(null);

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

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const renderCurrentScreen = () => {
    if (state.isLoading || authLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-lg">Loading...</div>
        </div>
      );
    }

    // Show auth screen if user is not authenticated
    if (!session?.user && !user) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Auth onAuthSuccess={handleAuthSuccess} />
        </div>
      );
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
