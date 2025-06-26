import { useNavigate } from 'react-router-dom';

export const useGameNavigation = () => {
  const navigate = useNavigate();

  const navigateToScreen = (screen: 'menu' | 'cardSelection' | 'battle' | 'results' | 'cardDeck') => {
    const routeMap = {
      menu: '/menu',
      cardSelection: '/card-selection',
      cardDeck: '/card-deck',
      battle: '/battle',
      results: '/results'
    };
    
    navigate(routeMap[screen]);
  };

  return {
    navigateToScreen,
    goToMenu: () => navigateToScreen('menu'),
    goToCardSelection: () => navigateToScreen('cardSelection'),
    goToCardDeck: () => navigateToScreen('cardDeck'),
    goToBattle: () => navigateToScreen('battle'),
    goToResults: () => navigateToScreen('results')
  };
};