// MCP DevTools - Popup Script

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const requestCount = document.getElementById('request-count');
  const tokenCount = document.getElementById('token-count');
  const latency = document.getElementById('latency');
  const openDevtools = document.getElementById('open-devtools');
  const clearData = document.getElementById('clear-data');
  const linkTraffic = document.getElementById('link-traffic');
  const linkPlayground = document.getElementById('link-playground');
  const linkStats = document.getElementById('link-stats');
  
  // Load stats
  function loadStats() {
    chrome.runtime.sendMessage({ type: 'GET_STATS' }, (stats) => {
      if (stats) {
        requestCount.textContent = stats.totalRequests || 0;
        tokenCount.textContent = (stats.totalTokens || 0).toLocaleString();
        latency.textContent = Math.round(stats.avgLatency || 0) + 'ms';
      }
    });
    
    chrome.runtime.sendMessage({ type: 'GET_TRAFFIC' }, (response) => {
      if (response?.requests) {
        requestCount.textContent = response.requests.length;
      }
    });
  }
  
  // Open DevTools
  openDevtools.addEventListener('click', () => {
    chrome.devtools.panels.create(
      'MCP DevTools',
      'icons/icon16.png',
      'devtools.html',
      (panel) => {
        console.log('MCP DevTools panel created');
      }
    );
  });
  
  // Clear all data
  clearData.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all MCP DevTools data?')) {
      chrome.runtime.sendMessage({ type: 'CLEAR_TRAFFIC' }, () => {
        chrome.runtime.sendMessage({ type: 'RESET_STATS' }, () => {
          loadStats();
        });
      });
    }
  });
  
  // Quick links (these would open the specific panel in DevTools)
  linkTraffic.addEventListener('click', (e) => {
    e.preventDefault();
    // Open DevTools with traffic panel
    chrome.devtools.panels.create(
      'MCP DevTools',
      'icons/icon16.png',
      'devtools.html',
      (panel) => {
        panel.onShown.addListener((window) => {
          // Trigger traffic panel
        });
      }
    );
  });
  
  linkPlayground.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.devtools.panels.create(
      'MCP DevTools',
      'icons/icon16.png',
      'devtools.html',
      null
    );
  });
  
  linkStats.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.devtools.panels.create(
      'MCP DevTools',
      'icons/icon16.png',
      'devtools.html',
      null
    );
  });
  
  // Initial load
  loadStats();
});
