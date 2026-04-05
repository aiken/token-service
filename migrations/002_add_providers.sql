-- Provider configuration table
CREATE TABLE IF NOT EXISTS providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    base_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Provider keys (resource pool)
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
);

-- User API keys allocation (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_provider_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider_key_id INTEGER NOT NULL,
    allocated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_key_id) REFERENCES provider_keys(id) ON DELETE CASCADE,
    UNIQUE(user_id, provider_key_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_keys_provider ON provider_keys(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_keys_status ON provider_keys(status);
CREATE INDEX IF NOT EXISTS idx_provider_keys_allocated ON provider_keys(allocated_to);
CREATE INDEX IF NOT EXISTS idx_user_provider_keys_user ON user_provider_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_provider_keys_key ON user_provider_keys(provider_key_id);
