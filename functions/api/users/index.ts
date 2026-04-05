/// <reference path="../../types.d.ts" />
import { getUsers, createUser, updateUser } from '../../../lib/db';
import { initDatabase } from '../../../lib/db-init';

export const onRequest: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env } = context;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
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
      const users = await getUsers(env.DB);
      return Response.json({ success: true, data: users }, { headers });
    }

    if (request.method === 'POST') {
      const body = await request.json() as { email: string; name?: string };
      const { email, name } = body;

      if (!email) {
        return Response.json({ success: false, error: 'Email is required' }, { status: 400, headers });
      }

      const user = await createUser(env.DB, email, name || null);
      return Response.json({ success: true, data: user }, { headers });
    }

    if (request.method === 'PATCH') {
      const body = await request.json() as { id: number } & Record<string, unknown>;
      const { id, ...updateData } = body;

      if (!id) {
        return Response.json({ success: false, error: 'User ID is required' }, { status: 400, headers });
      }

      const user = await updateUser(env.DB, id, updateData);
      return Response.json({ success: true, data: user }, { headers });
    }

    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405, headers });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500, headers });
  }
};
