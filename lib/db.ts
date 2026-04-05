// D1 数据库操作封装

// ============ Providers ============
export async function getProviders(db: D1Database) {
  const result = await db
    .prepare('SELECT * FROM providers ORDER BY created_at DESC')
    .all();
  return result.results;
}

export async function getProviderById(db: D1Database, id: number) {
  const result = await db
    .prepare('SELECT * FROM providers WHERE id = ?')
    .bind(id)
    .first();
  return result;
}

export async function createProvider(db: D1Database, data: {
  name: string;
  code: string;
  base_url?: string;
  description?: string;
}) {
  const result = await db
    .prepare('INSERT INTO providers (name, code, base_url, description) VALUES (?, ?, ?, ?) RETURNING *')
    .bind(data.name, data.code, data.base_url || null, data.description || null)
    .first();
  return result;
}

export async function updateProvider(db: D1Database, id: number, data: {
  name?: string;
  code?: string;
  base_url?: string;
  status?: 'active' | 'inactive';
  description?: string;
}) {
  const sets: string[] = [];
  const values: (string | null)[] = [];
  
  if (data.name !== undefined) { sets.push('name = ?'); values.push(data.name); }
  if (data.code !== undefined) { sets.push('code = ?'); values.push(data.code); }
  if (data.base_url !== undefined) { sets.push('base_url = ?'); values.push(data.base_url); }
  if (data.status !== undefined) { sets.push('status = ?'); values.push(data.status); }
  if (data.description !== undefined) { sets.push('description = ?'); values.push(data.description); }
  sets.push('updated_at = datetime("now")');
  values.push(id.toString());
  
  const result = await db
    .prepare(`UPDATE providers SET ${sets.join(', ')} WHERE id = ? RETURNING *`)
    .bind(...values)
    .first();
  return result;
}

export async function deleteProvider(db: D1Database, id: number) {
  const result = await db
    .prepare('DELETE FROM providers WHERE id = ?')
    .bind(id)
    .run();
  return result.success;
}

// ============ Provider Keys ============
export async function getProviderKeys(db: D1Database, providerId?: number) {
  let stmt;
  if (providerId) {
    stmt = db.prepare('SELECT * FROM provider_keys WHERE provider_id = ? ORDER BY created_at DESC').bind(providerId);
  } else {
    stmt = db.prepare('SELECT * FROM provider_keys ORDER BY created_at DESC');
  }
  const result = await stmt.all();
  return result.results;
}

export async function getProviderKeyById(db: D1Database, id: number) {
  const result = await db
    .prepare('SELECT * FROM provider_keys WHERE id = ?')
    .bind(id)
    .first();
  return result;
}

export async function createProviderKey(db: D1Database, data: {
  provider_id: number;
  key_value: string;
  key_mask: string;
}) {
  const result = await db
    .prepare('INSERT INTO provider_keys (provider_id, key_value, key_mask) VALUES (?, ?, ?) RETURNING *')
    .bind(data.provider_id, data.key_value, data.key_mask)
    .first();
  return result;
}

export async function updateProviderKeyStatus(db: D1Database, id: number, status: 'available' | 'allocated' | 'disabled') {
  const result = await db
    .prepare('UPDATE provider_keys SET status = ? WHERE id = ? RETURNING *')
    .bind(status, id)
    .first();
  return result;
}

export async function deleteProviderKey(db: D1Database, id: number) {
  const result = await db
    .prepare('DELETE FROM provider_keys WHERE id = ?')
    .bind(id)
    .run();
  return result.success;
}

export async function allocateKeyToUser(db: D1Database, keyId: number, userId: number) {
  // Start transaction
  await db.prepare('BEGIN TRANSACTION').run();
  try {
    // Update key status
    await db.prepare('UPDATE provider_keys SET status = "allocated", allocated_to = ? WHERE id = ?')
      .bind(userId, keyId).run();
    // Create user_key mapping
    await db.prepare('INSERT INTO user_provider_keys (user_id, provider_key_id) VALUES (?, ?)')
      .bind(userId, keyId).run();
    await db.prepare('COMMIT').run();
    return true;
  } catch (e) {
    await db.prepare('ROLLBACK').run();
    throw e;
  }
}

