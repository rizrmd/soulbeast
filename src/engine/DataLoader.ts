import { SoulBeastName, SoulBeastUI } from "../types";
import { AllSoulBeast } from "./SoulBeast";

export const DataLoader = {
  getSoulBeast: (cardName: SoulBeastName) => {
    const card = AllSoulBeast[cardName] ? { ...AllSoulBeast[cardName] } : null;

    const imageName = cardName.toLowerCase().replace(/ /g, "-");
    if (card) {
      (card as any).image = `/img/cards/${imageName}.webp`;
      return card as SoulBeastUI;
    }
    return null;
  },
  getAllSoulBeasts: () => {
    return Object.entries(AllSoulBeast).map(([name, card]) => {
      const imageName = name.toLowerCase().replace(/ /g, "-");
      (card as any).image = `/img/cards/${imageName}.webp`;
      return card as SoulBeastUI;
    });
  },
};
