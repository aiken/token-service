// 每日报告邮件发送 Worker
// 执行时间: 每天上午 9:00

import { getAllActiveUsers, getUsageByDateRange, createEmailLog, updateEmailLogStatus } from "../../lib/db";
import { sendEmail, generateDailyReportEmail } from "../../lib/email";

export interface Env {
  DB: D1Database;
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log("Starting daily report sending...", new Date().toISOString());
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    const dateDisplay = yesterday.toLocaleDateString('zh-CN');
    
    try {
      // 获取所有活跃用户
      const users = await getAllActiveUsers(env.DB);
      console.log(`Found ${users.length} active users`);
      
      for (const user of users) {
        try {
          // 获取昨日用量数据
          const usageData = await getUsageByDateRange(env.DB, user.id as number, dateStr, dateStr);
          
          if (!usageData || usageData.length === 0) {
            console.log(`No usage data for user ${user.id} on ${dateStr}`);
            continue;
          }
          
          // 计算总量和平台分布
          let totalTokens = 0;
          let totalCost = 0;
          const providerMap = new Map<string, { tokens: number; cost: number }>();
          
          for (const record of usageData) {
            const tokens = Number(record.total_tokens);
            const cost = Number(record.cost_cny);
            totalTokens += tokens;
            totalCost += cost;
            
            const provider = record.provider as string;
            const existing = providerMap.get(provider) || { tokens: 0, cost: 0 };
            providerMap.set(provider, {
              tokens: existing.tokens + tokens,
              cost: existing.cost + cost,
            });
          }
          
          const providers = Array.from(providerMap.entries()).map(([name, data]) => ({
            name,
            tokens: data.tokens,
            cost: data.cost,
          }));
          
          // 生成邮件内容
          const html = generateDailyReportEmail({
            userName: (user.name as string) || '',
            date: dateDisplay,
            totalTokens,
            totalCost,
            providers,
          });
          
          // 记录邮件日志
          const log = await createEmailLog(env.DB, {
            userId: user.id as number,
            emailType: 'daily_report',
            subject: `Token Service 每日用量报告 - ${dateDisplay}`,
            content: html,
          });
          
          // 发送邮件
          const result = await sendEmail({
            to: user.email as string,
            subject: `Token Service 每日用量报告 - ${dateDisplay}`,
            html,
          });
          
          // 更新邮件状态
          await updateEmailLogStatus(
            env.DB,
            log.id as number,
            result.success ? 'sent' : 'failed',
            result.error
          );
          
          if (result.success) {
            console.log(`Daily report sent to ${user.email}`);
          } else {
            console.error(`Failed to send daily report to ${user.email}:`, result.error);
          }
        } catch (error) {
          console.error(`Failed to process user ${user.id}:`, error);
        }
      }
      
      console.log("Daily report sending completed");
    } catch (error) {
      console.error("Daily report job failed:", error);
    }
  },
};
