#!/usr/bin/env node
/**
 * 清理本地开发数据库
 * 删除 .wrangler/state 目录下的 SQLite 文件
 */

const fs = require('fs');
const path = require('path');

const stateDir = path.join(__dirname, '..', '.wrangler', 'state', 'v3', 'd1');

console.log('🧹 清理本地数据库...');

if (!fs.existsSync(stateDir)) {
  console.log('✅ 本地数据库目录不存在，无需清理');
  process.exit(0);
}

try {
  const files = fs.readdirSync(stateDir);
  let deletedCount = 0;

  for (const file of files) {
    if (file.endsWith('.sqlite') || file.endsWith('.sqlite-shm') || file.endsWith('.sqlite-wal')) {
      const filePath = path.join(stateDir, file);
      fs.unlinkSync(filePath);
      console.log(`  删除: ${file}`);
      deletedCount++;
    }
  }

  console.log(`✅ 已清理 ${deletedCount} 个数据库文件`);
} catch (error) {
  console.error('❌ 清理失败:', error.message);
  process.exit(1);
}
