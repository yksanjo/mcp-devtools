// MCP DevTools - MCP Protocol Parser
// Parses and validates MCP protocol messages

const MCPParser = {
  // MCP Protocol Methods
  METHODS: {
    // Tools
    TOOLS_LIST: 'tools/list',
    TOOLS_CALL: 'tools/call',
    TOOLS_PREPARE: 'tools/prepare',
    
    // Resources
    RESOURCES_LIST: 'resources/list',
    RESOURCES_READ: 'resources/read',
    RESOURCES_SUBSCRIBE: 'resources/subscribe',
    RESOURCES_UNSUBSCRIBE: 'resources/unsubscribe',
    
    // Prompts
    PROMPTS_LIST: 'prompts/list',
    PROMPTS_GET: 'prompts/get',
    
    // Logging
    LOGGING_SET_LEVEL: 'logging/setLevel',
    
    // Initialization
    INITIALIZE: 'initialize',
    INITIALIZED: 'initialized'
  },
  
  // Parse JSON-RPC request
  parseRequest(data) {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (!parsed.jsonrpc || parsed.jsonrpc !== '2.0') {
        return { valid: false, error: 'Invalid JSON-RPC version' };
      }
      
      if (!parsed.method) {
        return { valid: false, error: 'Missing method' };
      }
      
      return {
        valid: true,
        id: parsed.id,
        method: parsed.method,
        params: parsed.params || {},
        isNotification: !parsed.id
      };
    } catch (e) {
      return { valid: false, error: e.message };
    }
  },
  
  // Parse JSON-RPC response
  parseResponse(data) {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (!parsed.jsonrpc || parsed.jsonrpc !== '2.0') {
        return { valid: false, error: 'Invalid JSON-RPC version' };
      }
      
      if (parsed.error) {
        return {
          valid: true,
          id: parsed.id,
          error: parsed.error
        };
      }
      
      return {
        valid: true,
        id: parsed.id,
        result: parsed.result
      };
    } catch (e) {
      return { valid: false, error: e.message };
    }
  },
  
  // Categorize method
  categorizeMethod(method) {
    if (!method) return 'unknown';
    
    if (method.startsWith('tools/')) return 'tools';
    if (method.startsWith('resources/')) return 'resources';
    if (method.startsWith('prompts/')) return 'prompts';
    if (method.startsWith('logging/')) return 'logging';
    if (method === 'initialize') return 'initialization';
    
    return 'other';
  },
  
  // Extract tool name from params
  extractToolName(params) {
    if (!params) return null;
    
    if (params.name) return params.name;
    if (params.tool) return params.tool.name;
    
    return null;
  },
  
  // Estimate token count (rough approximation)
  estimateTokens(text) {
    if (!text) return 0;
    
    // Rough estimation: 1 token ≈ 4 characters for English
    return Math.ceil(text.length / 4);
  },
  
  // Format method for display
  formatMethod(method) {
    if (!method) return 'Unknown';
    
    return method
      .split('/')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' - ');
  },
  
  // Validate tool call params
  validateToolParams(toolName, params) {
    const errors = [];
    
    if (!toolName || typeof toolName !== 'string') {
      errors.push('Tool name is required');
    }
    
    if (params && typeof params !== 'object') {
      errors.push('Params must be an object');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  // Create JSON-RPC request
  createRequest(method, params, id = null) {
    const request = {
      jsonrpc: '2.0',
      method
    };
    
    if (params) {
      request.params = params;
    }
    
    if (id !== null) {
      request.id = id;
    }
    
    return request;
  },
  
  // Create JSON-RPC response
  createResponse(id, result) {
    return {
      jsonrpc: '2.0',
      id,
      result
    };
  },
  
  // Create JSON-RPC error
  createError(id, code, message, data = null) {
    const error = {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message
      }
    };
    
    if (data) {
      error.error.data = data;
    }
    
    return error;
  }
};

// Error codes
MCPParser.ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  SERVER_ERROR: -32000
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.MCPParser = MCPParser;
}
