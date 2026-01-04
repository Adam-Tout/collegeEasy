import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { CANVAS_API_TOOLS, findMatchingTools, CanvasAPITool } from './canvas-tools';

interface CanvasAgentRequest {
  query: string;
  canvasToken: string;
  canvasDomain: string;
  selectedToolId?: string;
  toolParameters?: Record<string, any>;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, canvasToken, canvasDomain, selectedToolId, toolParameters = {} }: CanvasAgentRequest = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!canvasToken || !canvasDomain) {
      return res.status(400).json({ 
        error: 'Canvas token and domain are required',
        suggestedTools: findMatchingTools(query)
      });
    }

    // If tool is already selected, execute it
    if (selectedToolId) {
      const tool = CANVAS_API_TOOLS.find(t => t.id === selectedToolId);
      if (!tool) {
        return res.status(400).json({ error: `Tool ${selectedToolId} not found` });
      }

      // Build endpoint URL
      let endpoint = tool.endpoint;
      
      // Replace path parameters
      for (const param of tool.parameters) {
        if (param.required && !toolParameters[param.name]) {
          return res.status(400).json({ 
            error: `Missing required parameter: ${param.name}`,
            tool: tool
          });
        }
        if (toolParameters[param.name]) {
          endpoint = endpoint.replace(`{${param.name}}`, toolParameters[param.name]);
        }
      }

      // Build query string for GET requests
      const queryParams: string[] = [];
      if (tool.method === 'GET') {
        for (const param of tool.parameters) {
          if (param.name !== 'course_id' && param.name !== 'assignment_id' && 
              param.name !== 'user_id' && param.name !== 'file_id' &&
              param.name !== 'module_id' && param.name !== 'topic_id' &&
              param.name !== 'quiz_id' && toolParameters[param.name]) {
            if (Array.isArray(toolParameters[param.name])) {
              toolParameters[param.name].forEach((val: any) => {
                queryParams.push(`${param.name}[]=${encodeURIComponent(val)}`);
              });
            } else {
              queryParams.push(`${param.name}=${encodeURIComponent(toolParameters[param.name])}`);
            }
          }
        }
      }

      const baseURL = `https://${canvasDomain}/api/v1`;
      const url = `${baseURL}${endpoint}${queryParams.length > 0 ? '?' + queryParams.join('&') : ''}`;

      console.log('[CanvasAgent] Executing tool:', {
        tool: tool.name,
        endpoint: url,
        method: tool.method
      });

      // Make Canvas API request
      const response = await axios({
        method: tool.method,
        url,
        headers: {
          'Authorization': `Bearer ${canvasToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      return res.status(200).setHeader('Access-Control-Allow-Origin', '*').json({
        success: true,
        tool: {
          id: tool.id,
          name: tool.name
        },
        data: response.data,
        endpoint: url
      });

    } else {
      // No tool selected - suggest matching tools
      const matchingTools = findMatchingTools(query);
      
      return res.status(200).setHeader('Access-Control-Allow-Origin', '*').json({
        success: true,
        query,
        suggestedTools: matchingTools.map(tool => ({
          id: tool.id,
          name: tool.name,
          description: tool.description,
          endpoint: tool.endpoint,
          method: tool.method,
          parameters: tool.parameters,
          exampleUseCases: tool.exampleUseCases
        })),
        allTools: CANVAS_API_TOOLS.map(tool => ({
          id: tool.id,
          name: tool.name,
          description: tool.description
        }))
      });
    }

  } catch (error: any) {
    console.error('[CanvasAgent] Error:', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data
    });

    return res.status(500).setHeader('Access-Control-Allow-Origin', '*').json({
      error: error?.message || 'Internal server error',
      details: error?.response?.data || undefined
    });
  }
}


