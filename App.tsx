import React, { useState } from 'react';
import { Character, Screen } from './types';
import CharacterCreator from './components/CharacterCreator';
import AdventureView from './components/AdventureView';

const App = () => {
  const [screen, setScreen] = useState<Screen>('HOME');
  const [character, setCharacter] = useState<Character | null>(null);

  const handleCharacterComplete = (char: Character) => {
    setCharacter(char);
    setScreen('ADVENTURE');
  };

  const handleStartOver = () => {
    if (window.confirm("Are you sure you want to delete your character and start over?")) {
      setCharacter(null);
      setScreen('HOME');
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf6e3] text-gray-800">
      <header className="bg-amber-900 text-amber-50 p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setScreen('HOME')}
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-amber-400">
               <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
             </svg>
             <h1 className="text-2xl font-display font-bold tracking-wide">One Page 5e</h1>
          </div>
          {character && (
             <div className="flex items-center gap-4">
               <div className="text-sm font-bold text-amber-200 hidden sm:block">
                 {character.name}
               </div>
               <button 
                 onClick={handleStartOver}
                 className="text-xs bg-red-900 hover:bg-red-800 text-white px-3 py-1.5 rounded border border-red-700 transition-colors uppercase font-bold tracking-wider"
               >
                 Start Over
               </button>
             </div>
          )}
        </div>
      </header>

      <main className="p-4">
        {screen === 'HOME' && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-2xl mx-auto">
             <div className="mb-8 p-8 border-4 border-double border-amber-900 rounded-lg bg-amber-50 shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <h2 className="text-5xl font-display font-bold text-amber-900 mb-4">Welcome, Traveler</h2>
                <p className="text-lg text-amber-800 mb-6 font-serif italic">
                  "Minimalist Fantasy Roleplaying Compatible With Fifth Edition"
                </p>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Experience Tasha Patterson's streamlined 5e ruleset. Create a hero in minutes, roll the dice, and embark on endless adventures guided by AI.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => setScreen('CREATE')}
                    className="bg-amber-800 text-white px-8 py-3 rounded shadow hover:bg-amber-700 font-bold font-display text-lg"
                  >
                    {character ? 'Create New Hero' : 'Create Hero'}
                  </button>
                  {character && (
                    <button 
                      onClick={() => setScreen('ADVENTURE')}
                      className="bg-amber-100 text-amber-900 border-2 border-amber-800 px-8 py-3 rounded shadow hover:bg-amber-200 font-bold font-display text-lg"
                    >
                      Continue Adventure
                    </button>
                  )}
                </div>
             </div>
             
             <div className="text-sm text-gray-500 mt-8">
               <p>Rules based on One Page 5e by Tasha Patterson.</p>
               <p>Powered by Google Gemini.</p>
             </div>
          </div>
        )}

        {screen === 'CREATE' && (
          <CharacterCreator 
            onComplete={handleCharacterComplete} 
            onCancel={() => setScreen('HOME')} 
          />
        )}

        {screen === 'ADVENTURE' && character && (
          <AdventureView 
            character={character} 
            onCharacterUpdate={setCharacter}
            onExit={() => setScreen('HOME')} 
          />
        )}
      </main>
    </div>
  );
};

export default App;