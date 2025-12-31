import React, { useState, useEffect } from 'react';
import { Character, Ability, Archetype, Weapon } from '../types';
import { ABILITIES, ABILITY_NAMES, ARCHETYPE_INFO, WEAPONS, ARMOR, WIZARD_SPELLS, getModifier, INITIAL_CHARACTER } from '../constants';
import { generateCharacterPortrait } from '../services/geminiService';

interface CharacterCreatorProps {
  onComplete: (char: Character) => void;
  onCancel: () => void;
}

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [character, setCharacter] = useState<Character>({ ...INITIAL_CHARACTER });
  const [rolledScores, setRolledScores] = useState<number[]>([]);
  const [assignments, setAssignments] = useState<Record<Ability, number | null>>({
    STR: null, DEX: null, CON: null, INT: null, WIS: null, CHR: null
  });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Step 1: Ability Scores
  const rollStats = () => {
    const rolls = [];
    for (let i = 0; i < 6; i++) {
      // Roll 4d6 drop lowest
      const d6s = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      d6s.sort((a, b) => a - b);
      const sum = d6s.slice(1).reduce((a, b) => a + b, 0);
      rolls.push(sum);
    }
    setRolledScores(rolls);
    setAssignments({ STR: null, DEX: null, CON: null, INT: null, WIS: null, CHR: null });
  };

  const assignScore = (ability: Ability, scoreIndex: number) => {
    const score = rolledScores[scoreIndex];
    
    // If this score is already assigned to another ability, unassign it
    const currentAbility = Object.entries(assignments).find(([_, idx]) => idx === scoreIndex)?.[0] as Ability | undefined;
    if (currentAbility) {
       setAssignments(prev => ({ ...prev, [currentAbility]: null }));
    }

    setAssignments(prev => ({ ...prev, [ability]: scoreIndex }));
  };

  const areAllAssigned = () => ABILITIES.every(a => assignments[a] !== null);

  const applyStats = () => {
    const newAbilities = { ...character.abilities };
    ABILITIES.forEach(a => {
      const idx = assignments[a];
      if (idx !== null) {
        newAbilities[a] = rolledScores[idx];
      }
    });
    // Starting gold: d100
    const gold = Math.floor(Math.random() * 100) + 1;
    setCharacter({ ...character, abilities: newAbilities, gold });
    setStep(2);
  };

  // Step 2: Archetype
  const selectArchetype = (arch: Archetype) => {
    const info = ARCHETYPE_INFO[arch];
    let newAbilities = { ...character.abilities };
    
    // Apply bonuses
    if (arch === Archetype.FIGHTER) {
      // Simple logic: boost highest of Str/Con for MVP, user can edit manually later if we added edit
      // For now, auto-apply to the higher one or default Str
      if (newAbilities.STR >= newAbilities.CON) newAbilities.STR += 2;
      else newAbilities.CON += 2;
    } else if (arch === Archetype.RANGER) {
      if (newAbilities.DEX >= newAbilities.CHR) newAbilities.DEX += 2;
      else newAbilities.CHR += 2;
    } else if (arch === Archetype.WIZARD) {
      // +2 to any 2. Let's buff Int and Wis for simplicity in auto-gen
      newAbilities.INT += 2;
      newAbilities.WIS += 2;
    }

    const hp = info.hitDie; // Max at lvl 1

    let spells = character.knownSpells;
    if (arch === Archetype.WIZARD) {
      // Pick 2 random spells
      const shuffled = [...WIZARD_SPELLS].sort(() => 0.5 - Math.random());
      spells = shuffled.slice(0, 2);
    }

    setCharacter({ 
      ...character, 
      archetype: arch, 
      abilities: newAbilities,
      maxHp: hp,
      currentHp: hp,
      knownSpells: spells
    });
    setStep(3);
  };

  // Step 3: Equipment & Details
  const toggleWeapon = (w: Weapon) => {
    const has = character.weapons.find(cw => cw.name === w.name);
    if (has) {
      setCharacter({ ...character, weapons: character.weapons.filter(cw => cw.name !== w.name), gold: character.gold + w.cost });
    } else {
      if (character.gold >= w.cost) {
        setCharacter({ ...character, weapons: [...character.weapons, w], gold: character.gold - w.cost });
      }
    }
  };

  const handleGeneratePortrait = async () => {
    if (!character.archetype) return;
    setIsGeneratingImage(true);
    const archInfo = ARCHETYPE_INFO[character.archetype];
    const prompt = `A high quality fantasy portrait of a ${archInfo.label} named ${character.name || 'Hero'}. ${archInfo.description} ${character.gender ? character.gender : ''} ${character.age ? character.age + ' years old' : ''}. Digital art style, character concept art, close up, detailed face, rpg character sheet portrait.`;
    
    const imageUrl = await generateCharacterPortrait(prompt);
    if (imageUrl) {
        setCharacter(prev => ({ ...prev, portraitUrl: imageUrl }));
    }
    setIsGeneratingImage(false);
  };

  const finishCreation = () => {
    if (!character.name) return;
    onComplete(character);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-lg border-2 border-amber-900/20 my-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-3xl font-display font-bold text-amber-900">Create Hero</h2>
        <div className="text-amber-700">Step {step} of 3</div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <button 
              onClick={rollStats} 
              className="bg-amber-800 text-white px-6 py-2 rounded hover:bg-amber-700 font-display font-bold text-lg"
            >
              {rolledScores.length ? 'Re-roll Stats' : 'Roll Stats (4d6 drop lowest)'}
            </button>
          </div>

          {rolledScores.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-amber-50 p-4 rounded border border-amber-200">
                <h3 className="font-bold mb-3 text-amber-900">Rolled Scores</h3>
                <div className="flex flex-wrap gap-2">
                  {rolledScores.map((score, idx) => {
                     const isAssigned = Object.values(assignments).includes(idx);
                     return (
                      <div 
                        key={idx} 
                        className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg border-2 
                          ${isAssigned ? 'bg-gray-200 text-gray-400 border-gray-300' : 'bg-white text-amber-900 border-amber-500 shadow-sm'}`}
                      >
                        {score}
                      </div>
                     );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold mb-3 text-amber-900">Assign to Abilities</h3>
                {ABILITIES.map(ability => (
                  <div key={ability} className="flex items-center justify-between bg-amber-50 p-2 rounded">
                    <span className="font-bold w-32">{ABILITY_NAMES[ability]}</span>
                    <select 
                      className="p-1 border rounded w-full ml-4"
                      value={assignments[ability] === null ? '' : assignments[ability]!}
                      onChange={(e) => assignScore(ability, parseInt(e.target.value))}
                    >
                      <option value="">Select Score...</option>
                      {rolledScores.map((score, idx) => {
                         const assignedToOther = Object.entries(assignments).find(([k, v]) => v === idx && k !== ability);
                         if (assignedToOther) return null; // Don't show if taken by other
                         return <option key={idx} value={idx}>{score}</option>
                      })}
                      {/* Allow re-selecting current value */}
                      {assignments[ability] !== null && <option value={assignments[ability]!}>{rolledScores[assignments[ability]!]}</option>}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
             <button 
               disabled={!areAllAssigned()}
               onClick={applyStats}
               className={`px-6 py-2 rounded font-bold ${areAllAssigned() ? 'bg-amber-700 text-white hover:bg-amber-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
             >
               Next: Choose Archetype
             </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
           <h3 className="text-xl font-display text-amber-900 text-center">Choose your path</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[Archetype.FIGHTER, Archetype.RANGER, Archetype.WIZARD].map((arch) => (
                <div 
                  key={arch}
                  onClick={() => selectArchetype(arch)}
                  className="cursor-pointer border-2 border-amber-200 rounded-lg overflow-hidden hover:border-amber-600 hover:shadow-lg transition-all group"
                >
                  <div className="h-40 bg-gray-200 overflow-hidden relative">
                    <img src={ARCHETYPE_INFO[arch].imgUrl} alt={arch} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-center font-display font-bold">
                      {ARCHETYPE_INFO[arch].label}
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 h-full">
                    <p className="text-sm text-amber-800 mb-2 italic">{ARCHETYPE_INFO[arch].description}</p>
                    <div className="text-xs text-amber-900 space-y-1">
                      <p><strong>Hit Die:</strong> d{ARCHETYPE_INFO[arch].hitDie}</p>
                      <p><strong>Speed:</strong> {ARCHETYPE_INFO[arch].speed}</p>
                      <p className="mt-2 border-t border-amber-200 pt-2">{ARCHETYPE_INFO[arch].bonuses}</p>
                    </div>
                  </div>
                </div>
              ))}
           </div>
           <div className="flex justify-start">
             <button onClick={() => setStep(1)} className="text-amber-700 underline">Back</button>
           </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-amber-900 font-bold mb-1">Character Name</label>
              <input 
                type="text" 
                value={character.name}
                onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                className="w-full p-2 border-2 border-amber-300 rounded focus:border-amber-600 outline-none font-display text-lg"
                placeholder="Enter name..."
              />
              
              <div className="mt-6">
                <h4 className="font-bold text-amber-900 border-b border-amber-200 mb-2">Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                   <input placeholder="Age" className="p-1 border rounded" onChange={e => setCharacter({...character, age: e.target.value})} />
                   <input placeholder="Gender" className="p-1 border rounded" onChange={e => setCharacter({...character, gender: e.target.value})} />
                   <input placeholder="Pronouns" className="p-1 border rounded" onChange={e => setCharacter({...character, pronouns: e.target.value})} />
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-100 rounded border border-amber-300">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-amber-900">Shop</h4>
                  <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold text-xs">Gold: {character.gold}G</span>
                </div>
                <div className="h-48 overflow-y-auto space-y-1 text-sm pr-2">
                  {WEAPONS.map(w => {
                    const has = character.weapons.some(cw => cw.name === w.name);
                    const canAfford = character.gold >= w.cost;
                    return (
                      <div key={w.name} className="flex justify-between items-center p-1 hover:bg-amber-200 rounded">
                        <span>{w.name} ({w.damage})</span>
                        <button 
                          onClick={() => toggleWeapon(w)}
                          disabled={!has && !canAfford}
                          className={`px-2 py-0.5 text-xs rounded ${has ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'} disabled:opacity-50`}
                        >
                          {has ? 'Sell' : `Buy ${w.cost}G`}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-amber-900 text-center font-display">Summary</h4>
              <div className="bg-white p-4 rounded shadow border border-amber-200">
                 {/* Portrait Preview & Generation */}
                 <div className="flex flex-col items-center mb-4">
                    <div className="w-32 h-32 border-2 border-amber-900 rounded overflow-hidden bg-gray-200 mb-2 relative">
                        {isGeneratingImage ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        ) : null}
                        <img 
                            src={character.portraitUrl || (character.archetype ? ARCHETYPE_INFO[character.archetype].imgUrl : '')} 
                            alt="Portrait" 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                    <button 
                        onClick={handleGeneratePortrait}
                        disabled={isGeneratingImage || !character.archetype}
                        className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded border border-amber-300 flex items-center gap-1 font-bold disabled:opacity-50 transition-colors"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                         </svg>
                        Generate AI Portrait
                    </button>
                 </div>

                 <div className="flex justify-between font-bold text-lg border-b pb-2 mb-2">
                    <span>{character.name || 'Unnamed'}</span>
                    <span>Lvl 1 {character.archetype}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                    {ABILITIES.map(a => (
                      <div key={a} className="bg-amber-50 p-1 rounded">
                        <div className="font-bold text-amber-800">{a}</div>
                        <div>{character.abilities[a]} ({getModifier(character.abilities[a]) >= 0 ? '+' : ''}{getModifier(character.abilities[a])})</div>
                      </div>
                    ))}
                 </div>
                 <div className="text-sm space-y-1">
                    <p><strong>HP:</strong> {character.maxHp}</p>
                    <p><strong>Weapons:</strong> {character.weapons.map(w => w.name).join(', ') || 'None'}</p>
                    {character.knownSpells.length > 0 && <p><strong>Spells:</strong> {character.knownSpells.map(s => s.name).join(', ')}</p>}
                 </div>
              </div>
              
              <div className="mt-4">
                 <h4 className="font-bold text-amber-900 mb-2">Armor</h4>
                 <select 
                   className="w-full p-2 border rounded"
                   onChange={(e) => {
                     const armor = ARMOR.find(a => a.name === e.target.value);
                     if (armor) {
                        setCharacter({ ...character, armor });
                     }
                   }}
                   value={character.armor?.name}
                 >
                   {ARMOR.map(a => <option key={a.name} value={a.name}>{a.name} (AC {a.acFormula(0,0).toString().replace('10','Base')}...)</option>)}
                 </select>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-amber-200 mt-4">
             <button onClick={() => setStep(2)} className="text-amber-700 underline">Back</button>
             <button 
               onClick={finishCreation}
               disabled={!character.name}
               className="bg-green-700 text-white px-8 py-3 rounded font-bold hover:bg-green-600 disabled:opacity-50 font-display text-lg shadow-lg"
             >
               Start Adventure
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCreator;