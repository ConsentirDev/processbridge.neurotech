import React, { useState, useEffect } from 'react';
import { UserSettings, ProcessingProfile, TransformationType, AIService, TTSService } from '@processbridge/shared';
import './App.css';

const DEFAULT_PROFILE: ProcessingProfile = {
  id: 'default',
  name: 'Default Profile',
  preferences: {
    audioProcessingDelay: 'medium',
    readingDifficulty: 'medium',
    preferredTransformations: ['simplify', 'tts', 'summarize'],
    ttsSpeed: 1.0,
    textComplexity: 'simple',
  },
};

function App() {
  const [settings, setSettings] = useState<UserSettings>({
    profile: DEFAULT_PROFILE,
    apiProvider: 'openai',
    enabledTransformations: ['simplify', 'tts', 'summarize'],
    autoDetectStruggle: true,
    privacyMode: false,
  });
  const [apiKey, setApiKey] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ttsService] = useState(() => new TTSService());

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('processbridge-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      setApiKey(parsed.apiKey || '');
    }
  }, []);

  const saveSettings = () => {
    const newSettings = {
      ...settings,
      apiKey,
    };
    localStorage.setItem('processbridge-settings', JSON.stringify(newSettings));
    setSettings(newSettings);
    alert('Settings saved!');
  };

  const handleTransform = async (type: TransformationType) => {
    if (!inputText.trim()) {
      alert('Please enter some text to transform');
      return;
    }

    setIsProcessing(true);
    setOutputText('');

    try {
      if (type === 'tts') {
        await ttsService.speakInChunks(inputText, {
          rate: settings.profile.preferences.ttsSpeed,
        });
        setOutputText('🔊 Text read aloud successfully');
      } else {
        if (!apiKey) {
          alert('Please configure your API key in settings');
          setIsProcessing(false);
          return;
        }

        const aiService = new AIService({
          apiKey,
          provider: settings.apiProvider,
        });

        let result: string | string[];

        if (type === 'simplify') {
          result = await aiService.simplifyText(inputText, settings.profile.preferences.textComplexity);
        } else if (type === 'summarize') {
          result = await aiService.summarizeText(inputText, 'brief');
        } else {
          throw new Error(`Unknown transformation type: ${type}`);
        }

        setOutputText(Array.isArray(result) ? result.join('\n') : result);
      }
    } catch (error) {
      setOutputText(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopTTS = () => {
    ttsService.stop();
    setOutputText('');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ProcessBridge</h1>
        <p>Adaptive Multi-Modal Content Processor</p>
      </header>

      <div className="app-content">
        <div className="panel">
          <h2>Input Text</h2>
          <textarea
            className="text-area"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste or type text here..."
            rows={10}
          />

          <div className="actions">
            {settings.enabledTransformations.includes('simplify') && (
              <button
                className="action-button"
                onClick={() => handleTransform('simplify')}
                disabled={isProcessing}
              >
                ✨ Simplify
              </button>
            )}

            {settings.enabledTransformations.includes('tts') && (
              <button
                className="action-button"
                onClick={() => {
                  if (ttsService.isSpeaking()) {
                    handleStopTTS();
                  } else {
                    handleTransform('tts');
                  }
                }}
                disabled={isProcessing && !ttsService.isSpeaking()}
              >
                {ttsService.isSpeaking() ? '⏹️ Stop Reading' : '🔊 Read Aloud'}
              </button>
            )}

            {settings.enabledTransformations.includes('summarize') && (
              <button
                className="action-button"
                onClick={() => handleTransform('summarize')}
                disabled={isProcessing}
              >
                📝 Summarize
              </button>
            )}
          </div>
        </div>

        <div className="panel">
          <h2>Output</h2>
          <div className="output-area">
            {isProcessing ? (
              <div className="loading">Processing...</div>
            ) : (
              <pre className="output-text">{outputText || 'Transformed text will appear here...'}</pre>
            )}
          </div>
        </div>

        <div className="panel settings-panel">
          <h2>Settings</h2>

          <div className="form-group">
            <label htmlFor="provider">AI Provider:</label>
            <select
              id="provider"
              value={settings.apiProvider}
              onChange={(e) => setSettings({ ...settings, apiProvider: e.target.value as 'openai' | 'anthropic' })}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic (Claude)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="apiKey">API Key:</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={settings.apiProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ttsSpeed">TTS Speed: {settings.profile.preferences.ttsSpeed}x</label>
            <input
              id="ttsSpeed"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.profile.preferences.ttsSpeed}
              onChange={(e) => setSettings({
                ...settings,
                profile: {
                  ...settings.profile,
                  preferences: {
                    ...settings.profile.preferences,
                    ttsSpeed: parseFloat(e.target.value),
                  },
                },
              })}
            />
          </div>

          <button className="save-button" onClick={saveSettings}>
            Save Settings
          </button>

          <div className="info">
            <p><strong>Global Shortcut:</strong> {navigator.platform.includes('Mac') ? 'Cmd+Shift+P' : 'Ctrl+Shift+P'}</p>
            <p>Use the shortcut to toggle the overlay window from anywhere (coming in Phase 2)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
