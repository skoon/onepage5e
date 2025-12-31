export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHR';

export enum Archetype {
  FIGHTER = 'Fighter',
  RANGER = 'Ranger',
  WIZARD = 'Wizard'
}

export interface Weapon {
  name: string;
  damage: string;
  cost: number;
}

export interface Armor {
  name: string;
  acFormula: (dex: number, wis: number) => number; // Returns AC
  dexPenalty: number;
  cost: number;
  description: string;
}

export interface Spell {
  id: number;
  name: string;
  range: string;
  effect: string;
}

export interface Character {
  name: string;
  archetype: Archetype | null;
  level: number;
  xp: number; // Not strictly in One Page 5e, but good for tracking
  
  // Stats
  abilities: Record<Ability, number>;
  maxHp: number;
  currentHp: number;
  gold: number;
  
  // Equipment
  weapons: Weapon[];
  armor: Armor | null;
  items: string[];
  
  // Spells
  knownSpells: Spell[];

  // Meta
  portraitUrl?: string;
  age?: string;
  gender?: string;
  pronouns?: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
}

export type Screen = 'HOME' | 'CREATE' | 'SHEET' | 'ADVENTURE';