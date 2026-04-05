import type { ProviderConfig, ProviderKey, UserApiKey, User, Bill } from "@/types";

// 提供方配置
export const mockProviders: ProviderConfig[] = [
  {
    id: "kimi",
    name: "Kimi (Moonshot)",
    color: "bg-purple-100 text-purple-800",
    description: "月之暗面大模型",
    base_url: "https://api.moonshot.cn",
    status: "active",
    created_at: "2024-01-01",
  },
  {
    id: "glm",
    name: "GLM (智谱AI)",
    color: "bg-blue-100 text-blue-800",
    description: "智谱清言大模型",
    base_url: "https://open.bigmodel.cn",
    status: "active",
    created_at: "2024-01-01",
  },
  {
    id: "claude",
    name: "Claude (Anthropic)",
    color: "bg-orange-100 text-orange-800",
    description: "Anthropic Claude 系列",
    base_url: "https://api.anthropic.com",
    status: "active",
    created_at: "2024-01-01",
  },
  {
    id: "openai",
    name: "OpenAI",
    color: "bg-green-100 text-green-800",
    description: "GPT 系列模型",
    base_url: "https://api.openai.com",
    status: "active",
    created_at: "2024-01-01",
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    color: "bg-cyan-100 text-cyan-800",
    description: "微软 Azure OpenAI 服务",
    base_url: "https://azure.openai.microsoft.com",
    status: "active",
    created_at: "2024-01-01",
  },
  {
    id: "gemini",
    name: "Gemini (Google)",
    color: "bg-indigo-100 text-indigo-800",
    description: "Google Gemini 系列",
    base_url: "https://generativelanguage.googleapis.com",
    status: "active",
    created_at: "2024-01-01",
  },
  {
    id: "seedance",
    name: "Seedance 2.0",
    color: "bg-pink-100 text-pink-800",
    description: "字节跳动视频生成模型",
    base_url: "https://api.seedance.com",
    status: "active",
    created_at: "2024-01-01",
  },
];

// 资源池中的 API Keys
export const mockProviderKeys: ProviderKey[] = [
  // Kimi Keys
  {
    id: 1,
    provider_id: "kimi",
    key_mask: "sk-****1234",
    status: "allocated",
    allocated_to: 1,
    allocated_to_email: "user1@example.com",
    allocated_at: "2024-01-15T10:00:00Z",
    current_usage: 1500000,
    usage_limit: 5000000,
    last_used_at: "2024-01-15T10:30:00Z",
    created_at: "2024-01-01",
  },
  {
    id: 2,
    provider_id: "kimi",
    key_mask: "sk-****5678",
    status: "allocated",
    allocated_to: 1,
    allocated_to_email: "user1@example.com",
    allocated_at: "2024-01-10T08:00:00Z",
    current_usage: 500000,
    last_used_at: "2024-01-14T15:20:00Z",
    created_at: "2024-01-05",
  },
  {
    id: 3,
    provider_id: "kimi",
    key_mask: "sk-****9abc",
    status: "available",
    current_usage: 0,
    created_at: "2024-01-20",
  },
  {
    id: 4,
    provider_id: "kimi",
    key_mask: "sk-****def0",
    status: "available",
    current_usage: 0,
    created_at: "2024-01-20",
  },
  // GLM Keys
  {
    id: 5,
    provider_id: "glm",
    key_mask: "sk-****abcd",
    status: "allocated",
    allocated_to: 1,
    allocated_to_email: "user1@example.com",
    allocated_at: "2024-01-08T09:00:00Z",
    current_usage: 500000,
    last_used_at: "2024-01-15T11:30:00Z",
    created_at: "2024-01-03",
  },
  {
    id: 6,
    provider_id: "glm",
    key_mask: "sk-****efgh",
    status: "available",
    current_usage: 0,
    created_at: "2024-01-18",
  },
  // Claude Keys
  {
    id: 7,
    provider_id: "claude",
    key_mask: "sk-****ijkl",
    status: "allocated",
    allocated_to: 2,
    allocated_to_email: "user2@example.com",
    allocated_at: "2024-01-05T14:00:00Z",
    current_usage: 800000,
    usage_limit: 2000000,
    last_used_at: "2024-01-14T15:20:00Z",
    created_at: "2024-01-05",
  },
  {
    id: 8,
    provider_id: "claude",
    key_mask: "sk-****mnop",
    status: "disabled",
    current_usage: 0,
    created_at: "2024-01-10",
  },
  // OpenAI Keys
  {
    id: 9,
    provider_id: "openai",
    key_mask: "sk-****qrst",
    status: "allocated",
    allocated_to: 4,
    allocated_to_email: "user4@example.com",
    allocated_at: "2024-01-12T16:00:00Z",
    current_usage: 2000000,
    last_used_at: "2024-01-15T12:00:00Z",
    created_at: "2024-01-12",
  },
  {
    id: 10,
    provider_id: "openai",
    key_mask: "sk-****uvwx",
    status: "available",
    current_usage: 0,
    created_at: "2024-01-22",
  },
  // Gemini Keys
  {
    id: 11,
    provider_id: "gemini",
    key_mask: "sk-****yz12",
    status: "allocated",
    allocated_to: 2,
    allocated_to_email: "user2@example.com",
    allocated_at: "2024-01-11T10:30:00Z",
    current_usage: 300000,
    last_used_at: null,
    created_at: "2024-01-11",
  },
  // Azure Keys
  {
    id: 12,
    provider_id: "azure",
    key_mask: "sk-****3456",
    status: "available",
    current_usage: 0,
    created_at: "2024-01-25",
  },
  // Seedance Keys
  {
    id: 13,
    provider_id: "seedance",
    key_mask: "sk-****7890",
    status: "available",
    current_usage: 0,
    created_at: "2024-01-26",
  },
];

