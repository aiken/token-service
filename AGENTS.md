# Token Service - 项目说明

## 项目概述
Token Service 是一个AI API用量管理平台，帮助用户管理多个AI平台（Kimi、GLM、Claude）的API Key和用量统计。

## 技术栈
- **前端框架**: Next.js 14 (App Router) + React 19
- **样式**: Tailwind CSS 4
- **UI组件**: shadcn/ui
- **托管**: Cloudflare Pages
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2
- **定时任务**: Cloudflare Workers

## 项目结构
```
app/
├── (auth)/login/              # 用户登录页面
├── (dashboard)/               # 用户仪表盘
│   └── dashboard/
│       ├── page.tsx           # 首页
│       ├── keys/              # API Key管理
│       ├── usage/             # 用量统计
│       ├── bills/             # 账单
│       ├── invoices/          # 发票
│       └── settings/          # 设置
├── (admin)/                   # 管理后台
│   └── admin/
│       ├── login/             # 管理员登录
│       ├── page.tsx           # 管理概览
│       ├── users/             # 用户管理
│       ├── keys/              # API Key管理
│       ├── bills/             # 账单管理
│       └── invoices/          # 发票上传
├── layout.tsx                 # 根布局
└── globals.css                # 全局样式

components/ui/                 # UI组件
lib/                          # 工具库
├── utils.ts                  # 工具函数
├── db.ts                     # 数据库操作
├── auth.ts                   # JWT认证
└── email.ts                  # 邮件服务

types/                        # 类型定义
workers/                      # 定时任务
migrations/                   # 数据库迁移
```

## 功能模块

### 用户端功能
1. **邮箱登录** - 验证码登录
2. **API Key管理** - 添加、删除、查看（支持Kimi/GLM/Claude）
3. **用量统计** - 日/周/月维度，平台分布
4. **账单查询** - 月度账单列表
5. **发票下载** - 已上传的发票

### 管理后台功能
1. **管理员登录** - 独立登录入口
2. **管理概览** - 系统统计数据、最近注册用户、平台用量分布
3. **用户管理** - 查看所有用户、搜索、暂停/恢复账户、查看详情
4. **API Key管理** - 查看所有Key、为用户添加Key、启用/禁用/删除
5. **账单管理** - 查看所有账单、筛选、标记支付状态
6. **发票管理** - 上传发票(PDF)、下载、删除

## 管理后台登录

**访问地址**: `/admin/login`

**演示账号**:
- 邮箱: `admin@tokenservice.com`
- 密码: `admin123456`

## 开发模式

在演示模式下：
- 验证码自动填充
- 使用模拟数据
- 所有功能均可正常体验

## 部署命令

```bash
# 本地开发
npm run dev

# 构建（静态导出）
npm run build

# 部署到Cloudflare Pages
npm run pages:deploy

# 数据库迁移
npm run db:migrate
```

## 注意事项
- API路由使用Edge Runtime，支持Cloudflare Pages Functions
- 静态导出用于前端页面
- 所有敏感信息通过环境变量配置
