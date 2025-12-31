import { Ability, Archetype, Armor, Spell, Weapon, Character } from './types';

export const ABILITIES: Ability[] = ['STR', 'DEX', 'CON', 'CHR', 'WIS', 'INT']; // Order matches PDF visual roughly

export const ABILITY_NAMES: Record<Ability, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  CHR: 'Charisma',
  WIS: 'Wisdom',
  INT: 'Intelligence'
};

export const getModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export const ARCHETYPE_INFO = {
  [Archetype.FIGHTER]: {
    label: 'Dwarf Fighter',
    bonuses: 'Score Increase: +2 Str or Con. Proficiency: Str & Dex.',
    hitDie: 12,
    speed: '25ft',
    description: 'Resilient warriors of the mountains.',
    imgUrl: 'https://picsum.photos/seed/dwarf/200/200'
  },
  [Archetype.RANGER]: {
    label: 'Elf Ranger',
    bonuses: 'Score Increase: +2 Dex or Chr. Proficiency: Dex & Wis.',
    hitDie: 10,
    speed: '35ft',
    description: 'Swift guardians of the forests.',
    imgUrl: 'https://picsum.photos/seed/elf/200/200'
  },
  [Archetype.WIZARD]: {
    label: 'Human Wizard',
    bonuses: 'Score Increase: +2 to any 2. Proficiency: Int & Wis.',
    hitDie: 10,
    speed: '30ft',
    description: 'Versatile masters of the arcane.',
    imgUrl: 'https://picsum.photos/seed/wizard/200/200'
  }
};

export const WEAPONS: Weapon[] = [
  { name: 'Wand', damage: '1d4', cost: 3 },
  { name: 'Sling', damage: '1d4', cost: 2 },
  { name: 'Dagger', damage: '1d4', cost: 2 },
  { name: 'Staff', damage: '1d6', cost: 10 },
  { name: 'Mace', damage: '1d6', cost: 5 },
  { name: 'Axe', damage: '1d8', cost: 10 },
  { name: 'Hammer', damage: '1d8', cost: 25 },
  { name: 'Bow', damage: '1d8', cost: 50 },
  { name: 'Crossbow', damage: '1d10', cost: 75 },
  { name: 'Sword', damage: '2d6', cost: 50 },
];

export const ARMOR: Armor[] = [
  { 
    name: 'No Armor', 
    acFormula: (_dex, _wis) => 10, // Base
    dexPenalty: 0, 
    cost: 0,
    description: 'Just your clothes'
  },
  { 
    name: 'Moon Cloak', 
    acFormula: (_dex, wis) => 11 + wis, 
    dexPenalty: 0, 
    cost: 10,
    description: '11 + Wis Mod'
  },
  { 
    name: 'Burlap Tunic', 
    acFormula: (dex, _wis) => 11 + dex, 
    dexPenalty: 0, 
    cost: 25,
    description: '11 + Dex Mod'
  },
  { 
    name: 'Leather Armor', 
    acFormula: (dex, _wis) => 12 + dex, 
    dexPenalty: 0, 
    cost: 50,
    description: '12 + Dex Mod'
  },
  { 
    name: 'Chainmail Armor', 
    acFormula: (_dex, _wis) => 14, 
    dexPenalty: -1, 
    cost: 75,
    description: 'AC 14, -1 Dex Penalty'
  },
  { 
    name: 'Platemail Armor', 
    acFormula: (_dex, _wis) => 15, 
    dexPenalty: -2, 
    cost: 50,
    description: 'AC 15, -2 Dex Penalty' // Note: PDF says 50G which is cheaper than Chainmail? Assuming PDF is truth.
  },
];

export const WIZARD_SPELLS: Spell[] = [
  { id: 1, name: 'Acid Orb', range: '60 Feet', effect: '1d4 DMG per Lvl' },
  { id: 2, name: 'Necrotic Chill', range: 'Touch', effect: '1d6 DMG per Lvl' },
  { id: 3, name: 'Flame Bolt', range: '120 Feet', effect: '1d8 DMG per Lvl' },
  { id: 4, name: 'Light as Air', range: 'Touch', effect: 'Float 5ft in air per Lvl' },
  { id: 5, name: 'Create Light', range: 'Touch', effect: 'Illuminate 10ft per Lvl' },
  { id: 6, name: 'Ease Pain', range: 'Touch', effect: 'Heal 1d4 HP per Lvl' },
];

export const getProficiencyBonus = (level: number): number => {
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
};

export const INITIAL_CHARACTER: Character = {
  name: '',
  archetype: null,
  level: 1,
  xp: 0,
  abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHR: 10 },
  maxHp: 10,
  currentHp: 10,
  gold: 0,
  weapons: [],
  armor: ARMOR[0], // No Armor
  items: [],
  knownSpells: []
};

export interface MonsterData {
  name: string;
  attack: string;
  ac: number;
  hp: number;
}

export const EXAMPLE_MONSTERS: MonsterData[] = [
  { name: 'Goblin', attack: 'Dagger +2/1d4', ac: 15, hp: 7 },
  { name: 'Skeleton', attack: 'Sword +4/1d6', ac: 13, hp: 13 },
  { name: 'Zombie', attack: 'Necro Bite +3/1d6+1', ac: 8, hp: 22 },
  { name: 'Vampire Bat', attack: 'Drain +4/2d4', ac: 12, hp: 22 },
  { name: 'Dire Wolf', attack: 'Bite +5/2d6', ac: 14, hp: 37 },
  { name: 'Little Dragon', attack: 'Fire Blast +4/3d6', ac: 17, hp: 38 },
];

export const RANDOM_EVENTS = [
  { id: 1, event: 'Sudden Storm', effect: 'Visibility reduced, ranged attacks disadvantage' },
  { id: 2, event: 'Ambush', effect: 'Enemies get surprise round' },
  { id: 3, event: 'Trap Triggered', effect: 'Dex save or take damage' },
  { id: 4, event: 'Mysterious Stranger', effect: 'Offers aid or trade' },
  { id: 5, event: 'Cave In / Obstacle', effect: 'Path blocked, must find detour' },
  { id: 6, event: 'Magical Anomaly', effect: 'Wild magic surge or gravity shift' },
  { id: 7, event: 'Monster Attack', effect: '2d4 random monsters appear' },
];