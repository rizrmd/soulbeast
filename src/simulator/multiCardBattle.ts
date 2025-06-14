import { RealtimeBattleSimulator } from "./RealtimeBattleSimulator";

/**
 * Example demonstrating a 1v1 battle
 * Player 1 has 1 card, Player 2 has 1 card
 */
async function run1v1Battle() {
  console.log("🎯 Starting 1v1 Battle Example");
  console.log("===============================\n");

  // Create battle simulator with custom timing for demonstration
  const simulator = new RealtimeBattleSimulator(
    {
      maxHp: 150, // Standard HP for fair fights
      castInterruption: true,
    },
    {
      updateInterval: 100,
      statusDisplayInterval: 2000, // Show status every 2 seconds
      aiActionInterval: 800, // AI acts every 800ms
      battleCheckInterval: 500,
    }
  );

  // Single card per player
  const player1Cards = ["Crimson Vorthak"]; // Fire/Demon DPS
  const player2Cards = ["Shrom Xelar"];     // Nature/Wind DPS

  console.log("Player 1 Card:", player1Cards[0]);
  console.log("Player 2 Card:", player2Cards[0]);

  console.log("\n🎮 1v1 Battle begins!\n");

  // Start the battle
  const success = simulator.startBattle(player1Cards, player2Cards);

  if (!success) {
    console.log("❌ Failed to start battle - card not found");
    return;
  }

  // Run the auto battle and wait for completion
  await simulator.runAutoBattle();

  // Show final results
  const winner = simulator.getEngine().getWinner();
  const duration = simulator.getEngine().getBattleDuration();

  console.log("\n🏁 FINAL RESULTS");
  console.log("================");

  if (winner === "player1") {
    console.log("🏆 Player 1 wins!");
  } else if (winner === "player2") {
    console.log("🏆 Player 2 wins!");
  } else {
    console.log("🤝 Battle ended in a draw!");
  }

  console.log(`⏱️  Battle duration: ${duration.toFixed(1)} seconds`);

  // Show final state of cards
  const state = simulator.getEngine().getState();
  console.log("\n📊 Final Card Status:");

  console.log("\nPlayer 1 Card:");
  const player1State = state.players.get("player1");
  if (player1State) {
    player1State.cardIds.forEach((cardId) => {
      const entity = state.entities.get(cardId);
      if (entity) {
        const status = entity.isAlive
          ? `💚 ${Math.round(entity.hp)}/${entity.maxHp} HP`
          : "💀 Defeated";
        console.log(`  ${entity.character.name}: ${status}`);
      }
    });
  }

  console.log("\nPlayer 2 Card:");
  const player2State = state.players.get("player2");
  if (player2State) {
    player2State.cardIds.forEach((cardId) => {
      const entity = state.entities.get(cardId);
      if (entity) {
        const status = entity.isAlive
          ? `💚 ${Math.round(entity.hp)}/${entity.maxHp} HP`
          : "💀 Defeated";
        console.log(`  ${entity.character.name}: ${status}`);
      }
    });
  }
}

/**
 * Example demonstrating a many cards vs many cards battle
 * Player 1 has 3 cards, Player 2 has 3 cards
 */