export async function reclaimKeyFromUser(db: D1Database, keyId: number, userId: number) {
  // Start transaction
  await db.prepare('BEGIN TRANSACTION').run();
  try {
    // Update key status
    await db.prepare('UPDATE provider_keys SET status = "available", allocated_to = NULL WHERE id = ?')
      .bind(keyId).run();
    // Delete user_key mapping
    await db.prepare('DELETE FROM user_provider_keys WHERE user_id = ? AND provider_key_id = ?')
      .bind(userId, keyId).run();
    await db.prepare('COMMIT').run();
    return true;
  } catch (e) {
    await db.prepare('ROLLBACK').run();
    throw e;
  }
}

export async function getKeysByUserId(db: D1Database, userId: number) {
  const result = await db
    .prepare(`
      SELECT pk.*, p.name as provider_name 
      FROM provider_keys pk
      JOIN providers p ON pk.provider_id = p.id
      WHERE pk.allocated_to = ?
      ORDER BY pk.created_at DESC
    `)
    .bind(userId)
    .all();
  return result.results;
}

// ============ Users ============
export async function getUsers(db: D1Database) {
  const result = await db
    .prepare('SELECT id, email, name, status, email_verified, created_at FROM users ORDER BY created_at DESC')
    .all();
  return result.results;
}

