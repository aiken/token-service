/// <reference path="../../types.d.ts" />
import { getProviderKeys, createProviderKey } from '../../../lib/db';
import { initDatabase } from '../../../lib/db-init';

export const onRequest: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env } = context;
  
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
    // Initialize database on first request
    await initDatabase(env.DB);

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const providerId = url.searchParams.get('provider_id');
      const keys = await getProviderKeys(env.DB, providerId ? parseInt(providerId) : undefined);
      
      // Join with providers to get provider_code
      const keysWithCode = await Promise.all(keys.map(async (key: Record<string, unknown>) => {
        const provider = await env.DB
          .prepare('SELECT code FROM providers WHERE id = ?')
          .bind(key.provider_id)
          .first() as { code: string } | null;
        return {
          ...key,
          provider_id: provider?.code || String(key.provider_id),
        };
      }));
      
      return Response.json({ success: true, data: keysWithCode }, { headers });
    }

    if (request.method === 'POST') {
      const body = await request.json() as { provider_id: number; keys: Array<{ key_value: string; key_mask: string }> };
      const { provider_id, keys } = body;

      if (!provider_id || !Array.isArray(keys) || keys.length === 0) {
        return Response.json({ success: false, error: 'Provider ID and keys array are required' }, { status: 400, headers });
      }

      const createdKeys = [];
      for (const keyData of keys) {
        const key = await createProviderKey(env.DB, {
          provider_id,
          key_value: keyData.key_value,
          key_mask: keyData.key_mask,
        });
        createdKeys.push(key);
      }

      return Response.json({ success: true, data: createdKeys }, { headers });
    }

    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405, headers });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500, headers });
  }
};
