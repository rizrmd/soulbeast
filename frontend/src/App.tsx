import { FC, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { FlyingTextRoot } from "./components/Battle/FlyingText";
import BattleArena from "./components/BattleArena";
import { CardDeck } from "./components/CardDeck";
import CardSelection from "./components/CardSelection";
import MainMenu from "./components/MainMenu";
import ResultsScreen from "./components/ResultsScreen";
import { Session } from "./lib/auth";
import { gameActions } from "./engine/GameStore";
import { cn } from "./lib/cn";

const AppContent: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up navigation callbacks
    gameActions.setNavigationCallbacks({
      goToMenu: () => navigate("/menu"),
      goToCardSelection: () => navigate("/card-selection"),
      goToCardDeck: () => navigate("/card-deck"),
      goToBattle: () => navigate("/battle"),
      goToResults: () => navigate("/results"),
    });

    gameActions.initialize();

    if (
      document.documentElement.clientHeight <
      document.documentElement.scrollHeight
    ) {
      document.getElementById("root")!.style.maxHeight =
        `${document.documentElement.clientHeight}px`;
    }
  }, [navigate]);

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
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/card-selection" element={<CardSelection />} />
          <Route path="/card-deck" element={<CardDeck />} />
          <Route path="/battle" element={<BattleArena />} />
          <Route path="/results" element={<ResultsScreen />} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const App: FC<{ session?: Session }> = ({ session: _session }) => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
