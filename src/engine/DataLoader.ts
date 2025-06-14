import { Character, CharacterAbilities, Ability } from '../types';
import cardsData from '../../public/cards.json';
import abilitiesData from '../../public/abilities.json';

export class DataLoader {
  private static charactersData: Character[] | null = null;
  private static abilitiesMap: Map<string, CharacterAbilities> | null = null;

  static async loadData(): Promise<void> {
    // In a real app, this would load from API
    // For now, just initialize the static data
    this.charactersData = cardsData.characters;
    this.abilitiesMap = this.loadCharacterAbilities();
  }

  static loadCharacters(): Character[] {
    return cardsData.characters;
  }

  static getAllCharacterNames(): string[] {
    return cardsData.characters.map(char => char.name);
  }

  static loadCharacterAbilities(): Map<string, CharacterAbilities> {
    if (this.abilitiesMap) {
      return this.abilitiesMap;
    }

    const abilitiesMap = new Map<string, CharacterAbilities>();
    
    Object.values(abilitiesData.abilities).forEach((charData: any) => {
      // Add cast times based on ability type
      const abilities: Ability[] = charData.abilities.map((ability: any) => ({
        ...ability,
        castTime: this.getCastTimeForAbility(ability.type)
      }));

      abilitiesMap.set(charData.name, {
        name: charData.name,
        title: charData.title,
        composition: charData.composition,
        abilities
      });
    });

    this.abilitiesMap = abilitiesMap;
    return abilitiesMap;
  }

  static getCharacterAbilities(characterName: string): CharacterAbilities | undefined {
    const abilitiesMap = this.loadCharacterAbilities();
    return abilitiesMap.get(characterName);
  }

  private static getCastTimeForAbility(type: string): number {
    switch (type) {
      case 'quick':
        return 0.5;
      case 'power':
        return 1.5;
      case 'ultimate':
        return 3.0;
      default:
        return 1.0;
    }
  }
}