// 用户的 API Key 分配记录
export const mockUserApiKeys: UserApiKey[] = [
  {
    id: 1,
    user_id: 1,
    provider_key_id: 1,
    provider_id: "kimi",
    key_name: "生产环境-主Key",
    status: "active",
    created_at: "2024-01-15",
    updated_at: "2024-01-15",
  },
  {
    id: 2,
    user_id: 1,
    provider_key_id: 2,
    provider_id: "kimi",
    key_name: "测试环境",
    status: "active",
    created_at: "2024-01-10",
    updated_at: "2024-01-10",
  },
  {
    id: 3,
    user_id: 1,
    provider_key_id: 5,
    provider_id: "glm",
    key_name: "智谱生产",
    status: "active",
    created_at: "2024-01-08",
    updated_at: "2024-01-08",
  },
  {
    id: 4,
    user_id: 2,
    provider_key_id: 7,
    provider_id: "claude",
    key_name: "Claude开发",
    status: "active",
    created_at: "2024-01-05",
    updated_at: "2024-01-05",
  },
  {
    id: 5,
    user_id: 2,
    provider_key_id: 11,
    provider_id: "gemini",
    key_name: "Gemini测试",
    status: "inactive",
    created_at: "2024-01-11",
    updated_at: "2024-01-11",
  },
  {
    id: 6,
    user_id: 4,
    provider_key_id: 9,
    provider_id: "openai",
    key_name: "GPT-4生产",
    status: "active",
    created_at: "2024-01-12",
    updated_at: "2024-01-12",
  },
];

