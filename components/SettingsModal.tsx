import React, { useState, useEffect } from 'react';
import { ProviderType } from '../services/provider';
import { getSettings, saveSettings, ProviderSettings } from '../services/settings';
import { pingOllama } from '../services/ollamaService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: ProviderType;
}

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'failure';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, initialTab }) => {
  const [activeTab, setActiveTab] = useState<ProviderType>(initialTab);
  const [form, setForm] = useState<ProviderSettings>(getSettings());
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');

  useEffect(() => {
    if (isOpen) {
      setForm(getSettings());
      setActiveTab(initialTab);
      setConnectionStatus('idle');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    const reachable = await pingOllama(form.ollamaBaseUrl);
    setConnectionStatus(reachable ? 'success' : 'failure');
  };

  const handleSave = () => {
    const { providerType, ...configFields } = form;
    saveSettings(configFields);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border-2 border-amber-900/20">
        <div className="flex justify-between items-center p-4 border-b border-amber-200">
          <h2 className="text-xl font-display font-bold text-amber-900">Provider Settings</h2>
          <button onClick={onClose} className="text-amber-700 hover:text-amber-900 text-xl leading-none">&times;</button>
        </div>

        <div className="flex border-b border-amber-200">
          <button
            onClick={() => setActiveTab('gemini')}
            className={`flex-1 py-2 text-sm font-bold ${activeTab === 'gemini' ? 'text-amber-900 border-b-2 border-amber-700' : 'text-gray-500'}`}
          >
            Gemini
          </button>
          <button
            onClick={() => setActiveTab('ollama')}
            className={`flex-1 py-2 text-sm font-bold ${activeTab === 'ollama' ? 'text-amber-900 border-b-2 border-amber-700' : 'text-gray-500'}`}
          >
            Ollama
          </button>
        </div>

        <div className="p-4 space-y-4">
          {activeTab === 'gemini' && (
            <>
              <div>
                <label className="block text-amber-800 font-bold mb-1 text-sm">API Key</label>
                <div className="flex gap-2">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={form.geminiApiKey}
                    onChange={(e) => setForm({ ...form, geminiApiKey: e.target.value })}
                    className="flex-1 p-2 border border-amber-300 rounded focus:border-amber-600 outline-none"
                    placeholder="Enter your Gemini API key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="px-3 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 rounded border border-amber-300 font-bold"
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-amber-800 font-bold mb-1 text-sm">Model</label>
                <input
                  type="text"
                  value={form.geminiModel}
                  onChange={(e) => setForm({ ...form, geminiModel: e.target.value })}
                  className="w-full p-2 border border-amber-300 rounded focus:border-amber-600 outline-none"
                  placeholder="gemini-2.5-flash"
                />
              </div>
            </>
          )}

          {activeTab === 'ollama' && (
            <>
              <div>
                <label className="block text-amber-800 font-bold mb-1 text-sm">Base URL</label>
                <input
                  type="text"
                  value={form.ollamaBaseUrl}
                  onChange={(e) => setForm({ ...form, ollamaBaseUrl: e.target.value })}
                  className="w-full p-2 border border-amber-300 rounded focus:border-amber-600 outline-none"
                  placeholder="http://localhost:11434"
                />
              </div>
              <div>
                <label className="block text-amber-800 font-bold mb-1 text-sm">Model</label>
                <input
                  type="text"
                  value={form.ollamaModel}
                  onChange={(e) => setForm({ ...form, ollamaModel: e.target.value })}
                  className="w-full p-2 border border-amber-300 rounded focus:border-amber-600 outline-none"
                  placeholder="llama3.2"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={connectionStatus === 'testing'}
                  className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded border border-amber-300 font-bold disabled:opacity-50"
                >
                  {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                </button>
                {connectionStatus === 'success' && <span className="text-sm text-green-700 font-bold">✅ Connected</span>}
                {connectionStatus === 'failure' && <span className="text-sm text-red-700 font-bold">❌ Unreachable</span>}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-amber-200">
          <button onClick={onClose} className="px-4 py-2 text-amber-800 hover:text-amber-900 font-bold">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-amber-800 text-white rounded font-bold hover:bg-amber-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
