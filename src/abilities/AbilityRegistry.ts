import { AbilityRegistry } from "./types";

// Keth Stalker abilities
import { 
  NightmareFrost, 
  CrystalPrison, 
  AbyssalTide, 
  NightmareHunt 
} from "./cards/KethStalker";

// Crimson Vorthak abilities
import { 
  FlameSlash, 
  DemonicRoar, 
  InfernalExecution, 
  RoseOfDestruction 
} from "./cards/CrimsonVorthak";

// Bone Thurak abilities
import { 
  StoneShard, 
  MoltenBoulder, 
  BoneArmor, 
  AncientEruption 
} from "./cards/BoneThurak";

// Shrom Xelar abilities
import { 
  SporeBurst, 
  MyceliumNetwork, 
  SoulAbsorb, 
  FungalNightmare 
} from "./cards/ShromXelar";

// Void Ghorth abilities
import { 
  SavageSplash, 
  DimensionalBite, 
  TerrorHowl, 
  VoidTsunami 
} from "./cards/VoidGhorth";

// Deep Zephyros abilities
import { 
  MindLash, 
  BestialSurge, 
  AbyssalDrain, 
  MindBreak 
} from "./cards/DeepZephyros";

// Astrix abilities
import { 
  VoidWind, 
  DivinePunishment, 
  StellarDash, 
  ParadoxStorm 
} from "./cards/Astrix";

// Ember Pyrrak abilities
import { 
  FlameBurst, 
  MoltenClaw, 
  DawnsEmbrace, 
  SolarApocalypse 
} from "./cards/EmberPyrrak";

// Seraph Valdris abilities
import { 
  HolyBolt, 
  WindOfJudgment, 
  NaturesSanctuary, 
  FinalJudgment 
} from "./cards/SeraphValdris";

// Morthen abilities
import { 
  FrostBite, 
  SilentStrike, 
  PredatorsFocus, 
  AbsoluteZero 
} from "./cards/Morthen";

// Stellar Nexath abilities
import { 
  Starlight, 
  CosmicWinds, 
  LifeWeb, 
  GalaxyDance 
} from "./cards/StellarNexath";

// Moltak abilities
import { 
  SteelStrike, 
  ForgeStrike, 
  DemonSteel, 
  MoltenTitan 
} from "./cards/Moltak";

// Hexis abilities
import { 
  ChaosShard, 
  DivineCorruption, 
  GeometricPrison, 
  ChaosSingularity 
} from "./cards/Hexis";

// Crystal Nerith abilities
import { 
  PetalStream, 
  DreamShield, 
  NaturesEmbrace, 
  SakuraStorm 
} from "./cards/CrystalNerith";

// Velana abilities
import { 
  ThornWhip, 
  WindSeed, 
  FeralInstinct, 
  MidnightBloom 
} from "./cards/Velana";

// Crimson Thyra abilities
import { 
  SoulFlame, 
  ButterflySwarm, 
  ReapersWind, 
  SoulHarvest 
} from "./cards/CrimsonThyra";

export const abilityRegistry: AbilityRegistry = {
  // Keth Stalker
  "Nightmare Frost": new NightmareFrost(),
  "Crystal Prison": new CrystalPrison(),
  "Abyssal Tide": new AbyssalTide(),
  "Nightmare Hunt": new NightmareHunt(),

  // Crimson Vorthak
  "Flame Slash": new FlameSlash(),
  "Demonic Roar": new DemonicRoar(),
  "Infernal Execution": new InfernalExecution(),
  "Rose of Destruction": new RoseOfDestruction(),

  // Bone Thurak
  "Stone Shard": new StoneShard(),
  "Molten Boulder": new MoltenBoulder(),
  "Bone Armor": new BoneArmor(),
  "Ancient Eruption": new AncientEruption(),

  // Shrom Xelar
  "Spore Burst": new SporeBurst(),
  "Mycelium Network": new MyceliumNetwork(),
  "Soul Absorb": new SoulAbsorb(),
  "Fungal Nightmare": new FungalNightmare(),

  // Void Ghorth
  "Savage Splash": new SavageSplash(),
  "Dimensional Bite": new DimensionalBite(),
  "Terror Howl": new TerrorHowl(),
  "Void Tsunami": new VoidTsunami(),

  // Deep Zephyros
  "Mind Lash": new MindLash(),
  "Bestial Surge": new BestialSurge(),
  "Abyssal Drain": new AbyssalDrain(),
  "Mind Break": new MindBreak(),

  // Astrix
  "Void Wind": new VoidWind(),
  "Divine Punishment": new DivinePunishment(),
  "Stellar Dash": new StellarDash(),
  "Paradox Storm": new ParadoxStorm(),

  // Ember Pyrrak
  "Flame Burst": new FlameBurst(),
  "Molten Claw": new MoltenClaw(),
  "Dawn's Embrace": new DawnsEmbrace(),
  "Solar Apocalypse": new SolarApocalypse(),

  // Seraph Valdris
  "Holy Bolt": new HolyBolt(),
  "Wind of Judgment": new WindOfJudgment(),
  "Nature's Sanctuary": new NaturesSanctuary(),
  "Final Judgment": new FinalJudgment(),

  // Morthen
  "Frost Bite": new FrostBite(),
  "Silent Strike": new SilentStrike(),
  "Predator's Focus": new PredatorsFocus(),
  "Absolute Zero": new AbsoluteZero(),

  // Stellar Nexath
  "Starlight": new Starlight(),
  "Cosmic Winds": new CosmicWinds(),
  "Life Web": new LifeWeb(),
  "Galaxy Dance": new GalaxyDance(),

  // Moltak
  "Steel Strike": new SteelStrike(),
  "Forge Strike": new ForgeStrike(),
  "Demon Steel": new DemonSteel(),
  "Molten Titan": new MoltenTitan(),

  // Hexis
  "Chaos Shard": new ChaosShard(),
  "Divine Corruption": new DivineCorruption(),
  "Geometric Prison": new GeometricPrison(),
  "Chaos Singularity": new ChaosSingularity(),

  // Crystal Nerith
  "Petal Stream": new PetalStream(),
  "Dream Shield": new DreamShield(),
  "Nature's Embrace": new NaturesEmbrace(),
  "Sakura Storm": new SakuraStorm(),

  // Velana
  "Thorn Whip": new ThornWhip(),
  "Wind Seed": new WindSeed(),
  "Feral Instinct": new FeralInstinct(),
  "Midnight Bloom": new MidnightBloom(),

  // Crimson Thyra
  "Soul Flame": new SoulFlame(),
  "Butterfly Swarm": new ButterflySwarm(),
  "Reaper's Wind": new ReapersWind(),
  "Soul Harvest": new SoulHarvest(),
};
