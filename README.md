# SoulBeast

A real-time card battle game built with React 19, TypeScript, and Valtio.

## Features

- Real-time card battle system
- Elemental creature combat
- Advanced ability system
- AI image generation via MCP server integration

## MCP Server Integration

This project includes an Imagen 3.0 MCP server for AI image generation. See [MCP_SETUP.md](./MCP_SETUP.md) for configuration instructions.

## Additional Features

## Features

- **Real-time Battle System**: Dynamic combat with abilities, cooldowns, and status effects
- **Card Collection**: 16 unique characters with different elemental compositions
- **Ability System**: Each character has 4 unique abilities (Quick, Power, Ultimate)
- **State Management**: Powered by Valtio for reactive state updates
- **Beautiful UI**: Modern, responsive design with smooth animations
- **AI Opponent**: Battle against an AI that uses your selected cards
- **Battle Analytics**: Detailed battle statistics and highlights

## Game Mechanics

### Characters
Each character has:
- **Elemental Composition**: Mix of 9 different elements (Fire, Water, Earth, Wind, Nature, Frost, Divine, Demon, Beast)
- **4 Unique Abilities**: Quick (low cooldown), Power (medium), Ultimate (high damage/effects)
- **HP/Armor System**: Health points and damage mitigation
- **Status Effects**: Buffs, debuffs, damage over time, healing over time

### Battle System
- **Real-time Combat**: Actions execute immediately with cast times and cooldowns
- **Positioning**: Entities have positions on a battlefield
- **Status Effects**: Stuns, slows, burns, shields, and more
- **Victory Conditions**: Eliminate the enemy card to win

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd triarcane
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Start the development server:
```bash
bun run dev
# or
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## How to Play

### 1. Card Selection
- **Browse Available Cards**: View all 16 characters with their elemental compositions
- **Build Your Deck**: Add 1 card for Player 1
- **AI Deck**: Add 1 card for the AI opponent (Player 2)
- **Start Battle**: Begin the real-time battle when both players have cards

### 2. Battle Phase
- **Select Your Card**: Click on your card (blue glow) to view its abilities
- **Choose Abilities**: Pick from 4 unique abilities for your card
- **Target Enemy**: Select the enemy card to attack
- **Watch the Action**: Observe real-time combat with status effects and damage
- **AI Battles**: The AI automatically uses abilities from its card

### 3. Results
- **Victory Screen**: See who won and detailed battle statistics
- **Battle Analytics**: Review damage dealt, abilities used, and survivors
- **Play Again**: Return to card selection for another battle

## Game Controls

- **Card Selection**: Click cards to select, use action buttons to add to decks (1 card each)
- **Battle**: Click your card to select, click abilities to choose, click enemy to target
- **Navigation**: Use menu buttons to navigate between screens

## Available Characters

### Fire-Based
- **Ember Pyrrak**: Pure fire damage and burning effects
- **Crimson Vorthak**: Fire/demon hybrid with execution abilities
- **Moltak**: Fire/earth tank with defensive capabilities
- **Crimson Thyra**: Fire/demon/wind assassin with soul abilities

### Water-Based
- **Void Ghorth**: Water/beast with dimensional abilities
- **Deep Zephyros**: Water/beast/demon mind controller
- **Crystal Nerith**: Water/nature/divine healer and protector
- **Shrom Xelar**: Water/wind/nature lightning master

### Frost-Based
- **Keth Stalker**: Frost/demon/water hunter with control
- **Morthen**: Frost/beast/wind silent assassin

### Divine-Based
- **Seraph Valdris**: Pure divine with judgment abilities
- **Stellar Nexath**: Divine/wind/nature cosmic dancer
- **Astrix**: Divine/demon/wind void walker

### Earth-Based
- **Bone Thurak**: Earth/fire/demon ancient caller

### Nature-Based
- **Velana**: Nature/wind/beast garden keeper

### Unique
- **Hexis**: Divine/demon/earth chaos entity

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Valtio**: Reactive state management
- **CSS3**: Advanced styling with gradients, animations, and responsive design
- **Rsbuild**: Fast build tool and development server
- **Bun**: JavaScript runtime and package manager

## Project Structure

```
src/
├── components/          # React components
│   ├── MainMenu.tsx    # Main menu screen
│   ├── CardSelection.tsx # Card selection interface
│   ├── BattleArena.tsx # Real-time battle view
│   └── ResultsScreen.tsx # Post-battle results
├── store/              # State management
│   └── gameStore.ts    # Valtio store and actions
├── engine/             # Game logic
│   ├── BattleEngine.ts # Core battle mechanics
│   └── DataLoader.ts   # Data loading utilities
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
└── App.css             # Global styles

public/
├── cards.json          # Character data
├── abilities.json      # Ability definitions
└── img/                # Game assets
    ├── cards/          # Character portraits
    └── elements/       # Element icons
```

## Development

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run simulate` - Run battle simulation (console)

### Adding New Characters

1. Add character data to `public/cards.json`
2. Add abilities to `public/abilities.json`
3. Add character portrait to `public/img/cards/`
4. Character portraits should be named with lowercase and hyphens (e.g., `character-name.webp`)

### Extending Abilities

Abilities support various effects:
- **Damage**: Basic damage dealing
- **Healing**: Self or target healing
- **Status Effects**: Buffs, debuffs, DoT, HoT
- **Stuns**: Disable enemy actions
- **Slows**: Reduce movement/attack speed
- **Special Effects**: Custom mechanics per ability

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Credits

- Character art and design
- Elemental icons and UI graphics
- Battle system inspired by real-time strategy games
- Built with modern web technologies for optimal performance

---

Enjoy battling in the Triarcane arena! 🎮⚔️🔥
