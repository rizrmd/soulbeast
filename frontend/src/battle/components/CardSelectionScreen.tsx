import React, { useState } from "react";
import { AllSoulBeast, SoulBeastName } from "../../engine/SoulBeast";
import { gameStore } from "../../engine/GameStore";

interface CardSelectionScreenProps {
  onSelectionComplete: () => void;
}

export const CardSelectionScreen: React.FC<CardSelectionScreenProps> = ({ onSelectionComplete }) => {
  const [selectedCards, setSelectedCards] = useState<{
    cardName: SoulBeastName;
    configuration: { name: string; description: string; abilities: readonly string[]; totalCost: number };
  }[]>([]);

  const availableCards = Object.keys(AllSoulBeast) as SoulBeastName[];
  const maxCards = 3;

  const handleCardSelect = (cardName: SoulBeastName) => {
    if (selectedCards.length >= maxCards) {
      alert(`You can only select up to ${maxCards} cards!`);
      return;
    }

    const cardData = AllSoulBeast[cardName];
    if (!cardData) return;

    // Create default configuration with first 3 abilities
    const defaultAbilities = cardData.abilities.slice(0, 3).map(ability => ability.name);
    
    const newCard = {
      cardName,
      configuration: {
        name: cardData.name,
        description: cardData.title || "A powerful SoulBeast",
        abilities: defaultAbilities,
        totalCost: defaultAbilities.length * 10, // Simple cost calculation
      },
    };

    setSelectedCards([...selectedCards, newCard]);
  };

  const handleCardRemove = (index: number) => {
    setSelectedCards(selectedCards.filter((_, i) => i !== index));
  };

  const handleAbilityToggle = (cardIndex: number, abilityName: string) => {
    const updatedCards = [...selectedCards];
    const card = updatedCards[cardIndex];
    const currentAbilities = [...card.configuration.abilities];
    
    if (currentAbilities.includes(abilityName)) {
      // Remove ability (but keep at least 1)
      if (currentAbilities.length > 1) {
        card.configuration.abilities = currentAbilities.filter(a => a !== abilityName) as readonly string[];
      }
    } else {
      // Add ability (max 4)
      if (currentAbilities.length < 4) {
        card.configuration.abilities = [...currentAbilities, abilityName] as readonly string[];
      }
    }
    
    setSelectedCards(updatedCards);
  };

  const handleConfirmSelection = () => {
    if (selectedCards.length === 0) {
      alert("Please select at least one card!");
      return;
    }

    // Update game store with selected cards
    gameStore.player1Cards = selectedCards;
    onSelectionComplete();
  };



  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <h1 className="text-center mb-8 text-3xl font-bold">Select Your SoulBeasts</h1>
      
      {/* Selected Cards Section */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Selected Cards ({selectedCards.length}/{maxCards})</h2>
        {selectedCards.length === 0 ? (
          <p className="text-gray-400">No cards selected yet...</p>
        ) : (
          selectedCards.map((card, index) => {
            const cardData = AllSoulBeast[card.cardName];
            return (
              <div 
                key={index}
                className="bg-white/15 rounded-xl p-4 mb-4 border border-indigo-500 backdrop-blur-sm"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">{cardData.name}</h3>
                  <button 
                    onClick={() => handleCardRemove(index)}
                    className="bg-red-500 hover:bg-red-600 border-0 rounded px-2 py-1 text-white text-sm cursor-pointer transition-colors"
                  >
                    Remove
                  </button>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Abilities ({card.configuration.abilities.length}/4):</h4>
                  <div className="flex flex-wrap gap-1">
                    {cardData.abilities.map(ability => (
                      <button
                        key={ability.name}
                        className={`bg-white/10 border border-white/30 rounded px-2 py-1 m-0.5 text-xs text-white cursor-pointer transition-all hover:bg-white/20 ${
                          card.configuration.abilities.includes(ability.name) 
                            ? 'bg-indigo-500/30 border-indigo-400' 
                            : ''
                        }`}
                        onClick={() => handleAbilityToggle(index, ability.name)}
                        title={ability.description}
                      >
                        {ability.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Available Cards Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available SoulBeasts</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 mb-8">
          {availableCards.map(cardName => {
            const cardData = AllSoulBeast[cardName];
            const isSelected = selectedCards.some(c => c.cardName === cardName);
            
            return (
              <div
                key={cardName}
                className={`bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 transition-all duration-300 relative ${
                  isSelected 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/30 hover:border-indigo-400'
                }`}
                onClick={() => !isSelected && handleCardSelect(cardName)}
              >
                <h3 className="text-lg font-medium mb-2">{cardData.name}</h3>
                <p className="text-sm text-gray-300 mb-4">
                  {cardData.title}
                </p>
                
                <div>
                  <h4 className="text-xs font-medium mb-2">Abilities:</h4>
                  <div className="flex flex-wrap gap-0.5">
                    {cardData.abilities.slice(0, 4).map(ability => (
                      <span 
                        key={ability.name}
                        className="bg-white/10 px-1.5 py-0.5 rounded text-xs"
                      >
                        {ability.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 bg-green-400 rounded-full w-6 h-6 flex items-center justify-center text-xs text-white">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Confirm Button */}
      <div className="text-center mt-12">
        <button 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 rounded-lg text-white px-6 py-3 text-base font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          onClick={handleConfirmSelection}
          disabled={selectedCards.length === 0}
        >
          Confirm Selection & Continue to Matchmaking
        </button>
      </div>
    </div>
  );
};