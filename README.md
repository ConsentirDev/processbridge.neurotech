# ProcessBridge

**Adaptive Multi-Modal Content Processor for Neurodivergent Knowledge Workers**

ProcessBridge is a tool designed to help neurodiverse individuals process written and spoken content more effectively. It provides real-time text transformations including simplification, text-to-speech, and summarization.

## Features

### Phase 1 (MVP) - Current Implementation

- **Text Simplification**: Automatically simplifies complex text using AI
- **Text-to-Speech**: Reads text aloud with adjustable speed
- **Summarization**: Extracts key points and creates concise summaries
- **Dual Platform**: Available as both a Chrome extension and standalone desktop app
- **Privacy-First**: Local processing where possible, with cloud AI for advanced features
- **Customizable**: Adjust processing preferences to match your needs

## Project Structure

```
processbridge/
├── packages/
│   ├── shared/          # Shared React components and services
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   │   ├── aiService.ts      # AI transformations
│   │   │   │   ├── ttsService.ts     # Text-to-speech
│   │   │   │   └── contentAnalyzer.ts
│   │   │   └── types/
│   │   └── package.json
│   ├── extension/       # Chrome extension
│   │   ├── src/
│   │   │   ├── popup/   # Extension popup UI
│   │   │   ├── content/ # Content script & floating widget
│   │   │   └── background/ # Service worker
│   │   └── public/
│   │       └── manifest.json
│   └── desktop/         # Electron desktop app
│       ├── electron/    # Electron main process
│       ├── src/         # React renderer
│       └── index.html
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- API key from either:
  - [OpenAI](https://platform.openai.com/api-keys) (recommended: GPT-4o-mini)
  - [Anthropic](https://console.anthropic.com/settings/keys) (Claude)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ConsentirDev/processbridge.neurotech.git
cd processbridge.neurotech
```

2. Install dependencies:
```bash
npm install
```

This will install all dependencies for all packages in the monorepo.

### Development

#### Chrome Extension

1. Build the extension:
```bash
npm run build:extension
```

2. Load in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `packages/extension/dist` folder

3. Configure your API key:
   - Click the ProcessBridge extension icon
   - Select your AI provider (OpenAI or Anthropic)
   - Enter your API key
   - Save settings

4. Usage:
   - Navigate to any webpage
   - Select text you want to transform
   - A floating widget will appear with transformation options
   - Click "Simplify", "Read Aloud", or "Summarize"

#### Desktop App

1. Start development server:
```bash
npm run dev:desktop
```

2. The app will launch automatically

3. Configure your API key in the Settings section

4. Usage:
   - Paste text into the input area
   - Click transformation buttons
   - Use global shortcut: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) to toggle overlay

### Building for Production

#### Extension
```bash
npm run build:extension
```
Output: `packages/extension/dist/`

#### Desktop App
```bash
npm run build:desktop
```
Output: `packages/desktop/dist-electron/`

## Configuration

### Processing Profiles

You can customize your processing preferences:

- **Audio Processing Delay**: Low / Medium / High
- **Reading Difficulty**: Low / Medium / High
- **TTS Speed**: 0.5x - 2.0x
- **Text Complexity**: Simple / Moderate / Original
- **Enabled Transformations**: Choose which features to enable

### API Providers

**OpenAI** (Default)
- Model: GPT-4o-mini
- Cost-effective for most use cases
- Fast response times

**Anthropic (Claude)**
- Model: Claude 3.5 Haiku
- Alternative option
- Privacy-focused

## Keyboard Shortcuts

### Desktop App
- `Cmd/Ctrl + Shift + P`: Toggle overlay window

### Extension
- Select text with mouse to show widget

## Roadmap

### Phase 2: Learning System
- Track which transformations you use most
- Automatic struggle detection based on reading patterns
- Personalized processing profiles
- Usage analytics

### Phase 3: Multi-tab Workspace
- Persistent sidebar with summaries
- Cross-tab research support
- Visual progress tracking
- Brain break reminders

### Phase 4: Mobile Support
- iOS/Android companion apps
- Sync settings across devices
- Mobile-optimized UI

## Privacy & Security

- **Local-First**: TTS runs entirely on your device
- **API Keys**: Stored locally, never sent to our servers
- **No Tracking**: No usage analytics in MVP
- **Open Source**: Review all code yourself

## Development Tips

### Monorepo Structure
This project uses npm workspaces. Each package can be developed independently:

```bash
# Work on shared package
cd packages/shared
npm run dev

# Work on extension
cd packages/extension
npm run dev

# Work on desktop
cd packages/desktop
npm run dev
```

### Hot Reload
- Extension: Rebuild and reload extension in Chrome
- Desktop: Vite HMR is enabled

## Troubleshooting

### Extension Issues

**Widget not appearing:**
- Check that you've selected enough text (10+ characters)
- Verify extension is enabled in chrome://extensions/
- Check browser console for errors

**API errors:**
- Verify your API key is correct
- Check your API provider account has credits
- Ensure you have internet connection

### Desktop App Issues

**App won't start:**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+)
- Look for errors in the terminal

**Electron build fails:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check disk space

## Contributing

This is currently a personal project, but contributions are welcome! Areas of focus:

1. **Accessibility**: Additional processing modes
2. **UI/UX**: Making interfaces even more intuitive
3. **Performance**: Optimizing transformation speed
4. **Testing**: Adding test coverage

## License

MIT

## Acknowledgments

Built with:
- React
- TypeScript
- Electron
- Vite
- OpenAI / Anthropic APIs

Created to support neurodivergent knowledge workers in processing information more effectively.

---

**Note**: This is an MVP. Features may be incomplete or require refinement. Feedback is welcome!
