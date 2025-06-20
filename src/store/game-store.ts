import { proxy } from "valtio";
import { BattleEngine } from "../engine/BattleEngine";
import { ImageLoader } from "../lib/loader";
import { ActionInput, BattleEvent, BattleState, SoulBeastName } from "../types";
import { AllSoulBeast } from "../engine/SoulBeast";

interface GameStore {
  // Game state
  currentScreen: "menu" | "cardSelection" | "battle" | "results";
  battleEngine: BattleEngine | null;
  battleState: BattleState | null;

  // Card selection
  availableCards: SoulBeastName[];
  player1Cards: SoulBeastName[];
  player2Cards: SoulBeastName[];
  selectedCardIndex: number;

  // Battle UI state
  selectedEntity: string | null;
  targetEntity: string | null;
  selectedAbility: string | null;

  // Game flow
  isLoading: boolean;
  error: string | null;
  winner: string | null;

  // Battle events display
  recentEvents: BattleEvent[];
  maxEvents: number;

  // AI state management
  lastAIActionTime: number;
  aiActionDelay: number; // Minimum delay between AI actions in ms
  aiCurrentState:
    | "idle"
    | "selecting_entity"
    | "selecting_ability"
    | "selecting_target"
    | "executing";
  aiSelectedEntity: string | null;
  aiSelectedAbility: string | null;
  aiActionStartTime: number;
  aiStepDelay: number; // Delay between each step of AI action (entity selection, ability selection, target selection)
}

export const gameStore = proxy<GameStore>({
  currentScreen: "cardSelection",
  battleEngine: null,
  battleState: null,

  availableCards: [],
  player1Cards: [],
  player2Cards: [],
  selectedCardIndex: 0,

  selectedEntity: null,
  targetEntity: null,
  selectedAbility: null,

  isLoading: true,
  error: null,
  winner: null,

  recentEvents: [],
  maxEvents: 20,

  lastAIActionTime: 0,
  aiActionDelay: 1500, // 1.5 second delay between AI actions to match human reaction time
  aiCurrentState: "idle",
  aiSelectedEntity: null,
  aiSelectedAbility: null,
  aiActionStartTime: 0,
  aiStepDelay: 800, // 800ms delay between each step of AI action
});

