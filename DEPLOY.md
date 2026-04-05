# Token Service - 部署指南

## 快速测试

### 方法1：使用 Node.js 开发服务器
```bash
cd token-service
npm run dev
# 访问 http://localhost:3000
```

### 方法2：使用 npx serve（推荐）
```bash
cd token-service/dist
npx serve -l 8080
# 访问 http://localhost:8080
```

### 方法3：使用 Python
```bash
cd token-service/dist
python -m http.server 8080
# 访问 http://localhost:8080
```

## 部署到 Cloudflare Pages

### 1. 准备工作

安装 Wrangler CLI：
```bash
npm install -g wrangler
```

登录 Cloudflare：
```bash
wrangler login
```

### 2. 创建 D1 数据库

```bash
wrangler d1 create token-service-db
```

记录返回的 database_id，更新 `wrangler.toml`：
```toml
[[env.production.d1_databases]]
binding = "DB"
database_name = "token-service-db"
database_id = "your-database-id-here"
```

### 3. 运行数据库迁移

```bash
wrangler d1 execute token-service-db --file=./migrations/001_init.sql
```

### 4. 创建 R2 存储桶（用于发票存储）

```bash
wrangler r2 bucket create token-service-invoices
```

### 5. 设置环境变量

```bash
wrangler secret put JWT_SECRET
# 输入: your-super-secret-jwt-key

wrangler secret put ENCRYPTION_KEY
# 输入: your-encryption-key-32chars-long

wrangler secret put RESEND_API_KEY
# 输入: your-resend-api-key
```

### 6. 构建并部署

```bash
cd token-service
npm install
npm run build
wrangler pages deploy dist
```

### 7. 配置 Workers 定时任务

在 Cloudflare Dashboard 中：
1. 进入 Workers & Pages
2. 选择你的项目
3. 进入 Settings > Triggers
4. 添加 Cron 触发器：
   - `0 2 * * *` - 每天凌晨2点执行用量同步
   - `0 9 * * *` - 每天上午9点发送报告邮件
   - `0 3 1 * *` - 每月1日凌晨3点生成账单

### 8. 上传发票

发票需要后台手动上传到 R2 存储桶：
```bash
wrangler r2 object put token-service-invoices/user-{userId}/{year}/{month}.pdf --file=invoice.pdf
```

## 开发模式功能

在本地开发模式下，系统使用模拟数据运行：
- 验证码会自动填充
- API Keys 存储在内存中
- 用量数据为模拟数据

## 生产环境注意事项

1. **邮件服务**: 需要配置有效的 Resend API Key
2. **API 用量同步**: 需要在 Workers 中实现真实的 API 调用
3. **安全性**: 确保 JWT_SECRET 和 ENCRYPTION_KEY 使用强密码
4. **数据库备份**: 定期备份 D1 数据库

## 功能清单

- ✅ 邮箱验证码登录
- ✅ API Key 管理（添加/删除/查看）
- ✅ 用量统计（日/周/月）
- ✅ 月度账单
- ✅ 发票下载
- ✅ 每日用量报告邮件
- ✅ 月度账单邮件
- ✅ 定时任务（用量同步/邮件发送/账单生成）
