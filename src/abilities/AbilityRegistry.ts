import { AbilityRegistry } from "./types";

// Keth Stalker abilities
import { 
  NightmareFrost, 
  CrystalPrison, 
  AbyssalTide, 
  NightmareHunt,
  DemonicHaste,
  IceShard,
  GlacialArmor,
  FrozenWake,
  Permafrost,
  Shatter
} from "./cards/KethStalker";

// Crimson Vorthak abilities
import { 
  FlameSlash, 
  DemonicRoar, 
  InfernalExecution, 
  RoseOfDestruction,
  CrimsonClaws,
  InfernalShield,
  BlazingCharge,
  MoltenArmor,
  FireStorm,
  BurningBlood,
  Cauterize,
  RagingBeast,
  ScentOfBlood,
  FireWall,
  RecklessCharge,
  DemonForm
} from "./cards/CrimsonVorthak";

// Bone Thurak abilities
import { 
  StoneShard, 
  MoltenBoulder, 
  BoneArmor, 
  AncientEruption,
  Earthquake,
  BoneSpikes,
  MagmaFlow,
  StoneWall,
  VolcanicRage,
  MagmaSpit,
  PrimalRoar,
  Unearth,
  Fossilize,
  PetrifyingGaze,
  DemonicCore
} from "./cards/BoneThurak";

// Shrom Xelar abilities
import { 
  SporeBurst, 
  MyceliumNetwork, 
  SoulAbsorb, 
  FungalNightmare,
  ToxicAura,
  RapidGrowth,
  HallucinogenicHaze,
  ParasiticSpore,
  Symbiosis,
  Decompose
} from "./cards/ShromXelar";

// Void Ghorth abilities
import {
  SavageSplash,
  DimensionalBite,
  TerrorHowl,
  VoidTsunami,
  VoidClaws,
  DimensionalShield,
  AbyssalRegeneration,
  VoidPortal,
  RealityTear,
  DimensionalStorm,
  PhaseShift,
  AquaJet,
  RegenerativeTorpor,
  UnstableRift,
  BeastOfTheDepths,
  Drown,
} from "./cards/VoidGhorth";

// Deep Zephyros abilities
import {
  MindLash,
  BestialSurge,
  AbyssalDrain,
  MindBreak,
  PsychicBlast,
  MentalFortress,
  TidalWave,
  OceanicFury,
  DeepCurrent,
  AbyssalDepths,
  PsychicBarrier,
  TidalSlash,
  DemonsGuile,
  MentalFog,
  CalamityHowl,
  MindReader,
} from "./cards/DeepZephyros";

