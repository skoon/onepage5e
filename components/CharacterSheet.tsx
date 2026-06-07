import React from 'react';
import { Character, Ability } from '../types';
import { ABILITIES, getModifier, getProficiencyBonus, ARCHETYPE_INFO } from '../constants';

interface CharacterSheetProps {
  character: Character;
  onHpChange?: (newHp: number) => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, onHpChange }) => {
  const dexMod = getModifier(character.abilities.DEX);
  const wisMod = getModifier(character.abilities.WIS);
  
  // Calculate AC
  const ac = character.armor ? character.armor.acFormula(dexMod, wisMod) : 10 + dexMod; // Fallback if no armor selected

  const profBonus = getProficiencyBonus(character.level);
  
  // Determine image source
  const portraitSrc = character.portraitUrl || (character.archetype ? ARCHETYPE_INFO[character.archetype].imgUrl : null);

  return (
    <div className="bg-[#fdf6e3] p-4 rounded-lg shadow-lg border-4 border-double border-amber-900 max-w-md mx-auto relative">
      <div className="absolute top-0 left-0 w-full text-center -mt-3">
         <span className="bg-[#fdf6e3] px-4 text-amber-900 font-display font-bold text-xl">One Page 5e</span>
      </div>

      {/* Header */}
      <div className="flex gap-4 mt-4 mb-6">
         <div className="w-24 h-24 border-2 border-amber-900 bg-gray-200 rounded-sm overflow-hidden flex-shrink-0">
            {portraitSrc ? (
               <img src={portraitSrc} alt="Portrait" className="w-full h-full object-cover" />
            ) : (
               <div className="flex items-center justify-center h-full text-xs text-gray-500">Portrait</div>
            )}
         </div>
         <div className="flex-1 space-y-2">
            <div className="border-b-2 border-amber-900 pb-1 flex justify-between">
               <span className="font-bold text-amber-900 text-xs uppercase">Name:</span>
               <span className="font-display font-bold text-lg">{character.name}</span>
            </div>
            <div className="border-b-2 border-amber-900 pb-1 flex justify-between">
               <span className="font-bold text-amber-900 text-xs uppercase">Archetype:</span>
               <span>{character.archetype}</span>
            </div>
            <div className="flex gap-2">
              <div className="border-b-2 border-amber-900 pb-1 flex-1 flex justify-between">
                 <span className="font-bold text-amber-900 text-xs uppercase">Level:</span>
                 <span>{character.level}</span>
              </div>
              <div className="border-b-2 border-amber-900 pb-1 flex-1 flex justify-between">
                 <span className="font-bold text-amber-900 text-xs uppercase">XP:</span>
                 <span>{character.xp}</span>
              </div>
            </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
         {/* Abilities */}
         <div className="grid grid-cols-3 gap-2">
            {ABILITIES.map(a => {
               const mod = getModifier(character.abilities[a]);
               return (
                  <div key={a} className="flex flex-col items-center">
                     <span className="font-display font-bold text-amber-900 text-sm mb-1">{a}</span>
                     <div className="w-10 h-12 border-2 border-amber-900 rounded-b-lg flex flex-col items-center justify-center bg-white relative">
                        <span className="text-xs text-gray-400 absolute top-0">{character.abilities[a]}</span>
                        <span className="font-bold text-lg leading-none mt-2">{mod >= 0 ? '+' : ''}{mod}</span>
                     </div>
                  </div>
               )
            })}
         </div>

         {/* Combat Stats */}
         <div className="space-y-2">
            <div className="flex gap-2 justify-center">
               <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-amber-900 uppercase">AC</span>
                  <div className="w-12 h-14 border-2 border-amber-900 rounded-b-full flex items-center justify-center font-bold text-xl bg-white">
                     {ac}
                  </div>
               </div>
               <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-amber-900 uppercase">Prof</span>
                  <div className="w-12 h-14 border-2 border-amber-900 rounded-full flex items-center justify-center font-bold text-xl bg-white">
                     +{profBonus}
                  </div>
               </div>
            </div>
            <div className="flex flex-col items-center w-full">
               <span className="text-xs font-bold text-amber-900 uppercase">HP</span>
               <div className="relative w-full flex flex-col items-center justify-center">
                  <div className="relative">
                     <svg viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-red-800 fill-white">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                     </svg>
                     <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-xl text-red-900">
                        {character.currentHp}/{character.maxHp}
                     </span>
                  </div>
                  {onHpChange && (
                     <div className="flex gap-2 mt-1">
                        <button 
                            onClick={() => onHpChange(character.currentHp - 1)}
                            className="w-6 h-6 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-900 rounded-full text-xs font-bold border border-red-300 shadow-sm"
                        >
                           -
                        </button>
                        <button 
                            onClick={() => onHpChange(character.currentHp + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-900 rounded-full text-xs font-bold border border-green-300 shadow-sm"
                        >
                           +
                        </button>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Equipment & Spells */}
      <div className="space-y-4">
         <div className="border-2 border-amber-900 rounded p-2 bg-white min-h-[80px]">
            <h4 className="font-bold text-amber-900 text-xs border-b border-amber-200 mb-1 uppercase">Weapons & Attacks</h4>
            {character.weapons.length === 0 && <div className="text-gray-400 text-xs italic">Unarmed</div>}
            {character.weapons.map((w, i) => (
               <div key={i} className="flex justify-between text-sm">
                  <span className="font-bold">{w.name}</span>
                  <span className="font-mono">{w.damage}</span>
               </div>
            ))}
         </div>

         {character.armor && (
            <div className="border-2 border-amber-900 rounded p-1 bg-white flex justify-between px-2 items-center">
               <span className="font-bold text-amber-900 text-xs uppercase">Armor:</span>
               <span className="text-sm">{character.armor.name}</span>
            </div>
         )}

         {character.knownSpells.length > 0 && (
            <div className="border-2 border-amber-900 rounded p-2 bg-white min-h-[80px]">
               <h4 className="font-bold text-amber-900 text-xs border-b border-amber-200 mb-1 uppercase">Spells</h4>
               <div className="space-y-1">
                  {character.knownSpells.map(s => (
                     <div key={s.id} className="text-xs">
                        <span className="font-bold">{s.name}:</span> {s.effect}
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>

      <div className="mt-4 text-center text-xs text-amber-800/60 font-serif italic">
         Inventory: {character.gold} Gold Pieces
      </div>
    </div>
  );
};

export default CharacterSheet;