/// <reference path="../../../types.d.ts" />
import { 
  getProviderKeyById, 
  updateProviderKeyStatus, 
  deleteProviderKey,
  allocateKeyToUser,
  reclaimKeyFromUser 
} from '../../../../lib/db';

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
      const key = await getProviderKeyById(env.DB, id);
      if (!key) {
        return Response.json({ success: false, error: 'Key not found' }, { status: 404, headers });
      }
      return Response.json({ success: true, data: key }, { headers });
    }

    if (request.method === 'PUT') {
      const body = await request.json() as { action: string; user_id?: number };
      const { action, user_id } = body;

      if (action === 'allocate' && user_id) {
        await allocateKeyToUser(env.DB, id, user_id);
        return Response.json({ success: true, message: 'Key allocated' }, { headers });
      }

      if (action === 'reclaim' && user_id) {
        await reclaimKeyFromUser(env.DB, id, user_id);
        return Response.json({ success: true, message: 'Key reclaimed' }, { headers });
      }

      if (action === 'toggle_status') {
        const key = await getProviderKeyById(env.DB, id) as { status: string } | null;
        if (!key) {
          return Response.json({ success: false, error: 'Key not found' }, { status: 404, headers });
        }
        const newStatus: 'available' | 'disabled' = key.status === 'disabled' ? 'available' : 'disabled';
        const updated = await updateProviderKeyStatus(env.DB, id, newStatus);
        return Response.json({ success: true, data: updated }, { headers });
      }

      return Response.json({ success: false, error: 'Invalid action' }, { status: 400, headers });
    }

    if (request.method === 'DELETE') {
      await deleteProviderKey(env.DB, id);
      return Response.json({ success: true }, { headers });
    }

    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405, headers });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500, headers });
  }
};
