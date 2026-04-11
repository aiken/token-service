#!/usr/bin/env node
/**
 * 导入 fixtures 中的测试数据到本地数据库
 * 用于新环境初始化或重置测试数据
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const fixturesDir = path.join(__dirname, '..', 'fixtures');

console.log('📥 导入 fixtures 数据...\n');

// 导入 providers
function importProviders() {
  const providersFile = path.join(fixturesDir, 'providers.json');
  if (!fs.existsSync(providersFile)) {
    console.log('⚠️  providers.json 不存在，跳过');
    return;
  }

  const data = JSON.parse(fs.readFileSync(providersFile, 'utf-8'));
  const providers = data.providers || [];

  for (const p of providers) {
    try {
      const sql = `INSERT OR IGNORE INTO providers (id, name, code, base_url, status, description) 
        VALUES (${p.id}, '${p.name}', '${p.code}', '${p.base_url}', '${p.status}', '${p.description}')`;
      execSync(`npx wrangler d1 execute token-service-db-dev --local --command="${sql}"`, {
        cwd: path.join(__dirname, '..'),
        stdio: 'ignore'
      });
    } catch (e) {
      // 忽略重复插入错误
    }
  }
  console.log(`✅ Providers: 导入 ${providers.length} 条记录`);
}

// 导入测试用户
function importUsers() {
  const usersFile = path.join(fixturesDir, 'test-users.json');
  if (!fs.existsSync(usersFile)) {
    console.log('⚠️  test-users.json 不存在，跳过');
    return;
  }

  const data = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
  const users = data.users || [];
  let count = 0;

  for (const u of users) {
    try {
      const sql = `INSERT OR IGNORE INTO users 
        (email, name, status, company_name, company_code, company_address, company_phone, bank_name, bank_account, email_verified, created_at) 
        VALUES ('${u.email}', '${u.name}', '${u.status}', '${u.company_name}', '${u.company_code}', 
        '${u.company_address}', '${u.company_phone}', '${u.bank_name}', '${u.bank_account}', 1, datetime('now'))`;
      execSync(`npx wrangler d1 execute token-service-db-dev --local --command="${sql}"`, {
        cwd: path.join(__dirname, '..'),
        stdio: 'ignore'
      });
      count++;
    } catch (e) {
      console.log(`  跳过: ${u.email} (${e.message})`);
    }
  }
  console.log(`✅ Users: 导入 ${count} 条记录`);
}

// 主程序
try {
  importProviders();
  importUsers();
  console.log('\n🎉 数据导入完成！');
} catch (error) {
  console.error('\n❌ 导入失败:', error.message);
  process.exit(1);
}
