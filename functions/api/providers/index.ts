/// <reference path="../../types.d.ts" />
import { getProviders, createProvider } from '../../../lib/db';

export const onRequest: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env } = context;
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    if (request.method === 'GET') {
      const providers = await getProviders(env.DB);
      return Response.json({ success: true, data: providers }, { headers });
    }

    if (request.method === 'POST') {
      const body = await request.json() as { name: string; code: string; base_url?: string; description?: string };
      const { name, code, base_url, description } = body;

      if (!name || !code) {
        return Response.json({ success: false, error: 'Name and code are required' }, { status: 400, headers });
      }

      const provider = await createProvider(env.DB, { name, code, base_url, description });
      return Response.json({ success: true, data: provider }, { headers });
    }

    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405, headers });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500, headers });
  }
};
