'use client';

import { useState } from 'react';

interface UsernameSetupProps {
  onUsernameSet: (username: string) => void;
  currentUsername?: string;
}

export default function UsernameSetup({ onUsernameSet, currentUsername }: UsernameSetupProps) {
  const [username, setUsername] = useState(currentUsername || '');
  const [isValid, setIsValid] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      setIsValid(false);
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setIsValid(false);
      return;
    }

    setIsValid(true);
    onUsernameSet(trimmed);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setIsValid(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {currentUsername ? '⚙️ Ändra användarnamn' : '👋 Välkommen!'}
          </h2>
          <p className="text-gray-300">
            {currentUsername
              ? 'Ändra ditt användarnamn för topplistan'
              : 'Välj ett användarnamn för att spara dina framsteg och tävla på topplistan!'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Användarnamn
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleInputChange}
              placeholder="Skriv ditt användarnamn"
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                isValid
                  ? 'border-gray-600 focus:ring-blue-500'
                  : 'border-red-500 focus:ring-red-500'
              }`}
              maxLength={20}
              autoComplete="off"
              autoFocus
            />
            {!isValid && (
              <p className="mt-2 text-sm text-red-400">
                Användarnamnet måste vara 3-20 tecken långt och får endast innehålla bokstäver, siffror, _ och -
              </p>
            )}
          </div>

          <div className="flex gap-3">
            {currentUsername && (
              <button
                type="button"
                onClick={() => onUsernameSet(currentUsername)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Avbryt
              </button>
            )}
            <button
              type="submit"
              disabled={!username.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {currentUsername ? 'Spara' : 'Fortsätt'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Dina framsteg sparas lokalt även utan användarnamn</p>
            <p>• Med användarnamn kan du tävla på topplistan</p>
            <p>• Du kan ändra användarnamn när som helst</p>
          </div>
        </div>
      </div>
    </div>
  );
}