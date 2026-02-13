// MCP DevTools - Main DevTools Panel Script

// Unique subscriber ID for this panel
const subscriberId = 'devtools-' + Date.now();

// State
let requests = [];
let filteredRequests = [];
let callHistory = [];

// DOM Elements
const elements = {
  tabs: document.querySelectorAll('.tab'),
  panels: document.querySelectorAll('.panel'),
  requestList: document.getElementById('request-list'),
  requestDetail: document.getElementById('request-detail'),
  trafficFilter: document.getElementById('traffic-filter'),
  trafficSearch: document.getElementById('traffic-search'),
  clearTraffic: document.getElementById('clear-traffic'),
  closeDetail: document.getElementById('close-detail'),
  requestJson: document.getElementById('request-json'),
  responseJson: document.getElementById('response-json'),
  toolName: document.getElementById('tool-name'),
  toolParams: document.getElementById('tool-params'),
  executeTool: document.getElementById('execute-tool'),
  resultStatus: document.getElementById('result-status'),
  resultJson: document.getElementById('result-json'),
  callHistory: document.getElementById('call-history'),
  resetStats: document.getElementById('reset-stats'),
  totalRequests: document.getElementById('total-requests'),
  totalTokens: document.getElementById('total-tokens'),
  avgLatency: document.getElementById('avg-latency'),
  toolStats: document.getElementById('tool-stats'),
  connectionStatus: document.getElementById('connection-status'),
  requestCount: document.getElementById('request-count')
};

// Tab switching
elements.tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const panelId = tab.dataset.panel;
    
    // Update tabs
    elements.tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update panels
    elements.panels.forEach(p => p.classList.remove('active'));
    document.getElementById(panelId + '-panel').classList.add('active');
  });
});

// Format JSON with syntax highlighting
function formatJSON(obj) {
  if (!obj) return '';
  try {
    const json = typeof obj === 'string' ? JSON.parse(obj) : obj;
    return JSON.stringify(json, null, 2);
  } catch (e) {
    return String(obj);
  }
}

// Syntax highlighting for JSON
function highlightJSON(json) {
  if (!json) return '';
  
  const str = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
  
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
}

// Render request list
function renderRequestList() {
  if (filteredRequests.length === 0) {
    elements.requestList.innerHTML = `
      <div class="empty-state">
        <p>No MCP traffic captured yet</p>
        <p class="hint">Start using MCP servers to see traffic here</p>
      </div>
    `;
    return;
  }
  
  elements.requestList.innerHTML = filteredRequests.map(req => {
    const method = req.method || 'unknown';
    const statusClass = req.status === 'success' ? 'success' : req.status === 'pending' ? 'pending' : 'error';
    const timestamp = new Date(req.timestamp).toLocaleTimeString();
    const latency = req.latency ? `${req.latency}ms` : '-';
    const toolName = req.toolName || 'unknown';
    
    return `
      <div class="request-item" data-id="${req.id}">
        <div class="request-status ${statusClass}"></div>
        <div class="request-info">
          <div class="request-method">${method}</div>
          <div class="request-tool">${toolName}</div>
        </div>
        <div class="request-meta">
          <span class="request-time">${timestamp}</span>
          <span class="request-latency">${latency}</span>
        </div>
      </div>
    `;
  }).join('');
  
  // Add click handlers
  document.querySelectorAll('.request-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      showRequestDetail(id);
    });
  });
}

// Show request detail
function showRequestDetail(id) {
  const req = requests.find(r => r.id === id);
  if (!req) return;
  
  elements.requestJson.innerHTML = highlightJSON(formatJSON(req.params));
  elements.responseJson.innerHTML = highlightJSON(formatJSON(req.response || req.error));
  elements.requestDetail.classList.add('active');
}

// Close request detail
elements.closeDetail.addEventListener('click', () => {
  elements.requestDetail.classList.remove('active');
});

// Filter requests
function filterRequests() {
  const filter = elements.trafficFilter.value;
  const search = elements.trafficSearch.value.toLowerCase();
  
  filteredRequests = requests.filter(req => {
    // Filter by type
    if (filter !== 'all') {
      const method = req.method?.toLowerCase() || '';
      if (filter === 'tools' && !method.includes('tool')) return false;
      if (filter === 'resources' && !method.includes('resource')) return false;
      if (filter === 'prompts' && !method.includes('prompt')) return false;
    }
    
    // Filter by search
    if (search) {
      const json = JSON.stringify(req).toLowerCase();
      if (!json.includes(search)) return false;
    }
    
    return true;
  });
  
  renderRequestList();
}

elements.trafficFilter.addEventListener('change', filterRequests);
elements.trafficSearch.addEventListener('input', filterRequests);

// Clear traffic
elements.clearTraffic.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'CLEAR_TRAFFIC' }, (response) => {
    if (response?.success) {
      requests = [];
      filteredRequests = [];
      renderRequestList();
      updateRequestCount();
    }
  });
});

