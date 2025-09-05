import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  Download,
  Upload,
  Shield,
  Zap,
  Globe,
  Bell,
  Database,
  Key,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  RotateCcw,
  TestTube
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { aiConfigManager } from '../utils/aiConfigManager';

export const AIConfigSettings: React.FC = () => {
  const { isDark } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    try {
      const config = aiConfigManager.getConfig();
      setApiKey(config.apiKey || '');
    } catch (e) {
      // ignore, user may not have env set yet
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      aiConfigManager.updateConfig({ apiKey });
      setMessage('Saved');
    } catch (e) {
      setMessage('Invalid API key.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Config (Quick)</h3>
      <div className="space-y-3">
        <div>
          <label className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm block mb-1`}>Gemini API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              placeholder="AIza..."
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          {message && (
            <span className={`text-sm ${message === 'Saved' ? 'text-green-400' : 'text-red-400'}`}>{message}</span>
          )}
        </div>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
          Note: For production builds, set `VITE_GEMINI_API_KEY` in a `.env` file and rebuild.
        </p>
      </div>
    </div>
  );
};