import React, { useState } from 'react';
import { Character, Screen } from './types';
import CharacterCreator from './components/CharacterCreator';
import AdventureView from './components/AdventureView';
import SettingsModal from './components/SettingsModal';
import { setProvider, ProviderType } from './services/provider';
import { getSettings, saveSettings } from './services/settings';

const App = () => {
  const [screen, setScreen] = useState<Screen>('HOME');
  const [character, setCharacter] = useState<Character | null>(null);
  const [providerType, setProviderType] = useState<ProviderType>(getSettings().providerType);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const gameInProgress = screen === 'ADVENTURE' && character !== null;

  const handleProviderChange = (type: ProviderType) => {
    if (gameInProgress) return;
    setProvider(type);
    setProviderType(type);
    saveSettings({ providerType: type });
  };

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
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-1 bg-amber-800/50 rounded-lg p-0.5"
              title={gameInProgress ? 'Finish or restart your adventure to switch providers' : undefined}
            >
              <button
                onClick={() => handleProviderChange('gemini')}
                disabled={gameInProgress}
                className={`text-xs px-2 py-1 rounded font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${providerType === 'gemini' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-300 hover:text-amber-100'}`}
              >
                Gemini
              </button>
              <button
                onClick={() => handleProviderChange('ollama')}
                disabled={gameInProgress}
                className={`text-xs px-2 py-1 rounded font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${providerType === 'ollama' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-300 hover:text-amber-100'}`}
              >
                Ollama
              </button>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              title="Provider settings"
              className="text-amber-300 hover:text-amber-100 p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 01-.517.608 7.45 7.45 0 00-.478.198.798.798 0 01-.796-.064l-.453-.324a1.875 1.875 0 00-2.416.2l-.243.243a1.875 1.875 0 00-.2 2.416l.324.453a.798.798 0 01.064.796 7.448 7.448 0 00-.198.478.798.798 0 01-.608.517l-.55.092a1.875 1.875 0 00-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.517.238.608.517.06.164.127.325.198.478a.798.798 0 01-.064.796l-.324.453a1.875 1.875 0 00.2 2.416l.243.243c.648.648 1.67.712 2.416.2l.453-.324a.798.798 0 01.796-.064c.153.071.314.137.478.198.279.09.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 01.517-.608 7.52 7.52 0 00.478-.198.798.798 0 01.796.064l.453.324a1.875 1.875 0 002.416-.2l.243-.243c.648-.648.712-1.67.2-2.416l-.324-.453a.798.798 0 01-.064-.796c.071-.153.137-.314.198-.478.09-.279.327-.47.608-.517l.55-.091a1.875 1.875 0 001.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 01-.608-.517 7.507 7.507 0 00-.198-.478.798.798 0 01.064-.796l.324-.453a1.875 1.875 0 00-.2-2.416l-.243-.243a1.875 1.875 0 00-2.416-.2l-.453.324a.798.798 0 01-.796.064 7.462 7.462 0 00-.478-.198.798.798 0 01-.517-.608l-.091-.55a1.875 1.875 0 00-1.85-1.566h-.344zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
              </svg>
            </button>
            {character && (
              <>
                <div className="text-sm font-bold text-amber-200 hidden sm:block">
                  {character.name}
                </div>
                <button 
                  onClick={handleStartOver}
                  className="text-xs bg-red-900 hover:bg-red-800 text-white px-3 py-1.5 rounded border border-red-700 transition-colors uppercase font-bold tracking-wider"
                >
                  Start Over
                </button>
              </>
            )}
          </div>
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
               <p>Powered by Gemini or local Ollama models.</p>
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

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialTab={providerType}
      />
    </div>
  );
};

export default App;