# Token Service - AI API用量管理平台

一站式AI API用量监控和账单管理平台，帮助您管理Kimi、GLM、Claude等多个AI平台的API Key和用量统计。

## 功能特性

- 📧 邮箱验证码登录
- 🔑 API Key管理（查看、添加、删除）
- 📊 用量统计（日/周/月维度）
- 💰 月度账单查询
- 📄 发票下载
- 📧 每日用量报告邮件

## 技术栈

- **框架**: Next.js 14 + React 19
- **样式**: Tailwind CSS 4
- **UI组件**: shadcn/ui
- **托管**: Cloudflare Pages
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2
- **定时任务**: Cloudflare Workers
- **邮件服务**: Resend

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写您的配置：

```bash
cp .env.example .env.local
```

### 3. 初始化数据库

```bash
npm run db:migrate
```

### 4. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 部署到Cloudflare Pages

```bash
npm run pages:deploy
```

## 项目结构

```
app/
├── (auth)/           # 认证路由组
│   └── login/        # 登录页面
├── (dashboard)/      # 仪表盘路由组
│   └── dashboard/
│       ├── page.tsx      # 仪表盘首页
│       ├── keys/         # API Key管理
│       ├── usage/        # 用量统计
│       ├── bills/        # 账单
│       ├── invoices/     # 发票
│       └── settings/     # 设置
├── api/              # API路由
├── globals.css       # 全局样式
└── layout.tsx        # 根布局

components/
└── ui/               # UI组件

lib/
└── utils.ts          # 工具函数

types/
└── index.ts          # TypeScript类型定义

migrations/
└── 001_init.sql      # 数据库迁移脚本

workers/              # Cloudflare Workers (定时任务)
```

## 开发计划

- [x] 基础框架搭建
- [x] 用户认证（邮箱登录）
- [x] API Key管理
- [x] 用量统计展示
- [ ] 数据同步Worker
- [ ] 每日报告邮件
- [ ] 月度账单生成
- [ ] 发票上传和下载

## 许可证

MIT
