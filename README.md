# MCP DevTools

A browser extension + CLI for debugging MCP (Model Context Protocol) servers in real-time.

## Features

### 🚀 MCP Traffic Inspector
- Capture and display MCP server requests/responses
- JSON payloads with syntax highlighting
- Filter by request type (tools, resources, prompts)
- Search functionality across requests

### 🛠️ Tool Call Playground
- GUI interface to test MCP tool calls
- Input parameters with JSON editor
- View responses in formatted JSON
- History of test calls

### 📊 Token & Latency Monitor
- Per-tool token usage tracking
- Latency measurement per request
- Summary statistics dashboard

## Installation

### Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `mcp-devtools` folder

### Usage

1. Click the MCP DevTools extension icon in Chrome
2. Or open Chrome DevTools (F12) and look for the "MCP" tab
3. Start using MCP servers - traffic will be captured automatically

## Project Structure

```
mcp-devtools/
├── manifest.json          # Chrome extension manifest
├── background.js         # Service worker for message handling
├── devtools.html         # Main DevTools panel
├── devtools.js           # DevTools panel logic
├── devtools.css         # Styles
├── lib/
│   ├── mcp-parser.js    # MCP protocol parser
│   └── storage.js       # Local storage utility
├── popup/
│   ├── popup.html       # Extension popup
│   └── popup.js         # Popup logic
└── icons/
    └── icon*.svg        # Extension icons
```

## Development

```bash
# Navigate to extension directory
cd mcp-devtools

# Load in Chrome
# 1. Open chrome://extensions
# 2. Enable Developer mode
# 3. Click Load unpacked
# 4. Select this directory
```

## License

MIT
