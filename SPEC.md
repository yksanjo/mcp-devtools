# MCP DevTools - Specification

## Project Overview

**Project Name:** MCP DevTools  
**Type:** Chrome Extension + CLI  
**Core Functionality:** Real-time debugging and monitoring of MCP (Model Context Protocol) servers  
**Target Users:** Developers building and debugging MCP servers

---

## MVP Features

### 1. MCP Traffic Inspector
- Capture and display MCP server requests/responses
- Show JSON payloads with syntax highlighting
- Filter by request type (tools, resources, prompts)
- Search functionality across requests

### 2. Tool Call Playground
- GUI interface to test MCP tool calls
- Input parameters with JSON editor
- View responses in formatted JSON
- History of test calls

### 3. Token & Latency Monitor
- Per-tool token usage tracking
- Latency measurement per request
- Summary statistics dashboard

---

## Technical Architecture

### Chrome Extension Components
- **Manifest V3** for Chrome extension
- **DevTools Panel** for UI
- **Content Script** for Claude Desktop integration
- **Background Script** for message relay

### Communication Flow
```
Claude Desktop <-> Content Script <-> Background Script <-> DevTools Panel
```

---

## File Structure
```
mcp-devtools/
├── manifest.json
├── background.js
├── devtools.js
├── devtools.html
├── devtools.css
├── panels/
│   ├── traffic-panel.js
│   ├── traffic-panel.html
│   ├── playground-panel.js
│   ├── playground-panel.html
│   └── stats-panel.js
├── lib/
│   ├── mcp-parser.js
│   └── storage.js
├── popup/
│   ├── popup.html
│   └── popup.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## UI/UX Specification

### Theme
- Dark mode with high contrast
- Primary: #1a1a2e (deep navy)
- Secondary: #16213e (dark blue)
- Accent: #e94560 (coral red)
- Success: #4ecca3 (mint green)
- Warning: #ffc93c (amber)
- Text: #eaeaea (off-white)
- Border: #2d2d44 (muted purple-gray)

### Typography
- Font Family: 'JetBrains Mono', 'Fira Code', monospace
- Headings: 16px bold
- Body: 13px regular
- Code: 12px

### Layout
- Sidebar: 240px width
- Main content: fluid
- Panel tabs at top
- Status bar at bottom

---

## Acceptance Criteria

1. ✅ Extension installs without errors
2. ✅ DevTools panel opens and displays correctly
3. ✅ Can capture MCP request/response pairs
4. ✅ JSON syntax highlighting works
5. ✅ Tool playground allows testing tool calls
6. ✅ Token usage and latency are displayed
7. ✅ Filter and search functionality works
