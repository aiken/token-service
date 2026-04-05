/// <reference path="../../../../../types.d.ts" />
import { getProviders, updateProvider, deleteProvider } from '../../../../../lib/db';
import { initDatabase } from '../../../../../lib/db-init';

export const onRequest: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env, params } = context;
  const code = params.code as string;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    await initDatabase(env.DB);

    // Get provider by code
    const allProviders = await getProviders(env.DB) as Array<{ id: number; code: string; name: string; description?: string; base_url?: string; status?: string; created_at?: string; updated_at?: string }>;
    const provider = allProviders.find(p => p.code === code);

    if (request.method === 'GET') {
      if (!provider) {
        return Response.json({ success: false, error: 'Provider not found' }, { status: 404, headers });
      }
      return Response.json({ success: true, data: provider }, { headers });
    }

    if (!provider) {
      return Response.json({ success: false, error: 'Provider not found' }, { status: 404, headers });
    }

    if (request.method === 'PUT') {
      const body = await request.json() as Record<string, unknown>;
      const updated = await updateProvider(env.DB, provider.id, body);
      return Response.json({ success: true, data: updated }, { headers });
    }

    if (request.method === 'DELETE') {
      await deleteProvider(env.DB, provider.id);
      return Response.json({ success: true }, { headers });
    }

    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405, headers });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500, headers });
  }
};