export async function updateUser(db: D1Database, id: number, data: {
  name?: string;
  email?: string;
  status?: 'active' | 'inactive';
}) {
  const sets: string[] = [];
  const values: (string | null)[] = [];
  
  if (data.name !== undefined) { sets.push('name = ?'); values.push(data.name); }
  if (data.email !== undefined) { sets.push('email = ?'); values.push(data.email); }
  if (data.status !== undefined) { sets.push('status = ?'); values.push(data.status); }
  values.push(id.toString());
  
  const result = await db
    .prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ? RETURNING id, email, name, status, email_verified, created_at`)
    .bind(...values)
    .first();
  return result;
}

// ============ Original functions below ============

// 用户相关操作
export async function getUserByEmail(db: D1Database, email: string): Promise<Record<string, unknown> | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE email = ? AND status = "active"')
    .bind(email)
    .first() as Record<string, unknown> | null;
  return result;
}

export async function createUser(db: D1Database, email: string, name: string | null = null): Promise<Record<string, unknown>> {
  const result = await db
    .prepare('INSERT INTO users (email, name) VALUES (?, ?) RETURNING *')
    .bind(email, name)
    .first() as Record<string, unknown>;
  return result;
}

export async function getUserById(db: D1Database, id: number): Promise<Record<string, unknown> | null> {
  const result = await db
    .prepare('SELECT id, email, name, status, email_verified, created_at FROM users WHERE id = ?')
    .bind(id)
    .first() as Record<string, unknown> | null;
  return result;
}

// 验证码相关操作
export async function saveVerificationCode(db: D1Database, email: string, code: string, expiresInMinutes: number = 10) {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();
  await db
    .prepare('INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)')
    .bind(email, code, expiresAt)
    .run();
}

export async function verifyCode(db: D1Database, email: string, code: string): Promise<Record<string, unknown> | null> {
  const result = await db
    .prepare(`
      SELECT * FROM verification_codes 
      WHERE email = ? AND code = ? AND used = FALSE AND expires_at > datetime('now')
      ORDER BY created_at DESC LIMIT 1
    `)
    .bind(email, code)
    .first() as Record<string, unknown> | null;
  
  if (result) {
    await db
      .prepare('UPDATE verification_codes SET used = TRUE WHERE id = ?')
      .bind(result.id)
      .run();
  }
  
  return result;
}

// API Key 相关操作
export async function getApiKeysByUserId(db: D1Database, userId: number) {
  const result = await db
    .prepare('SELECT id, user_id, provider, key_name, key_mask, status, last_used_at, created_at FROM api_keys WHERE user_id = ? AND status != "deleted" ORDER BY created_at DESC')
    .bind(userId)
    .all();
  return result.results;
}

export async function createApiKey(db: D1Database, userId: number, provider: string, keyName: string, keyValue: string, keyMask: string) {
  const result = await db
    .prepare('INSERT INTO api_keys (user_id, provider, key_name, key_value, key_mask) VALUES (?, ?, ?, ?, ?) RETURNING id, user_id, provider, key_name, key_mask, status, last_used_at, created_at')
    .bind(userId, provider, keyName, keyValue, keyMask)
    .first();
  return result;
}

export async function deleteApiKey(db: D1Database, keyId: number, userId: number) {
  const result = await db
    .prepare('UPDATE api_keys SET status = "deleted", updated_at = datetime("now") WHERE id = ? AND user_id = ?')
    .bind(keyId, userId)
    .run();
  return result.success;
}

export async function getApiKeyById(db: D1Database, keyId: number, userId: number) {
  const result = await db
    .prepare('SELECT * FROM api_keys WHERE id = ? AND user_id = ? AND status = "active"')
    .bind(keyId, userId)
    .first();
  return result;
}

// 用量记录相关操作
export async function createUsageRecord(db: D1Database, data: {
  apiKeyId: number;
  recordDate: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  requestCount: number;
  costCny: number;
}) {
  const result = await db
    .prepare(`
      INSERT INTO usage_records (api_key_id, record_date, provider, prompt_tokens, completion_tokens, total_tokens, request_count, cost_cny)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(api_key_id, record_date) DO UPDATE SET
        prompt_tokens = excluded.prompt_tokens,
        completion_tokens = excluded.completion_tokens,
        total_tokens = excluded.total_tokens,
        request_count = excluded.request_count,
        cost_cny = excluded.cost_cny,
        updated_at = datetime('now')
      RETURNING *
    `)
    .bind(data.apiKeyId, data.recordDate, data.provider, data.promptTokens, data.completionTokens, data.totalTokens, data.requestCount, data.costCny)
    .first();
  return result;
}

export async function getUsageByDateRange(db: D1Database, userId: number, startDate: string, endDate: string): Promise<Record<string, unknown>[]> {
  const result = await db
    .prepare(`
      SELECT ur.*, ak.key_name 
      FROM usage_records ur
      JOIN api_keys ak ON ur.api_key_id = ak.id
      WHERE ak.user_id = ? AND ur.record_date BETWEEN ? AND ?
      ORDER BY ur.record_date DESC
    `)
    .bind(userId, startDate, endDate)
    .all();
  return result.results as Record<string, unknown>[];
}

export async function getUsageSummary(db: D1Database, userId: number) {
  const today = new Date().toISOString().split('T')[0];
  const todayResult = await db
    .prepare(`
      SELECT COALESCE(SUM(total_tokens), 0) as tokens, COALESCE(SUM(cost_cny), 0) as cost
      FROM usage_records ur
      JOIN api_keys ak ON ur.api_key_id = ak.id
      WHERE ak.user_id = ? AND ur.record_date = ?
    `)
    .bind(userId, today)
    .first() as { tokens: number; cost: number } | null;

  const monthStart = today.substring(0, 7) + '-01';
  const monthResult = await db
    .prepare(`
      SELECT COALESCE(SUM(total_tokens), 0) as tokens, COALESCE(SUM(cost_cny), 0) as cost
      FROM usage_records ur
      JOIN api_keys ak ON ur.api_key_id = ak.id
      WHERE ak.user_id = ? AND ur.record_date >= ?
    `)
    .bind(userId, monthStart)
    .first() as { tokens: number; cost: number } | null;

  const totalResult = await db
    .prepare(`
      SELECT COALESCE(SUM(total_tokens), 0) as tokens, COALESCE(SUM(cost_cny), 0) as cost
      FROM usage_records ur
      JOIN api_keys ak ON ur.api_key_id = ak.id
      WHERE ak.user_id = ?
    `)
    .bind(userId)
    .first() as { tokens: number; cost: number } | null;

  return {
    today: { tokens: Number(todayResult?.tokens || 0), cost: Number(todayResult?.cost || 0) },
    thisMonth: { tokens: Number(monthResult?.tokens || 0), cost: Number(monthResult?.cost || 0) },
    total: { tokens: Number(totalResult?.tokens || 0), cost: Number(totalResult?.cost || 0) },
  };
}

// 账单相关操作
export async function getBillsByUserId(db: D1Database, userId: number) {
  const result = await db
    .prepare('SELECT * FROM bills WHERE user_id = ? ORDER BY bill_year DESC, bill_month DESC')
    .bind(userId)
    .all();
  return result.results;
}

export async function createBill(db: D1Database, userId: number, year: number, month: number, tokens: number, cost: number) {
  const result = await db
    .prepare(`
      INSERT INTO bills (user_id, bill_year, bill_month, total_tokens, total_cost)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, bill_year, bill_month) DO UPDATE SET
        total_tokens = excluded.total_tokens,
        total_cost = excluded.total_cost
      RETURNING *
    `)
    .bind(userId, year, month, tokens, cost)
    .first();
  return result;
}

// 发票相关操作
export async function getInvoicesByUserId(db: D1Database, userId: number) {
  const result = await db
    .prepare('SELECT * FROM invoices WHERE user_id = ? ORDER BY invoice_year DESC, invoice_month DESC')
    .bind(userId)
    .all();
  return result.results;
}

export async function createInvoice(db: D1Database, data: {
  userId: number;
  year: number;
  month: number;
  amount: number;
  filePath: string;
  fileName: string;
}) {
  const result = await db
    .prepare(`
      INSERT INTO invoices (user_id, invoice_year, invoice_month, amount_cny, file_path, file_name)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, invoice_year, invoice_month) DO UPDATE SET
        amount_cny = excluded.amount_cny,
        file_path = excluded.file_path,
        file_name = excluded.file_name
      RETURNING *
    `)
    .bind(data.userId, data.year, data.month, data.amount, data.filePath, data.fileName)
    .first();
  return result;
}

// 邮件日志相关操作
export async function createEmailLog(db: D1Database, data: {
  userId: number;
  emailType: string;
  subject: string;
  content: string;
}): Promise<Record<string, unknown>> {
  const result = await db
    .prepare('INSERT INTO email_logs (user_id, email_type, subject, content) VALUES (?, ?, ?, ?) RETURNING *')
    .bind(data.userId, data.emailType, data.subject, data.content)
    .first() as Record<string, unknown>;
  return result;
}

export async function updateEmailLogStatus(db: D1Database, logId: number, status: string, errorMsg?: string) {
  await db
    .prepare('UPDATE email_logs SET status = ?, error_msg = ? WHERE id = ?')
    .bind(status, errorMsg || null, logId)
    .run();
}

// 获取所有活跃用户（用于定时任务）
export async function getAllActiveUsers(db: D1Database): Promise<Record<string, unknown>[]> {
  const result = await db
    .prepare('SELECT * FROM users WHERE status = "active"')
    .all();
  return result.results as Record<string, unknown>[];
}

// 获取所有API Keys（用于定时同步）
export async function getAllActiveApiKeys(db: D1Database): Promise<Record<string, unknown>[]> {
  const result = await db
    .prepare('SELECT * FROM api_keys WHERE status = "active"')
    .all();
  return result.results as Record<string, unknown>[];
}