async function runMultiCardBattle() {
  console.log("🎯 Starting Multi-Card Battle Example");
  console.log("=====================================\n");

  // Create battle simulator with custom timing for demonstration
  const simulator = new RealtimeBattleSimulator(
    {
      maxHp: 150, // Lower HP for faster battles
      castInterruption: true,
    },
    {
      updateInterval: 100,
      statusDisplayInterval: 2000, // Show status every 2 seconds
      aiActionInterval: 800, // AI acts every 800ms
      battleCheckInterval: 500,
    }
  );

  // Player 1 cards - a balanced team
  const player1Cards = [
    "Crimson Vorthak", // Fire/Demon DPS
    "Crystal Nerith", // Water/Nature/Divine Support
    "Bone Thurak", // Earth/Fire Tank
  ];

  // Player 2 cards - another balanced team
  const player2Cards = [
    "Shrom Xelar", // Nature/Wind DPS
    "Seraph Valdris", // Divine Support
    "Moltak", // Fire/Earth Tank
  ];

  console.log("Player 1 Team:");
  player1Cards.forEach((card, index) => {
    console.log(`  ${index + 1}. ${card}`);
  });

  console.log("\nPlayer 2 Team:");
  player2Cards.forEach((card, index) => {
    console.log(`  ${index + 1}. ${card}`);
  });

  console.log("\n🎮 Battle begins!\n");

  // Start the battle
  const success = simulator.startBattle(player1Cards, player2Cards);

  if (!success) {
    console.log("❌ Failed to start battle - some cards were not found");
    return;
  }

  // Run the auto battle and wait for completion
  await simulator.runAutoBattle();

  // Show final results
  const winner = simulator.getEngine().getWinner();
  const duration = simulator.getEngine().getBattleDuration();

  console.log("\n🏁 FINAL RESULTS");
  console.log("================");

  if (winner === "player1") {
    console.log("🏆 Player 1 wins!");
  } else if (winner === "player2") {
    console.log("🏆 Player 2 wins!");
  } else {
    console.log("🤝 Battle ended in a draw!");
  }

  console.log(`⏱️  Battle duration: ${duration.toFixed(1)} seconds`);

  // Show final state of all cards
  const state = simulator.getEngine().getState();
  console.log("\n📊 Final Card Status:");

  console.log("\nPlayer 1 Cards:");
  const player1State = state.players.get("player1");
  if (player1State) {
    player1State.cardIds.forEach((cardId) => {
      const entity = state.entities.get(cardId);
      if (entity) {
        const status = entity.isAlive
          ? `💚 ${Math.round(entity.hp)}/${entity.maxHp} HP`
          : "💀 Defeated";
        console.log(`  ${entity.character.name}: ${status}`);
      }
    });
  }

  console.log("\nPlayer 2 Cards:");
  const player2State = state.players.get("player2");
  if (player2State) {
    player2State.cardIds.forEach((cardId) => {
      const entity = state.entities.get(cardId);
      if (entity) {
        const status = entity.isAlive
          ? `💚 ${Math.round(entity.hp)}/${entity.maxHp} HP`
          : "💀 Defeated";
        console.log(`  ${entity.character.name}: ${status}`);
      }
    });
  }
}

/**
 * Example with uneven teams - 2 vs 4 cards
 */
async function runUnevenTeamBattle() {
  console.log("\n\n🎯 Starting Uneven Team Battle Example (2 vs 4)");
  console.log("================================================\n");

  const simulator = new RealtimeBattleSimulator(
    {
      maxHp: 200, // Higher HP to compensate for numbers disadvantage
      castInterruption: true,
    },
    {
      updateInterval: 100,
      statusDisplayInterval: 3000,
      aiActionInterval: 600,
      battleCheckInterval: 500,
    }
  );

  // Player 1 - smaller but stronger team
  const player1Cards = ["Ember Pyrrak", "Astrix"];

  // Player 2 - larger team
  const player2Cards = ["Keth Stalker", "Void Ghorth", "Velana", "Hexis"];

  console.log(
    `Player 1 Team (${player1Cards.length} cards):`,
    player1Cards.join(", ")
  );
  console.log(
    `Player 2 Team (${player2Cards.length} cards):`,
    player2Cards.join(", ")
  );

  console.log("\n🎮 Uneven battle begins!\n");

  const success = simulator.startBattle(player1Cards, player2Cards);

  if (!success) {
    console.log("❌ Failed to start battle");
    return;
  }

  await simulator.runAutoBattle();

  const winner = simulator.getEngine().getWinner();
  const duration = simulator.getEngine().getBattleDuration();

  console.log("\n🏁 UNEVEN BATTLE RESULTS");
  console.log("========================");

  if (winner === "player1") {
    console.log("🏆 Player 1 wins against the odds!");
  } else if (winner === "player2") {
    console.log("🏆 Player 2 wins with superior numbers!");
  } else {
    console.log("🤝 Incredible draw!");
  }

  console.log(`⏱️  Battle duration: ${duration.toFixed(1)} seconds`);
}

// Run the examples
async function main() {
  try {
    await run1v1Battle();
    await runMultiCardBattle();
    await runUnevenTeamBattle();
  } catch (error) {
    console.error("Error running battle examples:", error);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { run1v1Battle, runMultiCardBattle, runUnevenTeamBattle };
