PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    status TEXT DEFAULT 'active', 
    email_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
, company_name TEXT, company_code TEXT, company_address TEXT, company_phone TEXT, bank_name TEXT, bank_account TEXT);
INSERT INTO "users" VALUES(1,'120083449@qq.com','孙鹏飞','active',1,'2026-04-05 15:39:58','2026-04-05 15:39:58','北京墨丘科技有限公司','91110108MA006A322A','北京市海淀区花园路2号2号楼四层407室','13683600172',NULL,NULL);
CREATE TABLE api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider TEXT NOT NULL, 
    key_name TEXT NOT NULL, 
    key_value TEXT NOT NULL, 
    key_mask TEXT, 
    status TEXT DEFAULT 'active', 
    last_used_at DATETIME, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE usage_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER NOT NULL,
    record_date DATE NOT NULL,
    provider TEXT NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    request_count INTEGER DEFAULT 0,
    cost_cny DECIMAL(10,4) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id),
    UNIQUE(api_key_id, record_date)
);
CREATE TABLE bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    bill_month INTEGER NOT NULL, 
    bill_year INTEGER NOT NULL,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending', 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, bill_year, bill_month)
);
CREATE TABLE invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    invoice_month INTEGER NOT NULL, 
    invoice_year INTEGER NOT NULL,
    amount_cny DECIMAL(10,2) NOT NULL,
    file_path TEXT NOT NULL, 
    file_name TEXT NOT NULL,
    status TEXT DEFAULT 'available', 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, invoice_year, invoice_month)
);
CREATE TABLE email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    email_type TEXT NOT NULL, 
    subject TEXT NOT NULL,
    content TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending', 
    error_msg TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT DEFAULT 'login', 
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    base_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "providers" VALUES(1,'Kimi','kimi','https://api.moonshot.cn','active','月之暗面大模型','2026-04-05 15:51:08','2026-04-05 15:51:08');
INSERT INTO "providers" VALUES(2,'GLM','glm','https://open.bigmodel.cn','active','智谱AI大模型','2026-04-05 15:51:08','2026-04-05 15:51:08');
INSERT INTO "providers" VALUES(3,'Claude','claude','https://api.anthropic.com','active','Anthropic Claude','2026-04-05 15:51:08','2026-04-05 15:51:08');
INSERT INTO "providers" VALUES(4,'Seedance 2.0','seedance','https://api.seedance.ai','active','Seedance视频生成','2026-04-05 15:51:08','2026-04-05 15:51:08');
CREATE TABLE provider_keys (
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
CREATE TABLE user_provider_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider_key_id INTEGER NOT NULL,
    allocated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_key_id) REFERENCES provider_keys(id) ON DELETE CASCADE,
    UNIQUE(user_id, provider_key_id)
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('users',1);
INSERT INTO "sqlite_sequence" VALUES('providers',4);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_usage_records_api_key_id ON usage_records(api_key_id);
CREATE INDEX idx_usage_records_date ON usage_records(record_date);
CREATE INDEX idx_bills_user_id ON bills(user_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_verification_codes_email ON verification_codes(email);
CREATE INDEX idx_provider_keys_provider ON provider_keys(provider_id);
CREATE INDEX idx_provider_keys_status ON provider_keys(status);
CREATE INDEX idx_provider_keys_allocated ON provider_keys(allocated_to);
CREATE INDEX idx_user_provider_keys_user ON user_provider_keys(user_id);
CREATE INDEX idx_user_provider_keys_key ON user_provider_keys(provider_key_id);