// Game actions
export const gameActions = {
  // Initialize game data
  async initialize() {
    gameStore.isLoading = true;
    gameStore.error = null;

    const loader = ImageLoader.getInstance();
    await loader.loadImagesFromFolder({
      onProgress: (progress) => {},
      onError: (error) => console.error("Error:", error),
    });

    try {
      gameStore.availableCards = Object.keys(AllSoulBeast) as SoulBeastName[];

      // Automatically select 2 random cards for Player 2 (AI)
      gameActions.selectRandomCards("player2");

      gameStore.currentScreen = "cardSelection";
    } catch (error) {
      gameStore.error =
        error instanceof Error ? error.message : "Failed to initialize game";
    } finally {
      gameStore.isLoading = false;
    }
  },

  // Automatically select random cards for AI (Player 2)
  selectRandomCards(player: "player1" | "player2", totalCards = 2) {
    if (gameStore.availableCards.length <= 1) return;

    const playerCards =
      player === "player1" ? gameStore.player1Cards : gameStore.player2Cards;
    // Clear any existing AI cards
    playerCards.length = 0;

    // Create a copy of available cards to avoid modifying the original
    const availableCardsCopy = [...gameStore.availableCards];

    // Select 2 random card for Player 2
    for (let i = 0; i < totalCards; i++) {
      if (availableCardsCopy.length === 0) break;

      // Randomly select a card
      const randomIndex = Math.floor(Math.random() * availableCardsCopy.length);
      const selectedCard = availableCardsCopy[randomIndex];

      // Add to Player 2's cards
      playerCards.push(selectedCard);

      // Remove selected card from available cards
      availableCardsCopy.splice(randomIndex, 1);
    }
  },

  addToPlayer1(cardName: SoulBeastName) {
    if (
      gameStore.player1Cards.length < 2 &&
      !gameStore.player1Cards.includes(cardName)
    ) {
      gameStore.player1Cards.push(cardName);
    }
  },

  addToPlayer2(cardName: SoulBeastName) {
    if (
      gameStore.player2Cards.length < 2 &&
      !gameStore.player2Cards.includes(cardName)
    ) {
      gameStore.player2Cards.push(cardName);
    }
  },

  removeFromPlayer1(cardName: SoulBeastName) {
    const index = gameStore.player1Cards.indexOf(cardName);
    if (index > -1) {
      gameStore.player1Cards.splice(index, 1);
    }
  },

  removeFromPlayer2(cardName: SoulBeastName) {
    const index = gameStore.player2Cards.indexOf(cardName);
    if (index > -1) {
      gameStore.player2Cards.splice(index, 1);
    }
  },

  // Battle actions
  startBattle() {
    if (
      gameStore.player1Cards.length === 0 ||
      gameStore.player2Cards.length === 0
    ) {
      gameStore.error = "Both players must have at least one card";
      return;
    }

    gameStore.battleEngine = new BattleEngine();
    const success = gameStore.battleEngine.initializeBattle(
      gameStore.player1Cards,
      gameStore.player2Cards
    );

    if (success) {
      gameStore.currentScreen = "battle";
      gameStore.battleState = gameStore.battleEngine.getState();
      gameStore.recentEvents = gameStore.battleEngine.getRecentEvents(
        gameStore.maxEvents
      );

      // Start game loop
      gameActions.startGameLoop();
    } else {
      gameStore.error = "Failed to initialize battle";
    }
  },

  // Game loop
  startGameLoop() {
    const gameLoop = () => {
      if (!gameStore.battleEngine || !gameStore.battleEngine.isActive()) {
        // Battle ended
        gameStore.winner = gameStore.battleEngine?.getWinner() || null;
        if (gameStore.winner || !gameStore.battleEngine?.isActive()) {
          gameStore.currentScreen = "results";
        }
        return;
      }

      // Update battle engine
      gameStore.battleEngine.update(100); // 100ms delta
      gameStore.battleState = gameStore.battleEngine.getState();
      gameStore.recentEvents = gameStore.battleEngine.getRecentEvents(
        gameStore.maxEvents
      );

      // Simple AI for player 2
      gameActions.runAI();

      // Continue loop
      setTimeout(gameLoop, 100);
    };

    gameLoop();
  },

  // Entity selection
  selectEntity(entityId: string) {
    gameStore.selectedEntity = entityId;
    gameStore.selectedAbility = null;
    gameStore.targetEntity = null;
  },

  // Direct ability execution with one click
  executeAbility(entityId: string, abilityName: string, targetId?: string) {
    if (!gameStore.battleEngine) {
      return;
    }

    // Prevent actions during countdown
    if (gameStore.battleEngine.isCountdownActive()) {
      return;
    }

    const action: ActionInput = {
      entityId: entityId,
      abilityName: abilityName,
      targetId: targetId,
    };

    const success = gameStore.battleEngine.attemptAction(action);

    if (success) {
      gameStore.selectedEntity = null;
      gameStore.selectedAbility = null;
      gameStore.targetEntity = null;
    }
  },

  // Direct ability execution for AI without affecting human targeting state
  executeAbilityDirect(
    entityId: string,
    abilityName: string,
    targetId?: string
  ) {
    if (!gameStore.battleEngine) {
      return;
    }

    const action: ActionInput = {
      entityId: entityId,
      abilityName: abilityName,
      targetId: targetId,
    };

    gameStore.battleEngine.attemptAction(action);
    // Note: Don't clear human player's targeting state here
  },

  // For abilities that need targeting
  selectAbilityForTargeting(entityId: string, abilityName: string) {
    // Prevent actions during countdown
    if (gameStore.battleEngine?.isCountdownActive()) {
      return;
    }

    gameStore.selectedEntity = entityId;
    gameStore.selectedAbility = abilityName;
    gameStore.targetEntity = null;
  },

  selectTarget(entityId: string) {
    // Prevent actions during countdown
    if (gameStore.battleEngine?.isCountdownActive()) {
      return;
    }

    if (gameStore.selectedEntity && gameStore.selectedAbility) {
      gameActions.executeAbility(
        gameStore.selectedEntity,
        gameStore.selectedAbility,
        entityId
      );
    }
  },

  // Cancel ongoing casting
  cancelCasting(entityId: string) {
    if (!gameStore.battleEngine || !gameStore.battleState) {
      return;
    }

    const entity = gameStore.battleState.entities.get(entityId);
    if (!entity || !entity.isAlive || !entity.currentCast) {
      return;
    }

    // Only allow players to cancel their own casts
    if (!entityId.startsWith("player1_")) {
      return;
    }

    // Cancel the cast by removing it
    entity.currentCast = undefined;

    // Log the cancellation
    console.log(`${entity.character.name} cancelled their ability cast`);
  },

  // AI that mimics human UI interactions with delays
  runAI() {
    if (!gameStore.battleEngine || !gameStore.battleState) return;

    // Don't run AI during countdown
    if (gameStore.battleEngine.isCountdownActive()) return;

    const currentTime = Date.now();

    // Get all alive player 2 entities
    const player2State = gameStore.battleState.players.get("player2");
    if (!player2State) return;

    const alivePlayer2Cards = player2State.cardIds.filter((cardId) => {
      const entity = gameStore.battleState?.entities.get(cardId);
      return entity && entity.isAlive;
    });

    const alivePlayer1Cards =
      gameStore.battleState.players.get("player1")?.cardIds.filter((cardId) => {
        const entity = gameStore.battleState?.entities.get(cardId);
        return entity && entity.isAlive;
      }) || [];

    if (alivePlayer2Cards.length === 0 || alivePlayer1Cards.length === 0)
      return;

    // State machine for AI actions
    switch (gameStore.aiCurrentState) {
      case "idle":
        // Check if enough time has passed since last action sequence
        if (
          currentTime - gameStore.lastAIActionTime <
          gameStore.aiActionDelay
        ) {
          return;
        }

        // Find cards that have available abilities
        const availableCards = alivePlayer2Cards.filter((cardId) => {
          const entity = gameStore.battleState?.entities.get(cardId);
          if (!entity || !entity.isAlive) return false;

          return entity.character.abilities.some(
            (ability) => !entity.abilityCooldowns.has(ability.name)
          );
        });

        if (availableCards.length === 0) return;

        // Start AI action sequence - select an entity
        const randomCard =
          availableCards[Math.floor(Math.random() * availableCards.length)];
        gameStore.aiSelectedEntity = randomCard;
        gameStore.aiCurrentState = "selecting_entity";
        gameStore.aiActionStartTime = currentTime;

        // Don't visually select the entity - AI should work independently
        break;

      case "selecting_entity":
        // Wait for step delay before selecting ability
        if (currentTime - gameStore.aiActionStartTime < gameStore.aiStepDelay) {
          return;
        }

        if (!gameStore.aiSelectedEntity) {
          gameStore.aiCurrentState = "idle";
          return;
        }

        const entity = gameStore.battleState.entities.get(
          gameStore.aiSelectedEntity
        );
        if (!entity || !entity.isAlive) {
          gameStore.aiCurrentState = "idle";
          gameStore.aiSelectedEntity = null;
          return;
        }

        // Pick a random available ability
        const availableAbilities = entity.character.abilities.filter(
          (ability) => !entity.abilityCooldowns.has(ability.name)
        );

        if (availableAbilities.length === 0) {
          gameStore.aiCurrentState = "idle";
          gameStore.aiSelectedEntity = null;
          return;
        }

        const randomAbility =
          availableAbilities[
            Math.floor(Math.random() * availableAbilities.length)
          ];
        gameStore.aiSelectedAbility = randomAbility.name;
        gameStore.aiCurrentState = "selecting_ability";
        gameStore.aiActionStartTime = currentTime;

        // Check if ability needs targeting
        if (
          randomAbility.effect.includes("target") ||
          randomAbility.effect.includes("enemy")
        ) {
          // Store AI targeting info separately
          gameStore.aiSelectedAbility = randomAbility.name;
          gameStore.aiCurrentState = "selecting_target";
        } else {
          // Direct execution for self-targeted abilities
          gameStore.aiSelectedAbility = randomAbility.name;
          gameStore.aiCurrentState = "executing";
        }
        break;

      case "selecting_ability":
        // Wait for step delay before selecting target
        if (currentTime - gameStore.aiActionStartTime < gameStore.aiStepDelay) {
          return;
        }

        gameStore.aiCurrentState = "selecting_target";
        gameStore.aiActionStartTime = currentTime;
        break;

      case "selecting_target":
        // Wait for step delay before executing
        if (currentTime - gameStore.aiActionStartTime < gameStore.aiStepDelay) {
          return;
        }

        // Pick a random target from player 1
        const randomTarget =
          alivePlayer1Cards[
            Math.floor(Math.random() * alivePlayer1Cards.length)
          ];

        // Execute AI ability directly without affecting human player's targeting state
        if (gameStore.aiSelectedEntity && gameStore.aiSelectedAbility) {
          const aiEntity = gameStore.battleState.entities.get(
            gameStore.aiSelectedEntity
          );
          if (aiEntity) {
            const needsTarget = (() => {
              const ability = aiEntity.character.abilities.find(
                (a) => a.name === gameStore.aiSelectedAbility
              );
              if (!ability) return false;

              // Damage-dealing abilities always require targeting unless they have special effects that indicate otherwise
              const isSelfTargetingAbility =
                ability.effect.toLowerCase().includes("heal") &&
                ability.damage === 0;
              const isAreaEffect =
                ability.effect.toLowerCase().includes("all enemies") ||
                ability.effect.toLowerCase().includes("hits all");
              return (
                ability.damage > 0 && !isSelfTargetingAbility && !isAreaEffect
              );
            })();
            gameActions.executeAbilityDirect(
              gameStore.aiSelectedEntity,
              gameStore.aiSelectedAbility,
              needsTarget ? randomTarget : undefined
            );
          }
        }

        gameStore.aiCurrentState = "executing";
        gameStore.aiActionStartTime = currentTime;
        break;

      case "executing":
        // Wait for execution delay before going back to idle
        if (
          currentTime - gameStore.aiActionStartTime <
          gameStore.aiStepDelay / 2
        ) {
          return;
        }

        // If ability doesn't need targeting, execute it directly
        if (gameStore.aiSelectedEntity && gameStore.aiSelectedAbility) {
          gameActions.executeAbilityDirect(
            gameStore.aiSelectedEntity,
            gameStore.aiSelectedAbility
          );
        }

        // Reset AI state
        gameStore.aiCurrentState = "idle";
        gameStore.aiSelectedEntity = null;
        gameStore.aiSelectedAbility = null;
        gameStore.lastAIActionTime = currentTime;
        break;
    }
  },

  // Navigation
  goToMenu() {
    gameStore.currentScreen = "menu";
    gameStore.battleEngine = null;
    gameStore.battleState = null;
    gameStore.player1Cards = [];
    gameStore.player2Cards = [];
    gameStore.selectedEntity = null;
    gameStore.selectedAbility = null;
    gameStore.targetEntity = null;
    gameStore.winner = null;
    gameStore.error = null;
  },

  goToCardSelection() {
    gameStore.currentScreen = "cardSelection";
    gameStore.player1Cards = [];
    gameStore.player2Cards = [];
    gameStore.error = null;

    // Re-select random cards for AI when going back to card selection
    if (gameStore.availableCards.length > 0) {
      gameActions.selectRandomCards("player2");
    }
  },
};
