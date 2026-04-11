# 数据库管理指南

本文档说明如何在多开发环境（台式机、笔记本等）之间管理数据库。

## 目录结构

```
token-service/
├── migrations/              # Schema 迁移文件（必提交到 Git）
│   ├── 001_init.sql
│   ├── 002_add_providers.sql
│   └── 003_add_company_fields.sql
├── fixtures/                # 测试数据（必提交到 Git）
│   ├── providers.json       # AI 服务商配置
│   ├── test-users.json      # 测试用户
│   └── test-keys.json       # 测试 API Keys
├── scripts/                 # 数据库管理脚本
│   ├── clean-db.js          # 清理本地数据库
│   ├── export-db.js         # 导出数据
│   └── import-fixtures.js   # 导入 fixtures
└── .wrangler/state/         # 本地数据库文件（已忽略，不提交）
```

## 快速开始

### 1. 新环境初始化（首次设置）

```bash
# 克隆代码后执行
git clone https://github.com/aiken/token-service.git
cd token-service
npm install

# 创建数据库表结构 + 导入种子数据
npm run db:reset:dev

# 或者分步执行
npm run db:migrate:all:dev    # 执行所有迁移
npm run db:seed:dev           # 导入种子数据
```

### 2. 日常开发

```bash
# 启动开发服务器
npm run dev           # 纯前端开发
npm run dev:cf        # 带 Cloudflare 功能

# 查看数据库
npx wrangler d1 execute token-service-db-dev --local --command="SELECT * FROM users"
```

## 数据库脚本说明

### Schema 迁移

| 命令 | 说明 |
|------|------|
| `npm run db:migrate:001:dev` | 执行初始迁移 |
| `npm run db:migrate:002:dev` | 添加 providers 表 |
| `npm run db:migrate:003:dev` | 添加公司信息字段 |
| `npm run db:migrate:all:dev` | 执行所有迁移 |

### 数据管理

| 命令 | 说明 |
|------|------|
| `npm run db:seed:dev` | 导入种子数据 |
| `npm run db:reset:dev` | **重置整个数据库**（清理+迁移+种子） |
| `npm run db:clean:dev` | 仅清理数据库文件 |
| `npm run db:import:dev` | 导入 fixtures 测试数据 |
| `npm run db:export:dev` | 导出数据到 fixtures/exported/ |

## 多环境同步策略

### 场景 1：新机器/新环境初始化

```bash
# 1. 拉取代码
git pull origin master

# 2. 重置数据库（自动清理旧数据、创建表、导入种子）
npm run db:reset:dev

# 3. （可选）导入额外测试数据
npm run db:import:dev
```

### 场景 2：Schema 变更（添加新表/字段）

```bash
# 1. 创建新的迁移文件
# migrations/004_add_new_table.sql

# 2. 本地测试迁移
npm run db:migrate:004:dev

# 3. 提交迁移文件到 Git
git add migrations/004_add_new_table.sql
git commit -m "feat: 添加 xxx 表"
git push

# 4. 其他环境拉取后执行新迁移
git pull
npm run db:migrate:004:dev
```

### 场景 3：导出生产环境配置同步到开发环境

```bash
# 在生产环境导出配置数据（providers 等）
npm run db:export:dev

# 将导出的文件复制到 fixtures/
cp fixtures/exported/providers.json fixtures/

# 提交到 Git
git add fixtures/providers.json
git commit -m "chore: 同步 providers 配置"
git push

# 其他环境拉取后导入
git pull
npm run db:import:dev
```

## .gitignore 配置

以下内容**不提交**到 Git：

```gitignore
# 本地数据库文件（环境相关）
.wrangler/state/
*.sqlite
*.sqlite-shm
*.sqlite-wal

# 导出的临时数据（可选）
fixtures/exported/
```

以下内容**必须提交**到 Git：

```
migrations/        # Schema 定义
fixtures/*.json    # 基础测试数据
scripts/           # 管理脚本
```

## 注意事项

1. **不要修改已执行的迁移文件** - 如果需要变更，创建新的迁移文件
2. **不要将用户数据提交到 Git** - fixtures/ 只放测试数据
3. **定期备份重要数据** - 使用 `npm run db:export:dev` 导出
4. **迁移前先在本地测试** - 确认无误后再应用到生产环境

## 常见问题

### Q: 数据库文件在哪里？
```
.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite
```

### Q: 如何查看数据库内容？
```bash
# 使用 wrangler CLI
npx wrangler d1 execute token-service-db-dev --local --command="SELECT * FROM users"

# 或者直接使用 SQLite 工具
sqlite3 .wrangler/state/v3/d1/xxx.sqlite
```

### Q: 如何重置数据库？
```bash
npm run db:reset:dev
```

这会清理所有数据并重新初始化。
