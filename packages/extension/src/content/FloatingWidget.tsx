import React, { useState, useEffect } from 'react';
import { TTSService, TransformationType, UserSettings } from '@processbridge/shared';

interface Position {
  x: number;
  y: number;
}

const FloatingWidget: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [transformedContent, setTransformedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [ttsService] = useState(() => new TTSService());

  useEffect(() => {
    // Load settings
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
      if (response?.settings) {
        setSettings(response.settings);
      }
    });

    // Listen for text selection
    const handleTextSelection = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { text } = customEvent.detail;

      setSelectedText(text);
      setTransformedContent(null);
      setIsExpanded(false);

      // Position widget near selection
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 10,
        });

        setIsVisible(true);
      }
    };

    document.addEventListener('processbridge:textSelected', handleTextSelection);

    // Hide widget on click outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#processbridge-widget')) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('processbridge:textSelected', handleTextSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTransform = async (type: TransformationType) => {
    setIsLoading(true);
    setIsExpanded(true);

    try {
      if (type === 'tts') {
        // Use local TTS
        await ttsService.speakInChunks(selectedText, {
          rate: settings?.profile.preferences.ttsSpeed || 1.0,
        });
        setTransformedContent('🔊 Reading text aloud...');
      } else {
        // Use AI transformation
        const response = await chrome.runtime.sendMessage({
          type: 'TRANSFORM_TEXT',
          payload: {
            text: selectedText,
            transformationType: type === 'simplify' ? 'simplify' : 'summarize',
            options: {
              complexity: settings?.profile.preferences.textComplexity || 'simple',
              length: 'brief',
            },
          },
        });

        if (response.error) {
          setTransformedContent(`Error: ${response.error}`);
        } else {
          setTransformedContent(
            Array.isArray(response.result)
              ? response.result.join('\n')
              : response.result
          );
        }
      }
    } catch (error) {
      setTransformedContent(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopTTS = () => {
    ttsService.stop();
    setTransformedContent(null);
    setIsExpanded(false);
  };

  if (!isVisible) return null;

  const enabledTransformations = settings?.enabledTransformations || ['simplify', 'tts', 'summarize'];

  return (
    <div
      id="processbridge-widget"
      className="processbridge-floating-widget"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="widget-header">
        <span className="widget-title">ProcessBridge</span>
        <button
          className="widget-close"
          onClick={() => setIsVisible(false)}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="widget-actions">
        {enabledTransformations.includes('simplify') && (
          <button
            className="widget-button"
            onClick={() => handleTransform('simplify')}
            disabled={isLoading}
          >
            ✨ Simplify
          </button>
        )}

        {enabledTransformations.includes('tts') && (
          <button
            className="widget-button"
            onClick={() => {
              if (ttsService.isSpeaking()) {
                handleStopTTS();
              } else {
                handleTransform('tts');
              }
            }}
            disabled={isLoading && !ttsService.isSpeaking()}
          >
            {ttsService.isSpeaking() ? '⏹️ Stop' : '🔊 Read Aloud'}
          </button>
        )}

        {enabledTransformations.includes('summarize') && (
          <button
            className="widget-button"
            onClick={() => handleTransform('summarize')}
            disabled={isLoading}
          >
            📝 Summarize
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="widget-content">
          {isLoading ? (
            <div className="loading">Processing...</div>
          ) : (
            <div className="transformed-text">
              {transformedContent}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingWidget;
