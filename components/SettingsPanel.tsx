'use client';

import { Theme } from '@/hooks/useTheme';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  availableThemes: Array<{ key: Theme; name: string; icon: string; description: string }>;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
  availableThemes,
  isSoundEnabled,
  onToggleSound,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900/95 to-purple-900/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            ⚙️ Inställningar
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Sound Settings */}
          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              🔊 Ljudinställningar
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Ljudeffekter</div>
                <div className="text-sm text-gray-400">
                  Höj eller stäng av ljud för tangentbordsklick och feedback
                </div>
              </div>
              <button
                onClick={onToggleSound}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isSoundEnabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
              <div className="text-sm text-blue-200">
                <strong>Ljudtyper:</strong>
              </div>
              <div className="text-xs text-blue-300 mt-1 space-y-1">
                <div>• Tangentklick för korrekt tangent</div>
                <div>• Felljud för felaktiga tangenter</div>
                <div>• Combo-ljud för träffserier</div>
                <div>• Prestation- och nivå-uppljud</div>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              🎨 Temaval
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableThemes.map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => onThemeChange(theme.key)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    currentTheme === theme.key
                      ? 'border-blue-400 bg-blue-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{theme.icon}</div>
                    <div>
                      <div className="font-semibold">{theme.name}</div>
                      <div className="text-xs opacity-80">{theme.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Game Settings */}
          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              🎮 Spelinställningar
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Visuell feedback</div>
                  <div className="text-sm text-gray-400">
                    Markera tangenter med färgkodning
                  </div>
                </div>
                <div className="text-green-400 text-sm">Aktiverad</div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Combo-räknare</div>
                  <div className="text-sm text-gray-400">
                    Visa konsekutiva korrekta tangenttryck
                  </div>
                </div>
                <div className="text-green-400 text-sm">Aktiverad</div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Progress-spårning</div>
                  <div className="text-sm text-gray-400">
                    Spara framsteg och statistik
                  </div>
                </div>
                <div className="text-green-400 text-sm">Aktiverad</div>
              </div>
            </div>
          </div>

          {/* Data Settings */}
          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📊 Data & Integritet
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Lokal lagring:</span>
                <span className="text-green-400">Aktiverad</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Online synkning:</span>
                <span className="text-blue-400">Kräver inloggning</span>
              </div>

              <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-800/30 rounded">
                <strong>Dataskydd:</strong> Alla dina framsteg lagras lokalt i din webbläsare.
                Om du loggar in synkas data säkert med våra servrar för att bevara dina framsteg
                mellan enheter.
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              ℹ️ Om Spelet
            </h3>

            <div className="text-sm text-gray-300 space-y-2">
              <div>
                <strong>Tangentbordsträningsspel v1.0</strong>
              </div>
              <div>
                Byggt med Next.js, React och TypeScript för optimal träningsupplevelse.
              </div>
              <div className="text-xs text-gray-500 mt-4">
                Skapat för att hjälpa dig förbättra din skrivhastighet och noggrannhet
                genom progressiv träning och gamification.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Stäng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}