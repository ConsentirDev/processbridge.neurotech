import React, { useState, useEffect } from 'react';
import { UserSettings, ProcessingProfile, TransformationType } from '@processbridge/shared';

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

const Popup: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState<'openai' | 'anthropic'>('openai');
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    // Load settings from chrome.storage
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) {
        setSettings(result.settings);
        setIsSetup(true);
        setApiKey(result.settings.apiKey || '');
        setApiProvider(result.settings.apiProvider || 'openai');
      }
    });
  }, []);

  const handleSaveSettings = () => {
    const newSettings: UserSettings = {
      profile: settings?.profile || DEFAULT_PROFILE,
      apiKey,
      apiProvider,
      enabledTransformations: settings?.enabledTransformations || ['simplify', 'tts', 'summarize'],
      autoDetectStruggle: settings?.autoDetectStruggle ?? true,
      privacyMode: settings?.privacyMode ?? false,
    };

    chrome.storage.sync.set({ settings: newSettings }, () => {
      setSettings(newSettings);
      setIsSetup(true);
      alert('Settings saved!');
    });
  };

  const handleToggleTransformation = (type: TransformationType) => {
    if (!settings) return;

    const enabled = settings.enabledTransformations.includes(type);
    const newTransformations = enabled
      ? settings.enabledTransformations.filter(t => t !== type)
      : [...settings.enabledTransformations, type];

    setSettings({
      ...settings,
      enabledTransformations: newTransformations,
    });
  };

  if (!isSetup) {
    return (
      <div className="popup-container">
        <h1>Welcome to ProcessBridge</h1>
        <p>Let's get you set up! We need an API key to power the text transformations.</p>

        <div className="setup-form">
          <div className="form-group">
            <label htmlFor="provider">AI Provider:</label>
            <select
              id="provider"
              value={apiProvider}
              onChange={(e) => setApiProvider(e.target.value as 'openai' | 'anthropic')}
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
              placeholder={apiProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
            />
          </div>

          <button onClick={handleSaveSettings} disabled={!apiKey}>
            Save & Continue
          </button>

          <div className="help-text">
            <p>
              {apiProvider === 'openai' && (
                <>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI</a></>
              )}
              {apiProvider === 'anthropic' && (
                <>Get your API key from <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">Anthropic</a></>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <h1>ProcessBridge</h1>

      <section className="section">
        <h2>Enabled Transformations</h2>
        <div className="transformations">
          {[
            { type: 'simplify' as TransformationType, label: 'Text Simplification', description: 'Simplify complex text' },
            { type: 'tts' as TransformationType, label: 'Text-to-Speech', description: 'Read text aloud' },
            { type: 'summarize' as TransformationType, label: 'Summarization', description: 'Get key points' },
            { type: 'chunk' as TransformationType, label: 'Visual Chunking', description: 'Break into sections' },
          ].map((transform) => (
            <label key={transform.type} className="transformation-item">
              <input
                type="checkbox"
                checked={settings?.enabledTransformations.includes(transform.type) || false}
                onChange={() => handleToggleTransformation(transform.type)}
              />
              <div>
                <div className="transform-label">{transform.label}</div>
                <div className="transform-desc">{transform.description}</div>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Settings</h2>
        <div className="form-group">
          <label htmlFor="provider-settings">AI Provider:</label>
          <select
            id="provider-settings"
            value={apiProvider}
            onChange={(e) => setApiProvider(e.target.value as 'openai' | 'anthropic')}
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic (Claude)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="apiKey-settings">API Key:</label>
          <input
            id="apiKey-settings"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Update API key..."
          />
        </div>

        <button onClick={handleSaveSettings}>Save Settings</button>
      </section>

      <footer>
        <p className="footer-text">ProcessBridge v0.1.0</p>
      </footer>
    </div>
  );
};

export default Popup;
