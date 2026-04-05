// 月度账单生成 Worker
// 执行时间: 每月1日凌晨 3:00

import { getAllActiveUsers, getUsageByDateRange, createBill, createEmailLog, updateEmailLogStatus } from "../../lib/db";
import { sendEmail, generateMonthlyBillEmail } from "../../lib/email";

export interface Env {
  DB: D1Database;
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log("Starting monthly bill generation...", new Date().toISOString());
    
    // 计算上个月
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1;
    
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd = new Date(year, month, 0).toISOString().split('T')[0];
    
    console.log(`Generating bills for ${year}-${String(month).padStart(2, '0')}`);
    
    try {
      // 获取所有活跃用户
      const users = await getAllActiveUsers(env.DB);
      console.log(`Found ${users.length} active users`);
      
      for (const user of users) {
        try {
          // 获取上月用量数据
          const usageData = await getUsageByDateRange(env.DB, user.id as number, monthStart, monthEnd);
          
          let totalTokens = 0;
          let totalCost = 0;
          
          for (const record of usageData) {
            totalTokens += Number(record.total_tokens);
            totalCost += Number(record.cost_cny);
          }
          
          // 创建账单
          await createBill(env.DB, user.id as number, year, month, totalTokens, totalCost);
          console.log(`Bill created for user ${user.id}: ¥${totalCost.toFixed(2)}`);
          
          // 发送账单邮件
          const html = generateMonthlyBillEmail({
            userName: (user.name as string) || '',
            year,
            month,
            totalTokens,
            totalCost,
          });
          
          const log = await createEmailLog(env.DB, {
            userId: user.id as number,
            emailType: 'monthly_bill',
            subject: `Token Service ${year}年${month}月账单`,
            content: html,
          });
          
          const result = await sendEmail({
            to: user.email as string,
            subject: `Token Service ${year}年${month}月账单`,
            html,
          });
          
          await updateEmailLogStatus(
            env.DB,
            log.id as number,
            result.success ? 'sent' : 'failed',
            result.error
          );
          
          if (result.success) {
            console.log(`Monthly bill sent to ${user.email}`);
          } else {
            console.error(`Failed to send bill to ${user.email}:`, result.error);
          }
        } catch (error) {
          console.error(`Failed to process user ${user.id}:`, error);
        }
      }
      
      console.log("Monthly bill generation completed");
    } catch (error) {
      console.error("Monthly bill job failed:", error);
    }
  },
};
