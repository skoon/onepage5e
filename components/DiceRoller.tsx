import React, { useState } from 'react';
import { D20Icon, D6Icon, D4Icon, D8Icon, D10Icon, D12Icon } from './Icons'; // Placeholder import, implementing inline

const DieIcon = ({ type, className }: { type: number, className?: string }) => {
  // Simple SVG representations for dice
  const baseClass = `w-8 h-8 ${className || ''}`;
  switch (type) {
    case 4: return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClass}>
        <path d="M12 2L2 22h20L12 2z" />
        <text x="12" y="18" fontSize="10" textAnchor="middle" fill="currentColor">4</text>
      </svg>
    );
    case 6: return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClass}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <text x="12" y="15" fontSize="10" textAnchor="middle" fill="currentColor">6</text>
      </svg>
    );
    case 8: return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClass}>
        <path d="M12 2L2 12l10 10 10-10L12 2z" />
        <text x="12" y="15" fontSize="8" textAnchor="middle" fill="currentColor">8</text>
      </svg>
    );
    case 10: return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClass}>
        <path d="M12 2l-8 10 8 10 8-10L12 2z" />
        <text x="12" y="15" fontSize="8" textAnchor="middle" fill="currentColor">10</text>
      </svg>
    );
    case 12: return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClass}>
        <path d="M12 2l8.5 6.2-3.3 10.8H6.8L3.5 8.2 12 2z" />
        <text x="12" y="15" fontSize="8" textAnchor="middle" fill="currentColor">12</text>
      </svg>
    );
    case 20: return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClass}>
        <path d="M12 2L3 8l4 12h10l4-12L12 2z" />
        <text x="12" y="15" fontSize="8" textAnchor="middle" fill="currentColor">20</text>
      </svg>
    );
    default: return null;
  }
};

interface DiceRollerProps {
  onRoll: (result: string) => void;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll }) => {
  const [lastRoll, setLastRoll] = useState<string | null>(null);

  const rollDie = (sides: number) => {
    const result = Math.floor(Math.random() * sides) + 1;
    const msg = `Rolled d${sides}: ${result}`;
    setLastRoll(msg);
    onRoll(msg);
  };

  return (
    <div className="bg-amber-100 border-2 border-amber-900 rounded p-4 shadow-inner">
      <h3 className="text-amber-900 font-bold font-display text-sm mb-2 text-center border-b border-amber-800/20 pb-1">Dice Tray</h3>
      <div className="grid grid-cols-3 gap-2">
        {[4, 6, 8, 10, 12, 20].map(sides => (
          <button
            key={sides}
            onClick={() => rollDie(sides)}
            className="flex flex-col items-center justify-center p-2 hover:bg-amber-200 rounded transition-colors text-amber-900"
          >
            <DieIcon type={sides} />
            <span className="text-xs font-bold mt-1">d{sides}</span>
          </button>
        ))}
      </div>
      {lastRoll && (
        <div className="mt-2 text-center text-amber-900 font-bold bg-white/50 rounded py-1 animate-pulse">
          {lastRoll}
        </div>
      )}
    </div>
  );
};

export default DiceRoller;