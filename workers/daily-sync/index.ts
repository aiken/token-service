// 每日用量数据同步 Worker
// 执行时间: 每天凌晨 2:00

import { getAllActiveApiKeys, createUsageRecord } from "../../lib/db";

export interface Env {
  DB: D1Database;
}

// Kimi API 用量查询
async function fetchKimiUsage(apiKey: string, date: string): Promise<{
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  request_count: number;
}> {
  // TODO: 实现真实的Kimi API调用
  // 这是模拟数据
  return {
    prompt_tokens: Math.floor(Math.random() * 50000),
    completion_tokens: Math.floor(Math.random() * 30000),
    total_tokens: 0,
    request_count: Math.floor(Math.random() * 1000),
  };
}

// GLM API 用量查询
async function fetchGlmUsage(apiKey: string, date: string): Promise<{
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  request_count: number;
}> {
  // TODO: 实现真实的GLM API调用
  return {
    prompt_tokens: Math.floor(Math.random() * 40000),
    completion_tokens: Math.floor(Math.random() * 25000),
    total_tokens: 0,
    request_count: Math.floor(Math.random() * 800),
  };
}

// Claude API 用量查询
async function fetchClaudeUsage(apiKey: string, date: string): Promise<{
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  request_count: number;
}> {
  // TODO: 实现真实的Claude API调用
  return {
    prompt_tokens: Math.floor(Math.random() * 60000),
    completion_tokens: Math.floor(Math.random() * 40000),
    total_tokens: 0,
    request_count: Math.floor(Math.random() * 1200),
  };
}

// 计算费用（简化计算，实际应根据各平台定价）
function calculateCost(provider: string, tokens: number): number {
  const rates: Record<string, number> = {
    kimi: 0.00001,    // ¥0.01 / 1K tokens
    glm: 0.000008,    // ¥0.008 / 1K tokens
    claude: 0.000015, // ¥0.015 / 1K tokens
  };
  return tokens * (rates[provider] || 0.00001);
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log("Starting daily usage sync...", new Date().toISOString());
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    try {
      // 获取所有活跃的API Keys
      const apiKeys = await getAllActiveApiKeys(env.DB);
      console.log(`Found ${apiKeys.length} active API keys`);
      
      for (const key of apiKeys) {
        try {
          let usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
            request_count: number;
          };
          
          // 根据平台获取用量
          switch (key.provider) {
            case 'kimi':
              usage = await fetchKimiUsage(key.key_value as string, dateStr);
              break;
            case 'glm':
              usage = await fetchGlmUsage(key.key_value as string, dateStr);
              break;
            case 'claude':
              usage = await fetchClaudeUsage(key.key_value as string, dateStr);
              break;
            default:
              console.warn(`Unknown provider: ${key.provider}`);
              continue;
          }
          
          usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;
          const cost = calculateCost(key.provider as string, usage.total_tokens);
          
          // 保存到数据库
          await createUsageRecord(env.DB, {
            apiKeyId: key.id as number,
            recordDate: dateStr,
            provider: key.provider as string,
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
            requestCount: usage.request_count,
            costCny: cost,
          });
          
          console.log(`Synced usage for key ${key.id} on ${dateStr}: ${usage.total_tokens} tokens`);
        } catch (error) {
          console.error(`Failed to sync usage for key ${key.id}:`, error);
        }
      }
      
      console.log("Daily usage sync completed");
    } catch (error) {
      console.error("Daily sync failed:", error);
    }
  },
};
