# SoulBeast Project Rules

## Project Overview
SoulBeast is a real-time card battle game built with React 19, TypeScript, and Valtio for state management. Players battle with elemental creatures in an interactive arena using a sophisticated ability system.

## Architecture Guidelines

### Technology Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Rsbuild
- **State Management**: Valtio for reactive state updates
- **Styling**: TailwindCSS v4 with PostCSS
- **Animations**: Motion library and Goober for CSS-in-JS
- **Runtime**: Bun (preferred) or Node.js 18+

### Project Structure
```
src/
├── components/          # React components organized by feature
├── engine/             # Core game logic and data
├── abilities/          # Ability system implementation
├── store/              # Valtio state management
├── lib/                # Utility functions and helpers
├── simulator/          # Battle simulation tools
└── types.ts            # Global TypeScript definitions
```

## Code Standards

### TypeScript
- **Strict Mode**: Always use strict TypeScript configuration
- **Interface Definitions**: Define clear interfaces for all game entities
- **Type Safety**: No `any` types unless absolutely necessary
- **Naming**: Use PascalCase for interfaces, camelCase for variables/functions

### React Components
- **Functional Components**: Use function components with hooks
- **Component Organization**: Group related components in feature folders
- **Props Interface**: Always define TypeScript interfaces for component props
- **State Management**: Use Valtio for global state, local state for component-specific data

### File Naming
- **Components**: PascalCase (e.g., `BattleArena.tsx`)
- **Utilities**: camelCase (e.g., `gameStore.ts`)
- **Types**: camelCase with descriptive names (e.g., `types.ts`)
- **Constants**: UPPER_SNAKE_CASE for exported constants

## Game System Rules

### Character System
- **Elemental Composition**: Each character has a mix of 9 elements (Fire, Water, Earth, Wind, Nature, Frost, Divine, Demon, Beast)
- **Abilities**: Each character must have exactly 4 abilities (Quick, Power, Ultimate types)
- **Naming**: Characters follow "Name + Title" pattern (e.g., "Keth Stalker - Crystal Nightmare Hunter")

### Ability System
- **Types**: Three ability types with different characteristics:
  - `quick`: Low cooldown, moderate damage
  - `power`: Medium cooldown, higher damage
  - `ultimate`: High cooldown, maximum damage/effects
- **Properties**: All abilities must define: name, emoji, type, cooldown, damage, effect, description, target, castTime
- **Targeting**: Use predefined target types: `single-enemy`, `all-enemy`, `single-friend`, `all-friend`, `self`

### Battle Engine
- **Real-time Combat**: Actions execute immediately with cast times and cooldowns
- **Status Effects**: Implement buffs, debuffs, DoT, HoT using the StatusEffect interface
- **Entity Management**: Use BattleEntity interface for all combat participants
- **Event System**: Log all battle events for analytics and replay

## Development Workflow

### Scripts
- `bun dev`: Start development server
- `bun build`: Build for production
- `bun simulate`: Run battle simulations
- `bun preview`: Preview production build

### State Management
- **Valtio Store**: Use `gameStore` for global game state
- **Actions**: Implement state changes through `gameActions`
- **Snapshots**: Use `useSnapshot` hook for reactive components
- **Immutability**: Follow Valtio patterns for state updates

### Component Guidelines
- **Screen Components**: Main screens (Menu, CardSelection, BattleArena, Results)
- **Feature Components**: Organized in component folders by functionality
- **Reusable Components**: Create shared components in appropriate folders
- **Props Drilling**: Avoid deep prop drilling; use Valtio store for shared state

## Code Quality

### Performance
- **Bundle Size**: Monitor and optimize bundle size
- **Animations**: Use efficient animation libraries (Motion)
- **State Updates**: Minimize unnecessary re-renders with proper Valtio usage
- **Asset Optimization**: Optimize images and fonts in public folder

### Testing
- **Simulation**: Use simulator tools for battle testing
- **Type Safety**: Leverage TypeScript for compile-time error detection
- **Manual Testing**: Test all game flows and edge cases

### Documentation
- **Code Comments**: Document complex game logic and calculations
- **README**: Keep README updated with current features and setup
- **Type Definitions**: Use descriptive interface names and properties

## Asset Management

### Images
- **Organization**: Group images by category in `public/img/`
- **Formats**: Use appropriate formats (PNG for detailed art, SVG for icons)
- **Naming**: Use descriptive, lowercase names with hyphens

### Fonts
- **Custom Fonts**: Store font files and metadata in `public/fonts/`
- **Loading**: Implement efficient font loading strategies

## Security & Best Practices

### Environment
- **Environment Variables**: Use proper env file management
- **Build Configuration**: Maintain separate dev/prod configurations
- **Dependencies**: Keep dependencies updated and secure

### Code Organization
- **Separation of Concerns**: Keep game logic separate from UI components
- **Single Responsibility**: Each module should have a clear, single purpose
- **DRY Principle**: Avoid code duplication, create reusable utilities

## Git Workflow

### Commits
- **Conventional Commits**: Use clear, descriptive commit messages
- **Feature Branches**: Develop features in separate branches
- **Code Review**: Review changes before merging to main

### Branching
- **Main Branch**: Keep main branch stable and deployable
- **Feature Branches**: Use descriptive branch names (e.g., `feature/new-ability-system`)
- **Hotfixes**: Use hotfix branches for critical bug fixes

## Deployment

### Build Process
- **Production Build**: Use `bun build` for optimized production builds
- **Asset Optimization**: Ensure all assets are optimized for production
- **Environment Configuration**: Set appropriate environment variables

### Monitoring
- **Performance**: Monitor game performance and loading times
- **Error Tracking**: Implement error tracking for production issues
- **User Feedback**: Collect and analyze user feedback for improvements

These rules ensure consistent development practices, maintainable code, and a high-quality gaming experience for SoulBeast players.

use css`` instead of style={{}} to add custom styling for react element. we use tailwind v4. use motion from "motion/react" for animation