// 用户列表（企业客户）
export const mockUsers: User[] = [
  {
    id: 1,
    email: "zhangsan@techcorp.com",
    name: "张三",
    company_name: "北京科技有限公司",
    company_code: "91110108MA0012345",
    company_address: "北京市海淀区中关村大街1号",
    company_phone: "010-12345678",
    bank_name: "中国工商银行北京分行",
    bank_account: "6222 0000 0000 0000 001",
    status: "active",
    email_verified: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: 2,
    email: "lisi@innovate.com",
    name: "李四",
    company_name: "创新互联科技（上海）有限公司",
    company_code: "91310115MA0023456",
    company_address: "上海市浦东新区张江高科技园区",
    company_phone: "021-87654321",
    bank_name: "中国建设银行上海分行",
    bank_account: "6227 0000 0000 0000 002",
    status: "active",
    email_verified: true,
    created_at: "2024-01-02",
    updated_at: "2024-01-02",
  },
  {
    id: 3,
    email: "wangwu@future.com",
    name: "王五",
    company_name: "未来智能科技（深圳）有限公司",
    company_code: "91440300MA0034567",
    company_address: "深圳市南山区科技园",
    company_phone: "0755-11223344",
    bank_name: "招商银行深圳分行",
    bank_account: "6225 0000 0000 0000 003",
    status: "suspended",
    email_verified: true,
    created_at: "2024-01-03",
    updated_at: "2024-01-03",
  },
  {
    id: 4,
    email: "zhaoliu@cloud.com",
    name: "赵六",
    company_name: "云计算服务（杭州）有限公司",
    company_code: "91330108MA0045678",
    company_address: "杭州市西湖区文三路",
    company_phone: "0571-55667788",
    bank_name: "中国农业银行杭州分行",
    bank_account: "6228 0000 0000 0000 004",
    status: "active",
    email_verified: true,
    created_at: "2024-01-04",
    updated_at: "2024-01-04",
  },
  {
    id: 5,
    email: "contact@startup.com",
    name: "陈七",
    company_name: "创业科技（广州）有限公司",
    company_code: "91440100MA0056789",
    company_address: "广州市天河区珠江新城",
    company_phone: "020-99887766",
    status: "active",
    email_verified: false,
    created_at: "2024-01-05",
    updated_at: "2024-01-05",
  },
];

// 用户的账单数据
export const mockUserBills: Record<number, Bill[]> = {
  1: [
    { id: 1, user_id: 1, bill_year: 2024, bill_month: 1, total_tokens: 2500000, total_cost: 250, status: "paid", created_at: "2024-01-01" },
    { id: 4, user_id: 1, bill_year: 2023, bill_month: 12, total_tokens: 3200000, total_cost: 320, status: "paid", created_at: "2023-12-01" },
  ],
  2: [
    { id: 2, user_id: 2, bill_year: 2024, bill_month: 1, total_tokens: 1800000, total_cost: 180, status: "paid", created_at: "2024-01-01" },
    { id: 6, user_id: 2, bill_year: 2023, bill_month: 11, total_tokens: 2100000, total_cost: 210, status: "paid", created_at: "2023-11-01" },
  ],
  3: [
    { id: 3, user_id: 3, bill_year: 2024, bill_month: 1, total_tokens: 500000, total_cost: 50, status: "pending", created_at: "2024-01-01" },
  ],
  4: [
    { id: 5, user_id: 4, bill_year: 2023, bill_month: 12, total_tokens: 5200000, total_cost: 520, status: "overdue", created_at: "2023-12-01" },
  ],
};

// 辅助函数：获取提供方统计
export function getProviderStats(providerId: string) {
  const keys = mockProviderKeys.filter((k) => k.provider_id === providerId);
  return {
    total: keys.length,
    available: keys.filter((k) => k.status === "available").length,
    allocated: keys.filter((k) => k.status === "allocated").length,
    disabled: keys.filter((k) => k.status === "disabled").length,
    exhausted: keys.filter((k) => k.status === "exhausted").length,
  };
}

// 辅助函数：获取用户的分配 Keys
export function getUserAllocatedKeys(userId: number): UserApiKey[] {
  return mockUserApiKeys
    .filter((k) => k.user_id === userId)
    .map((userKey) => ({
      ...userKey,
      provider: mockProviders.find((p) => p.id === userKey.provider_id),
      provider_key: mockProviderKeys.find(
        (pk) => pk.id === userKey.provider_key_id
      ),
    }));
}

// 辅助函数：获取可用的 Keys（用于分配）
export function getAvailableKeys(providerId?: string): ProviderKey[] {
  return mockProviderKeys.filter(
    (k) =>
      k.status === "available" && (!providerId || k.provider_id === providerId)
  );
}
