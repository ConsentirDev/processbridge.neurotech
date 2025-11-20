import { AIService, UserSettings } from '@processbridge/shared';

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TRANSFORM_TEXT') {
    handleTransformText(request.payload)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.type === 'GET_SETTINGS') {
    chrome.storage.sync.get(['settings'], (result) => {
      sendResponse({ settings: result.settings });
    });
    return true;
  }
});

async function handleTransformText(payload: {
  text: string;
  transformationType: 'simplify' | 'summarize' | 'extract';
  options?: any;
}) {
  const { text, transformationType, options } = payload;

  // Get settings from storage
  const result = await chrome.storage.sync.get(['settings']);
  const settings: UserSettings = result.settings;

  if (!settings?.apiKey) {
    throw new Error('API key not configured. Please set it in the extension popup.');
  }

  const aiService = new AIService({
    apiKey: settings.apiKey,
    provider: settings.apiProvider,
  });

  let transformedText: string | string[];

  switch (transformationType) {
    case 'simplify':
      transformedText = await aiService.simplifyText(text, options?.complexity || 'simple');
      break;

    case 'summarize':
      transformedText = await aiService.summarizeText(text, options?.length || 'brief');
      break;

    case 'extract':
      transformedText = await aiService.extractKeyPoints(text);
      break;

    default:
      throw new Error(`Unknown transformation type: ${transformationType}`);
  }

  return {
    success: true,
    result: transformedText,
  };
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('ProcessBridge extension installed');
});
