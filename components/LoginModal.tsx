'use client';

import { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (username: string) => Promise<boolean>;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  isOnline?: boolean;
}

export default function LoginModal({ isOpen, onLogin, onClose, isLoading, error, isOnline = true }: LoginModalProps) {
  const [username, setUsername] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const success = await onLogin(username.trim());
    if (success) {
      setUsername('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900/90 to-purple-900/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isOnline ? 'Logga in eller Registrera' : 'Offline-läge'}
          </h2>
          <p className="text-gray-300 text-sm">
            {isOnline
              ? 'Spara dina framsteg online och tävla med andra!'
              : 'Online-funktioner ej tillgängliga. Spelar endast lokalt med localStorage.'
            }
          </p>
          {!isOnline && (
            <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-400 rounded-lg">
              <p className="text-yellow-200 text-xs">
                ⚠️ Supabase ej konfigurerad. Alla framsteg sparas lokalt.
              </p>
            </div>
          )}
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
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Ange ditt användarnamn"
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_-]+"
              title="Bara bokstäver, siffror, bindestreck och understreck"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-400 mt-1">
              3-20 tecken, bara bokstäver, siffror, - och _
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading || !username.trim()}
            >
              {isLoading ? 'Ansluter...' : 'Fortsätt'}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400 rounded-lg">
          <p className="text-blue-300 text-sm">
            💡 <strong>Tips:</strong> Dina lokala framsteg kommer att synkas med ditt online-konto!
          </p>
        </div>
      </div>
    </div>
  );
}