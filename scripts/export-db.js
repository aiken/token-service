#!/usr/bin/env node
/**
 * 导出本地数据库中的 providers 和 users 数据
 * 用于跨环境同步配置数据
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const exportDir = path.join(__dirname, '..', 'fixtures', 'exported');

// 确保导出目录存在
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

console.log('📤 导出数据库数据...\n');

const tables = ['providers', 'users', 'api_keys'];

for (const table of tables) {
  try {
    const result = execSync(
      `npx wrangler d1 execute token-service-db-dev --local --command="SELECT * FROM ${table}" --json`,
      { encoding: 'utf-8', cwd: path.join(__dirname, '..') }
    );

    const data = JSON.parse(result);
    const outputFile = path.join(exportDir, `${table}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log(`✅ ${table}: 导出 ${Array.isArray(data) ? data.length : 0} 条记录`);
  } catch (error) {
    console.log(`⚠️  ${table}: ${error.message.includes('no such table') ? '表不存在' : '导出失败'}`);
  }
}

console.log(`\n📁 导出文件位置: ${exportDir}`);
