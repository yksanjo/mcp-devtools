// MCP DevTools - Background Service Worker
// Handles communication between content scripts and DevTools panels

// Store for MCP traffic data
const mcpTrafficStore = {
  requests: [],
  maxRequests: 1000,
  
  addRequest(request) {
    this.requests.unshift(request);
    if (this.requests.length > this.maxRequests) {
      this.requests.pop();
    }
    this.notifyListeners('requestAdded', request);
  },
  
  clearRequests() {
    this.requests = [];
    this.notifyListeners('requestsCleared', null);
  },
  
  listeners: new Map(),
  
  addListener(id, callback) {
    this.listeners.set(id, callback);
  },
  
  removeListener(id) {
    this.listeners.delete(id);
  },
  
  notifyListeners(event, data) {
    this.listeners.forEach((callback) => {
      try {
        callback(event, data);
      } catch (e) {
        console.error('MCP DevTools: Listener error', e);
      }
    });
  }
};

// Stats tracking
const statsStore = {
  toolStats: {},
  totalTokens: 0,
  totalRequests: 0,
  avgLatency: 0,
  
  updateStats(toolName, tokens, latency) {
    if (!this.toolStats[toolName]) {
      this.toolStats[toolName] = {
        calls: 0,
        totalTokens: 0,
        totalLatency: 0,
        avgLatency: 0
      };
    }
    
    const stats = this.toolStats[toolName];
    stats.calls++;
    stats.totalTokens += tokens;
    stats.totalLatency += latency;
    stats.avgLatency = stats.totalLatency / stats.calls;
    
    this.totalTokens += tokens;
    this.totalRequests++;
    this.avgLatency = (this.avgLatency * (this.totalRequests - 1) + latency) / this.totalRequests;
    
    mcpTrafficStore.notifyListeners('statsUpdated', this.getStats());
  },
  
  getStats() {
    return {
      toolStats: this.toolStats,
      totalTokens: this.totalTokens,
      totalRequests: this.totalRequests,
      avgLatency: this.avgLatency
    };
  },
  
  resetStats() {
    this.toolStats = {};
    this.totalTokens = 0;
    this.totalRequests = 0;
    this.avgLatency = 0;
    mcpTrafficStore.notifyListeners('statsUpdated', this.getStats());
  }
};

// Listen for messages from content scripts and DevTools panels
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'MCP_REQUEST':
      // Parse MCP request and extract stats
      const request = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        direction: 'outgoing',
        method: message.method,
        params: message.params,
        toolName: message.params?.name || 'unknown',
        status: 'pending'
      };
      mcpTrafficStore.addRequest(request);
      
      // Store start time for latency calculation
      chrome.storage.local.set({ [`request_start_${request.id}`]: Date.now() });
      break;
      
    case 'MCP_RESPONSE':
      // Find matching request and update with response
      const requests = mcpTrafficStore.requests;
      const matchingRequest = requests.find(r => 
        r.method === message.method && r.status === 'pending'
      );
      
      if (matchingRequest) {
        matchingRequest.status = 'success';
        matchingRequest.response = message.response;
        matchingRequest.error = message.error;
        
        // Calculate latency
        const startTime = await new Promise(resolve => {
          chrome.storage.local.get(`request_start_${matchingRequest.id}`, (result) => {
            resolve(result[`request_start_${matchingRequest.id}`] || Date.now());
          });
        });
        matchingRequest.latency = Date.now() - startTime;
        
        // Extract token usage if available
        const tokens = message.response?.usage?.total_tokens || 
                      message.response?.usage?.prompt_tokens + 
                      message.response?.usage?.completion_tokens || 0;
        
        if (tokens > 0) {
          statsStore.updateStats(matchingRequest.toolName, tokens, matchingRequest.latency);
        }
        
        mcpTrafficStore.notifyListeners('requestUpdated', matchingRequest);
      }
      break;
      
    case 'GET_TRAFFIC':
      sendResponse({ requests: mcpTrafficStore.requests });
      break;
      
    case 'GET_STATS':
      sendResponse(statsStore.getStats());
      break;
      
    case 'CLEAR_TRAFFIC':
      mcpTrafficStore.clearRequests();
      sendResponse({ success: true });
      break;
      
    case 'RESET_STATS':
      statsStore.resetStats();
      sendResponse({ success: true });
      break;
      
    case 'SUBSCRIBE_TRAFFIC':
      const subscriberId = message.subscriberId;
      mcpTrafficStore.addListener(subscriberId, (event, data) => {
        chrome.runtime.sendMessage({
          type: 'TRAFFIC_UPDATE',
          subscriberId,
          event,
          data
        });
      });
      break;
      
    case 'UNSUBSCRIBE_TRAFFIC':
      mcpTrafficStore.removeListener(message.subscriberId);
      break;
  }
  
  return true;
});

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('MCP DevTools installed');
  }
});

console.log('MCP DevTools background service worker loaded');
