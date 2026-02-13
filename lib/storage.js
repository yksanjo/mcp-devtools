// MCP DevTools - Storage Utility
// Handles local storage operations for the extension

const Storage = {
  // Storage keys
  KEYS: {
    TRAFFIC: 'mcp_devtools_traffic',
    STATS: 'mcp_devtools_stats',
    SETTINGS: 'mcp_devtools_settings',
    PLAYGROUND_HISTORY: 'mcp_devtools_playground_history'
  },
  
  // Get item from storage
  async get(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        resolve(result[key] || null);
      });
    });
  },
  
  // Set item in storage
  async set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve(true);
      });
    });
  },
  
  // Remove item from storage
  async remove(key) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, () => {
        resolve(true);
      });
    });
  },
  
  // Clear all storage
  async clear() {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve(true);
      });
    });
  },
  
  // Get traffic data
  async getTraffic() {
    const data = await this.get(this.KEYS.TRAFFIC);
    return data || [];
  },
  
  // Save traffic data
  async saveTraffic(requests) {
    // Only keep last 1000 requests
    const trimmed = requests.slice(0, 1000);
    return this.set(this.KEYS.TRAFFIC, trimmed);
  },
  
  // Get stats
  async getStats() {
    const data = await this.get(this.KEYS.STATS);
    return data || {
      toolStats: {},
      totalTokens: 0,
      totalRequests: 0,
      avgLatency: 0
    };
  },
  
  // Save stats
  async saveStats(stats) {
    return this.set(this.KEYS.STATS, stats);
  },
  
  // Get settings
  async getSettings() {
    const data = await this.get(this.KEYS.SETTINGS);
    return data || {
      maxRequests: 1000,
      autoScroll: true,
      theme: 'dark'
    };
  },
  
  // Save settings
  async saveSettings(settings) {
    return this.set(this.KEYS.SETTINGS, settings);
  },
  
  // Get playground history
  async getPlaygroundHistory() {
    const data = await this.get(this.KEYS.PLAYGROUND_HISTORY);
    return data || [];
  },
  
  // Save playground history
  async savePlaygroundHistory(history) {
    // Only keep last 20 calls
    const trimmed = history.slice(0, 20);
    return this.set(this.KEYS.PLAYGROUND_HISTORY, trimmed);
  },
  
  // Export data (for debugging)
  async exportData() {
    const traffic = await this.getTraffic();
    const stats = await this.getStats();
    const settings = await this.getSettings();
    const history = await this.getPlaygroundHistory();
    
    return {
      traffic,
      stats,
      settings,
      history,
      exportedAt: new Date().toISOString()
    };
  },
  
  // Import data
  async importData(data) {
    if (data.traffic) {
      await this.saveTraffic(data.traffic);
    }
    if (data.stats) {
      await this.saveStats(data.stats);
    }
    if (data.settings) {
      await this.saveSettings(data.settings);
    }
    if (data.history) {
      await this.savePlaygroundHistory(data.history);
    }
    return true;
  }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.MCPDevToolsStorage = Storage;
}
