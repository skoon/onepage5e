import React, { useState, useEffect, useRef } from 'react';
import { Character, ChatMessage } from '../types';
import { initGame, sendMessage } from '../services/geminiService';
import { EXAMPLE_MONSTERS, RANDOM_EVENTS } from '../constants';
import CharacterSheet from './CharacterSheet';
import DiceRoller from './DiceRoller';

interface AdventureViewProps {
  character: Character;
  onExit: () => void;
  onCharacterUpdate: (char: Character) => void;
}

const AdventureView: React.FC<AdventureViewProps> = ({ character, onExit, onCharacterUpdate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Setup State
  const [scenarioPrompt, setScenarioPrompt] = useState('');
  const [setting, setSetting] = useState('');
  const [goal, setGoal] = useState('');
  const [highlightedEventId, setHighlightedEventId] = useState<number | null>(null);

  const [gameStarted, setGameStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStart = async () => {
    setIsLoading(true);
    const introText = await initGame(character, setting, goal, scenarioPrompt);
    setMessages([{ role: 'model', content: introText, timestamp: Date.now() }]);
    setGameStarted(true);
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await sendMessage(input);
    const aiMsg: ChatMessage = { role: 'model', content: response, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleDiceRoll = (result: string) => {
    setInput(prev => (prev ? `${prev} [${result}]` : `[${result}]`));
  };

  const handleRestart = () => {
    if (window.confirm("Restart this adventure? Current chat history will be lost.")) {
      setMessages([]);
      setGameStarted(false);
      setInput('');
      // Keep scenario params so they can reuse
    }
  };

  const handleHpChange = (newHp: number) => {
    const clampedHp = Math.max(0, Math.min(character.maxHp, newHp));
    onCharacterUpdate({ ...character, currentHp: clampedHp });
  };

  const rollRandomEvent = () => {
    const randomId = Math.floor(Math.random() * RANDOM_EVENTS.length) + 1;
    setHighlightedEventId(randomId);
    return RANDOM_EVENTS.find(e => e.id === randomId);
  };

  const handleTravel = async () => {
    if (isLoading) return;
    
    const event = rollRandomEvent();
    if (!event) return;

    let actionDescription = `I travel to a new area. \n**Random Event:** ${event.event} (${event.effect}).`;

    // Check for the specific monster event. ID 7 corresponds to Monster Attack.
    if (event.id === 7) {
        const monster = EXAMPLE_MONSTERS[Math.floor(Math.random() * EXAMPLE_MONSTERS.length)];
        const count = (Math.floor(Math.random() * 4) + 1) + (Math.floor(Math.random() * 4) + 1); // 2d4
        actionDescription += `\n\n**Encounter:** ${count} ${monster.name}s appear!`;
        actionDescription += `\nStats: AC ${monster.ac}, HP ${monster.hp}, Attack ${monster.attack}`;
        actionDescription += `\n\nBegin combat!`;
    } else {
        actionDescription += `\n\nDescribe the new area and how this event manifests.`;
    }

    // Send to Chat
    const userMsg: ChatMessage = { role: 'user', content: actionDescription, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const response = await sendMessage(actionDescription);
    const aiMsg: ChatMessage = { role: 'model', content: response, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center min-h-[80vh] p-6 max-w-5xl mx-auto">
        <h2 className="text-4xl font-display font-bold text-amber-900 mb-6">Begin Adventure</h2>
        
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left: Setup Form */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-amber-900/20 space-y-4">
                <h3 className="text-xl font-bold text-amber-900 border-b pb-2">Adventure Parameters</h3>
                
                <div>
                    <label className="block text-amber-800 font-bold mb-1 text-sm">Setting</label>
                    <input
                        className="w-full p-2 border border-amber-300 rounded focus:border-amber-600 outline-none"
                        placeholder="e.g. The Caverns of Despair, A Royal Ball..."
                        value={setting}
                        onChange={(e) => setSetting(e.target.value)}
                    />
                </div>
                
                <div>
                    <label className="block text-amber-800 font-bold mb-1 text-sm">Goal</label>
                    <input
                        className="w-full p-2 border border-amber-300 rounded focus:border-amber-600 outline-none"
                        placeholder="e.g. Find the lost artifact, Slay the dragon..."
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-amber-800 font-bold mb-1 text-sm">Additional Notes / Scenario Hook</label>
                    <textarea
                        className="w-full h-24 p-2 border border-amber-300 rounded focus:border-amber-600 outline-none resize-none bg-amber-50"
                        placeholder="Any extra details for the DM..."
                        value={scenarioPrompt}
                        onChange={(e) => setScenarioPrompt(e.target.value)}
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button 
                        onClick={onExit}
                        className="px-4 py-2 text-amber-800 hover:text-amber-900 font-bold"
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleStart}
                        disabled={isLoading}
                        className="flex-1 bg-amber-800 text-white py-3 rounded font-bold font-display text-xl hover:bg-amber-700 disabled:opacity-50 flex justify-center items-center shadow-md"
                    >
                        {isLoading ? 'Loading...' : 'Start Game'}
                    </button>
                </div>
            </div>

            {/* Right: Reference Tables */}
            <div className="space-y-6">
                {/* Events Table */}
                <div className="bg-white p-4 rounded-lg shadow border border-amber-200">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-amber-900">Random Events</h3>
                        <button 
                            onClick={rollRandomEvent}
                            className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-1 rounded border border-amber-300 font-bold"
                        >
                            Roll Event (1d7)
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-amber-900 uppercase bg-amber-50">
                                <tr>
                                    <th className="px-2 py-1">#</th>
                                    <th className="px-2 py-1">Event</th>
                                    <th className="px-2 py-1">Effect</th>
                                </tr>
                            </thead>
                            <tbody>
                                {RANDOM_EVENTS.map((evt) => (
                                    <tr 
                                        key={evt.id} 
                                        className={`border-b border-amber-100 ${highlightedEventId === evt.id ? 'bg-yellow-100 font-bold text-amber-900' : ''}`}
                                    >
                                        <td className="px-2 py-1 font-bold">{evt.id}</td>
                                        <td className="px-2 py-1">{evt.event}</td>
                                        <td className="px-2 py-1 text-gray-600">{evt.effect}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Monster Table */}
                <div className="bg-white p-4 rounded-lg shadow border border-amber-200">
                    <h3 className="font-bold text-amber-900 mb-2">Random Monster Stats</h3>
                    <div className="overflow-x-auto max-h-60 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-amber-900 uppercase bg-amber-50 sticky top-0">
                                <tr>
                                    <th className="px-2 py-1">Monster</th>
                                    <th className="px-2 py-1">Atk/Dmg</th>
                                    <th className="px-2 py-1">AC</th>
                                    <th className="px-2 py-1">HP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {EXAMPLE_MONSTERS.map((m, idx) => (
                                    <tr key={idx} className="border-b border-amber-100 hover:bg-amber-50">
                                        <td className="px-2 py-1 font-medium">{m.name}</td>
                                        <td className="px-2 py-1">{m.attack}</td>
                                        <td className="px-2 py-1">{m.ac}</td>
                                        <td className="px-2 py-1">{m.hp}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // Active Game View
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] max-w-7xl mx-auto gap-4 p-4">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg border-2 border-amber-900/20 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-amber-50/50" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10 italic">The story begins...</div>
                )}
                {messages.map((msg, idx) => (
                    <div 
                        key={idx} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`max-w-[85%] rounded-lg p-3 shadow-sm whitespace-pre-wrap ${
                                msg.role === 'user' 
                                ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                                : 'bg-white text-gray-800 border border-gray-200'
                            }`}
                        >
                            {msg.role === 'model' ? (
                                <div className="prose prose-sm prose-amber max-w-none">
                                    {msg.content.split('\n').map((line, i) => (
                                        <p key={i} className="mb-2 last:mb-0">{line}</p>
                                    ))}
                                </div>
                            ) : msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-500 rounded-lg p-3 border border-gray-200 italic animate-pulse">
                            The DM is thinking...
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-white border-t border-amber-200">
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="What do you do?"
                        className="flex-1 border border-amber-300 rounded p-2 focus:border-amber-600 outline-none resize-none h-20 bg-amber-50"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={isLoading || !input.trim()}
                        className="bg-amber-800 text-white px-6 rounded font-bold hover:bg-amber-700 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto">
            {/* Quick Actions */}
            <div className="bg-amber-100 p-4 rounded border border-amber-300 shadow-sm">
                <h3 className="font-bold text-amber-900 mb-2 border-b border-amber-900/20 pb-1">Adventure Actions</h3>
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={handleTravel}
                        disabled={isLoading}
                        className="bg-amber-700 text-white py-2 px-4 rounded font-bold hover:bg-amber-600 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                    >
                        <span>🧭</span> Travel to New Area
                    </button>
                    <button 
                        onClick={handleRestart}
                        className="text-red-800 border border-red-800/30 hover:bg-red-50 py-1 px-3 rounded text-xs"
                    >
                        Restart Adventure
                    </button>
                </div>
            </div>

            {/* Dice Roller */}
            <DiceRoller onRoll={handleDiceRoll} />

            {/* Reference */}
            <div className="bg-white border border-amber-200 rounded p-2">
               <h4 className="font-bold text-amber-900 text-xs mb-1">Current Goal</h4>
               <p className="text-sm italic text-gray-600">{goal || 'Survive'}</p>
            </div>

            {/* Character Sheet */}
            <div className="hidden lg:block origin-top scale-95">
                <CharacterSheet character={character} onHpChange={handleHpChange} />
            </div>
        </div>
    </div>
  );
};

export default AdventureView;