// Astrix abilities
import {
  VoidWind,
  DivinePunishment,
  StellarDash,
  ParadoxStorm,
  CelestialBeam,
  VoidShield,
  CosmicSurge,
  DimensionalRift,
  AstralProjection,
  Starfall,
  Singularity,
  CosmicBalance,
  VoidJaunt,
  ZephyrsBlessing,
  GravityWell,
  EntropicTouch,
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
  "Demonic Haste": new DemonicHaste(),
  "Ice Shard": new IceShard(),
  "Glacial Armor": new GlacialArmor(),
  "Frozen Wake": new FrozenWake(),
  "Permafrost": new Permafrost(),
  "Shatter": new Shatter(),

  // Crimson Vorthak
  "Flame Slash": new FlameSlash(),
  "Demonic Roar": new DemonicRoar(),
  "Infernal Execution": new InfernalExecution(),
  "Rose of Destruction": new RoseOfDestruction(),
  "Crimson Claws": new CrimsonClaws(),
  "Infernal Shield": new InfernalShield(),
  "Blazing Charge": new BlazingCharge(),
  "Molten Armor": new MoltenArmor(),
  "Fire Storm": new FireStorm(),
  "Burning Blood": new BurningBlood(),
  "Cauterize": new Cauterize(),
  "Raging Beast": new RagingBeast(),
  "Scent of Blood": new ScentOfBlood(),
  "Fire Wall": new FireWall(),
  "Reckless Charge": new RecklessCharge(),
  "Demon Form": new DemonForm(),

  // Bone Thurak
  "Stone Shard": new StoneShard(),
  "Molten Boulder": new MoltenBoulder(),
  "Bone Armor": new BoneArmor(),
  "Ancient Eruption": new AncientEruption(),
  "Earthquake": new Earthquake(),
  "Bone Spikes": new BoneSpikes(),
  "Magma Flow": new MagmaFlow(),
  "Stone Wall": new StoneWall(),
  "Volcanic Rage": new VolcanicRage(),
  "Magma Spit": new MagmaSpit(),
  "Primal Roar": new PrimalRoar(),
  "Unearth": new Unearth(),
  "Fossilize": new Fossilize(),
  "Petrifying Gaze": new PetrifyingGaze(),
  "Demonic Core": new DemonicCore(),

  // Shrom Xelar
  "Spore Burst": new SporeBurst(),
  "Mycelium Network": new MyceliumNetwork(),
  "Soul Absorb": new SoulAbsorb(),
  "Fungal Nightmare": new FungalNightmare(),
  "Toxic Aura": new ToxicAura(),
  "Rapid Growth": new RapidGrowth(),
  "Hallucinogenic Haze": new HallucinogenicHaze(),
  "Parasitic Spore": new ParasiticSpore(),
  "Symbiosis": new Symbiosis(),
  "Decompose": new Decompose(),

  // Void Ghorth
  "Savage Splash": new SavageSplash(),
  "Dimensional Bite": new DimensionalBite(),
  "Terror Howl": new TerrorHowl(),
  "Void Tsunami": new VoidTsunami(),
  "Void Claws": new VoidClaws(),
  "Dimensional Shield": new DimensionalShield(),
  "Abyssal Regeneration": new AbyssalRegeneration(),
  "Void Portal": new VoidPortal(),
  "Reality Tear": new RealityTear(),
  "Dimensional Storm": new DimensionalStorm(),
  "Phase Shift": new PhaseShift(),
  "Aqua Jet": new AquaJet(),
  "Regenerative Torpor": new RegenerativeTorpor(),
  "Unstable Rift": new UnstableRift(),
  "Beast of the Depths": new BeastOfTheDepths(),
  "Drown": new Drown(),

  // Deep Zephyros
  "Mind Lash": new MindLash(),
  "Bestial Surge": new BestialSurge(),
  "Abyssal Drain": new AbyssalDrain(),
  "Mind Break": new MindBreak(),
  "Psychic Blast": new PsychicBlast(),
  "Mental Fortress": new MentalFortress(),
  "Tidal Wave": new TidalWave(),
  "Oceanic Fury": new OceanicFury(),
  "Deep Current": new DeepCurrent(),
  "Abyssal Depths": new AbyssalDepths(),
  "Psychic Barrier": new PsychicBarrier(),
  "Tidal Slash": new TidalSlash(),
  "Demon's Guile": new DemonsGuile(),
  "Mental Fog": new MentalFog(),
  "Calamity Howl": new CalamityHowl(),
  "Mind Reader": new MindReader(),

  // Astrix
  "Void Wind": new VoidWind(),
  "Divine Punishment": new DivinePunishment(),
  "Stellar Dash": new StellarDash(),
  "Paradox Storm": new ParadoxStorm(),
  "Celestial Beam": new CelestialBeam(),
  "Void Shield": new VoidShield(),
  "Cosmic Surge": new CosmicSurge(),
  "Dimensional Rift": new DimensionalRift(),
  "Astral Projection": new AstralProjection(),
  "Starfall": new Starfall(),
  "Singularity": new Singularity(),
  "Cosmic Balance": new CosmicBalance(),
  "Void Jaunt": new VoidJaunt(),
  "Zephyr's Blessing": new ZephyrsBlessing(),
  "Gravity Well": new GravityWell(),
  "Entropic Touch": new EntropicTouch(),

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
