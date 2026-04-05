// Database initialization - runs on first API call
export async function initDatabase(db: D1Database) {
  try {
    // Check if users table exists
    await db.prepare('SELECT 1 FROM users LIMIT 1').run();
  } catch {
    // Table doesn't exist, create all tables
    console.log('Initializing database...');
    
    // Create users table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        status TEXT DEFAULT 'active',
        email_verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        company_name TEXT,
        company_code TEXT,
        company_address TEXT,
        company_phone TEXT,
        bank_name TEXT,
        bank_account TEXT
      )
    `).run();

    // Create providers table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS providers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        base_url TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Create provider_keys table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS provider_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider_id INTEGER NOT NULL,
        key_value TEXT NOT NULL,
        key_mask TEXT NOT NULL,
        status TEXT DEFAULT 'available' CHECK (status IN ('available', 'allocated', 'disabled')),
        current_usage INTEGER DEFAULT 0,
        allocated_to INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
        FOREIGN KEY (allocated_to) REFERENCES users(id) ON DELETE SET NULL
      )
    `).run();

    // Create user_provider_keys table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS user_provider_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        provider_key_id INTEGER NOT NULL,
        allocated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_key_id) REFERENCES provider_keys(id) ON DELETE CASCADE,
        UNIQUE(user_id, provider_key_id)
      )
    `).run();

    // Create indexes
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_provider_keys_provider ON provider_keys(provider_id)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_provider_keys_status ON provider_keys(status)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_provider_keys_allocated ON provider_keys(allocated_to)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_user_provider_keys_user ON user_provider_keys(user_id)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_user_provider_keys_key ON user_provider_keys(provider_key_id)').run();

    // Check if providers exist
    const providerCount = await db.prepare('SELECT COUNT(*) as count FROM providers').first() as { count: number } | null;
    
    if (!providerCount || providerCount.count === 0) {
      // Insert default providers
      const providers = [
        { name: 'Kimi', code: 'kimi', base_url: 'https://api.moonshot.cn', description: '月之暗面大模型' },
        { name: 'GLM', code: 'glm', base_url: 'https://open.bigmodel.cn', description: '智谱AI大模型' },
        { name: 'Claude', code: 'claude', base_url: 'https://api.anthropic.com', description: 'Anthropic Claude' },
        { name: 'Seedance 2.0', code: 'seedance', base_url: 'https://api.seedance.ai', description: 'Seedance视频生成' },
      ];

      for (const p of providers) {
        await db.prepare(`
          INSERT INTO providers (name, code, base_url, description, status) 
          VALUES (?, ?, ?, ?, 'active')
        `).bind(p.name, p.code, p.base_url, p.description).run();
      }
    }

    // Check if demo user exists
    const userCount = await db.prepare('SELECT COUNT(*) as count FROM users').first() as { count: number } | null;
    
    if (!userCount || userCount.count === 0) {
      // Insert demo user
      await db.prepare(`
        INSERT INTO users (email, name, company_name, company_code, company_address, company_phone, status, email_verified) 
        VALUES ('120083449@qq.com', '孙鹏飞', '北京墨丘科技有限公司', '91110108MA006A322A', '北京市海淀区花园路2号2号楼四层407室', '13683600172', 'active', 1)
      `).run();
    }

    console.log('Database initialized successfully');
    return;
  }

  // Database already exists, check if providers need to be added
  try {
    const providerCount = await db.prepare('SELECT COUNT(*) as count FROM providers').first() as { count: number } | null;
    if (!providerCount || providerCount.count === 0) {
      // Insert default providers
      const providers = [
        { name: 'Kimi', code: 'kimi', base_url: 'https://api.moonshot.cn', description: '月之暗面大模型' },
        { name: 'GLM', code: 'glm', base_url: 'https://open.bigmodel.cn', description: '智谱AI大模型' },
        { name: 'Claude', code: 'claude', base_url: 'https://api.anthropic.com', description: 'Anthropic Claude' },
        { name: 'Seedance 2.0', code: 'seedance', base_url: 'https://api.seedance.ai', description: 'Seedance视频生成' },
      ];

      for (const p of providers) {
        await db.prepare(`
          INSERT INTO providers (name, code, base_url, description, status) 
          VALUES (?, ?, ?, ?, 'active')
        `).bind(p.name, p.code, p.base_url, p.description).run();
      }
      console.log('Default providers added');
    }
  } catch {
    // providers table might not exist yet
  }

  // Check if demo user needs to be added
  try {
    const userCount = await db.prepare('SELECT COUNT(*) as count FROM users').first() as { count: number } | null;
    if (!userCount || userCount.count === 0) {
      await db.prepare(`
        INSERT INTO users (email, name, company_name, company_code, company_address, company_phone, status, email_verified) 
        VALUES ('120083449@qq.com', '孙鹏飞', '北京墨丘科技有限公司', '91110108MA006A322A', '北京市海淀区花园路2号2号楼四层407室', '13683600172', 'active', 1)
      `).run();
      console.log('Demo user added');
    }
  } catch {
    // users table might not exist yet
  }
}