// Tool Playground - Execute tool
elements.executeTool.addEventListener('click', () => {
  const toolName = elements.toolName.value.trim();
  let params = {};
  
  try {
    params = elements.toolParams.value ? JSON.parse(elements.toolParams.value) : {};
  } catch (e) {
    elements.resultStatus.textContent = 'Invalid JSON parameters';
    elements.resultStatus.className = 'error';
    elements.resultJson.textContent = e.message;
    return;
  }
  
  if (!toolName) {
    elements.resultStatus.textContent = 'Tool name required';
    elements.resultStatus.className = 'error';
    return;
  }
  
  // Send tool call request
  chrome.runtime.sendMessage({
    type: 'MCP_REQUEST',
    method: 'tools/call',
    params: { name: toolName, arguments: params }
  }, (response) => {
    // Update result
    elements.resultStatus.textContent = 'Success';
    elements.resultStatus.className = 'success';
    elements.resultJson.innerHTML = highlightJSON(formatJSON(response));
    
    // Add to history
    const historyItem = {
      id: Date.now(),
      toolName,
      params,
      result: response,
      timestamp: new Date().toISOString()
    };
    callHistory.unshift(historyItem);
    if (callHistory.length > 10) callHistory.pop();
    renderCallHistory();
  });
});

// Render call history
function renderCallHistory() {
  if (callHistory.length === 0) {
    elements.callHistory.innerHTML = '<p class="hint">No calls yet</p>';
    return;
  }
  
  elements.callHistory.innerHTML = callHistory.map(item => `
    <div class="history-item" data-id="${item.id}">
      <div class="history-tool">${item.toolName}</div>
      <div class="history-time">${new Date(item.timestamp).toLocaleTimeString()}</div>
    </div>
  `).join('');
  
  // Add click handlers
  document.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      const historyItem = callHistory.find(h => h.id === id);
      if (historyItem) {
        elements.toolName.value = historyItem.toolName;
        elements.toolParams.value = formatJSON(historyItem.params);
        elements.resultJson.innerHTML = highlightJSON(formatJSON(historyItem.result));
      }
    });
  });
}

// Stats - Reset
elements.resetStats.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'RESET_STATS' }, (response) => {
    if (response?.success) {
      updateStats({
        toolStats: {},
        totalTokens: 0,
        totalRequests: 0,
        avgLatency: 0
      });
    }
  });
});

// Update stats display
function updateStats(stats) {
  elements.totalRequests.textContent = stats.totalRequests;
  elements.totalTokens.textContent = stats.totalTokens.toLocaleString();
  elements.avgLatency.textContent = Math.round(stats.avgLatency) + 'ms';
  
  // Render tool stats
  const toolStatsList = elements.toolStats.querySelector('.tool-stats-list');
  const toolNames = Object.keys(stats.toolStats);
  
  if (toolNames.length === 0) {
    toolStatsList.innerHTML = '<div class="empty-state"><p>No tool statistics yet</p></div>';
    return;
  }
  
  toolStatsList.innerHTML = toolNames.map(name => {
    const tool = stats.toolStats[name];
    return `
      <div class="tool-stat-item">
        <div class="tool-stat-name">${name}</div>
        <div class="tool-stat-details">
          <span>Calls: ${tool.calls}</span>
          <span>Tokens: ${tool.totalTokens.toLocaleString()}</span>
          <span>Avg Latency: ${Math.round(tool.avgLatency)}ms</span>
        </div>
      </div>
    `;
  }).join('');
}

// Update request count
function updateRequestCount() {
  elements.requestCount.textContent = requests.length + ' request' + (requests.length !== 1 ? 's' : '');
}

// Subscribe to traffic updates
chrome.runtime.sendMessage({ 
  type: 'SUBSCRIBE_TRAFFIC', 
  subscriberId 
});

// Listen for traffic updates
chrome.runtime.onMessage.addListener((message) => {
  if (message.subscriberId !== subscriberId) return;
  
  switch (message.event) {
    case 'requestAdded':
      requests.unshift(message.data);
      if (requests.length > 1000) requests.pop();
      filterRequests();
      updateRequestCount();
      break;
      
    case 'requestUpdated':
      const idx = requests.findIndex(r => r.id === message.data.id);
      if (idx !== -1) {
        requests[idx] = message.data;
        filterRequests();
      }
      break;
      
    case 'requestsCleared':
      requests = [];
      filteredRequests = [];
      renderRequestList();
      updateRequestCount();
      break;
      
    case 'statsUpdated':
      updateStats(message.data);
      break;
  }
});

// Initial data load
chrome.runtime.sendMessage({ type: 'GET_TRAFFIC' }, (response) => {
  if (response?.requests) {
    requests = response.requests;
    filterRequests();
    updateRequestCount();
  }
});

chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
  if (response) {
    updateStats(response);
  }
});

console.log('MCP DevTools panel initialized');
