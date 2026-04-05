/// <reference path="../../../types.d.ts" />
import { getProviderById, updateProvider, deleteProvider } from '../../../../lib/db';

export const onRequest: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env, params } = context;
  const id = parseInt(params.id as string);
  
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
    if (request.method === 'GET') {
      const provider = await getProviderById(env.DB, id);
      if (!provider) {
        return Response.json({ success: false, error: 'Provider not found' }, { status: 404, headers });
      }
      return Response.json({ success: true, data: provider }, { headers });
    }

    if (request.method === 'PUT') {
      const body = await request.json() as Record<string, unknown>;
      const provider = await updateProvider(env.DB, id, body);
      if (!provider) {
        return Response.json({ success: false, error: 'Provider not found' }, { status: 404, headers });
      }
      return Response.json({ success: true, data: provider }, { headers });
    }

    if (request.method === 'DELETE') {
      await deleteProvider(env.DB, id);
      return Response.json({ success: true }, { headers });
    }

    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405, headers });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500, headers });
  }
};
