-- 添加企业信息字段到 users 表
ALTER TABLE users ADD COLUMN company_name TEXT;
ALTER TABLE users ADD COLUMN company_code TEXT;
ALTER TABLE users ADD COLUMN company_address TEXT;
ALTER TABLE users ADD COLUMN company_phone TEXT;
ALTER TABLE users ADD COLUMN bank_name TEXT;
ALTER TABLE users ADD COLUMN bank_account TEXT;
