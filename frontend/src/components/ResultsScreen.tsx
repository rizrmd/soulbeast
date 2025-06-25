import React from 'react';
import { useSnapshot } from 'valtio';
import { gameStore, gameActions } from '../store/game-store';

const ResultsScreen: React.FC = () => {
  const state = useSnapshot(gameStore);

  const getWinnerText = () => {
    if (state.winner === 'player1') {
      return 'Player 1 Wins!';
    } else if (state.winner === 'player2') {
      return 'Player 2 (AI) Wins!';
    } else {
      return 'Draw!';
    }
  };

  const getWinnerColor = () => {
    if (state.winner === 'player1') {
      return '#4CAF50';
    } else if (state.winner === 'player2') {
      return '#F44336';
    } else {
      return '#FF9800';
    }
  };

  const getBattleStats = () => {
    if (!state.battleState) return null;

    const battleDuration = Math.floor((state.battleState.currentTime - state.battleState.startTime) / 1000);
    const totalEvents = state.recentEvents.length;
    
    const player1Alive = state.battleState.players.get('player1')?.cardIds.filter(id => {
      const entity = state.battleState?.entities.get(id);
      return entity?.isAlive;
    }).length || 0;

    const player2Alive = state.battleState.players.get('player2')?.cardIds.filter(id => {
      const entity = state.battleState?.entities.get(id);
      return entity?.isAlive;
    }).length || 0;

    return {
      duration: battleDuration,
      events: totalEvents,
      player1Survivors: player1Alive,
      player2Survivors: player2Alive
    };
  };

  const stats = getBattleStats();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 ">
      <div className="w-full max-w-5xl bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col gap-8 h-screen overflow-auto">
        <div className="flex flex-col items-center gap-2 mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">{getWinnerText()}</h1>
          <div className="text-6xl" style={{ color: getWinnerColor() }}>
            {state.winner === 'player1' ? '👑' : state.winner === 'player2' ? '🤖' : '🤝'}
          </div>
        </div>
        {stats && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-semibold text-white mb-2">Battle Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400">Battle Duration</div>
                <div className="text-white font-bold">{stats.duration} seconds</div>
              </div>
              <div>
                <div className="text-gray-400">Total Actions</div>
                <div className="text-white font-bold">{stats.events}</div>
              </div>
              <div>
                <div className="text-gray-400">Player 1 Survivors</div>
                <div className="text-white font-bold">{stats.player1Survivors}</div>
              </div>
              <div>
                <div className="text-gray-400">Player 2 Survivors</div>
                <div className="text-white font-bold">{stats.player2Survivors}</div>
              </div>
            </div>
          </div>
        )}
        {state.battleState && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Final Battle State</h3>
            <div className="grid grid-cols-2 gap-2">
              {Array.from(state.battleState.entities.values()).map(entity => (
                <div key={entity.id} className={`rounded p-2 flex flex-col items-center ${entity.isAlive ? 'bg-green-900/40' : 'bg-red-900/40'}`}>
                  <div className="text-white font-bold">{entity.character.name}</div>
                  <div className="text-gray-300 text-sm">{entity.isAlive ? `${Math.round(entity.hp)}/${entity.maxHp} HP` : 'Defeated'}</div>
                  <div className={`text-xs ${entity.id.startsWith('player1_') ? 'text-indigo-300' : 'text-pink-300'}`}>{entity.id.startsWith('player1_') ? 'Player 1' : 'Player 2'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">Battle Highlights</h3>
          <div className="flex flex-col gap-2">
            {state.recentEvents
              .filter(event => event.type === 'death' || event.type === 'ability_used')
              .slice(-5)
              .reverse()
              .map((event, index) => (
                <div key={index} className={`flex items-center gap-2 ${event.type === 'death' ? 'text-red-400' : 'text-indigo-300'}`}>
                  <span className="text-xs font-mono bg-gray-700 rounded px-2 py-1">
                    {Math.floor((event.timestamp - (state.battleState?.startTime || 0)) / 1000)}s
                  </span>
                  <span className="text-sm">{event.message}</span>
                </div>
              ))}
          </div>
        </div>
        <div className="flex gap-4 justify-center mt-4">
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded transition"
            onClick={gameActions.goToCardSelection}
          >
            Play Again
          </button>
          <button 
            className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-6 rounded transition"
            onClick={gameActions.goToMenu}
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
