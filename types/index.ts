// 用户类型 - 企业客户
export interface User {
  id: number;
  email: string;                    // 联系人邮箱
  name: string;                     // 联系人姓名
  // 企业信息
  company_name: string;             // 企业名称
  company_code: string;             // 统一社会信用代码/税号
  company_address?: string;         // 企业注册地址
  company_phone?: string;           // 企业联系电话
  bank_name?: string;               // 开户银行
  bank_account?: string;            // 银行账号
  // 账户状态
  status: 'active' | 'suspended' | 'deleted';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

// 支持的AI服务提供商配置
export interface ProviderConfig {
  id: string;              // 如: kimi, glm, claude
  name: string;            // 显示名: Kimi (Moonshot)
  color: string;           // UI 颜色类名
  description?: string;    // 描述
  base_url?: string;       // API 基础 URL
  status: 'active' | 'inactive';
  created_at: string;
}

// 资源池中的 API Key（核心新增）
export interface ProviderKey {
  id: number;
  provider_id: string;              // 所属提供方
  key_value?: string;               // 真实的 API Key（加密存储，仅特定接口返回）
  key_mask: string;                 // 掩码显示
  status: 'available' | 'allocated' | 'disabled' | 'exhausted';
  allocated_to?: number;            // 分配给用户ID
  allocated_to_email?: string;      // 分配给用户的邮箱
  allocated_at?: string;            // 分配时间
  usage_limit?: number;             // 用量限制（可选，单位：tokens）
  current_usage: number;            // 当前用量
  last_used_at?: string | null;
  created_at: string;
}

// 用户的 API Key 分配记录（用户视角看到的内容）
export interface UserApiKey {
  id: number;
  user_id: number;
  provider_key_id: number;          // 关联到资源池中的 Key
  provider_id: string;
  key_name: string;                 // 用户自定义名称
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  // 关联数据（展开）
  provider?: ProviderConfig;
  provider_key?: ProviderKey;
}

// 用量记录类型
export interface UsageRecord {
  id: number;
  api_key_id: number;
  record_date: string;
  provider: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  request_count: number;
  cost_cny: number;
  created_at: string;
  updated_at: string;
}

// 账单明细类型 - 关联API Key用量
export interface BillDetail {
  id: number;
  bill_id: number;
  api_key_id: number;
  api_key_name: string;
  provider: string;
  total_tokens: number;
  cost: number;
}

// 账单类型
export interface Bill {
  id: number;
  user_id: number;
  user_email?: string;
  bill_month: number;
  bill_year: number;
  total_tokens: number;
  total_cost: number;
  status: 'pending' | 'paid' | 'overdue';
  created_at: string;
  details?: BillDetail[]; // 关联的API Key明细
}

// 发票类型
export interface Invoice {
  id: number;
  user_id: number;
  // 企业信息（冗余存储，开票时的企业信息）
  company_name: string;             // 开票企业名称
  company_code: string;             // 税号
  company_address?: string;         // 企业地址
  company_phone?: string;           // 企业电话
  bank_name?: string;               // 开户银行
  bank_account?: string;            // 银行账号
  // 发票信息
  invoice_month: number;
  invoice_year: number;
  amount_cny: number;
  invoice_no?: string;              // 发票号码
  file_path: string;
  file_name: string;
  status: 'available' | 'downloaded';
  created_at: string;
}

// 邮件日志类型
export interface EmailLog {
  id: number;
  user_id: number;
  email_type: 'daily_report' | 'monthly_bill' | 'welcome';
  subject: string;
  content: string;
  sent_at: string;
  status: 'pending' | 'sent' | 'failed';
  error_msg: string | null;
}

// JWT Payload
export interface JWTPayload {
  userId: number;
  email: string;
  exp: number;
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 用量统计类型
export interface UsageSummary {
  today: {
    tokens: number;
    cost: number;
  };
  thisMonth: {
    tokens: number;
    cost: number;
  };
  total: {
    tokens: number;
    cost: number;
  };
}

// 提供商统计
export interface ProviderUsage {
  provider: string;
  tokens: number;
  percentage: number;
}

// 兼容旧类型（迁移期间使用）
export type ProviderType = 'kimi' | 'glm' | 'claude' | 'openai' | 'azure' | 'gemini' | 'seedance';

// 旧 API Key 类型（迁移期间兼容）
export interface ApiKey {
  id: number;
  user_id: number;
  user_email?: string;
  provider: ProviderType;
  key_name: string;
  key_value?: string;
  key_mask: string;
  status: 'active' | 'inactive' | 'deleted';
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}
