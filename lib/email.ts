// Resend 邮件服务
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = 'Token Service <noreply@tokenservice.dev>';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// 每日用量报告邮件模板
export function generateDailyReportEmail(data: {
  userName: string;
  date: string;
  totalTokens: number;
  totalCost: number;
  providers: { name: string; tokens: number; cost: number }[];
}): string {
  const providerRows = data.providers.map(p => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${p.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${p.tokens.toLocaleString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">¥${p.cost.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>每日用量报告</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h1 style="color: #111827; margin: 0 0 8px 0; font-size: 24px;">每日用量报告</h1>
        <p style="color: #6b7280; margin: 0;">${data.date}</p>
      </div>
      
      <p style="margin-bottom: 24px;">您好 ${data.userName || ''}，</p>
      
      <p style="margin-bottom: 24px;">以下是您昨日的API用量统计：</p>
      
      <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <span style="color: #6b7280;">总Token用量</span>
          <span style="font-weight: 600; font-size: 18px;">${data.totalTokens.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280;">总费用</span>
          <span style="font-weight: 600; font-size: 18px; color: #059669;">¥${data.totalCost.toFixed(2)}</span>
        </div>
      </div>
      
      <h3 style="color: #111827; margin-bottom: 12px;">各平台用量详情</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 10px; text-align: left; font-weight: 600;">平台</th>
            <th style="padding: 10px; text-align: right; font-weight: 600;">Token用量</th>
            <th style="padding: 10px; text-align: right; font-weight: 600;">费用</th>
          </tr>
        </thead>
        <tbody>
          ${providerRows}
        </tbody>
      </table>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; color: #6b7280; font-size: 14px;">
        <p>此邮件由 Token Service 自动发送，请勿回复。</p>
        <p>如需查看更详细的用量数据，请访问：<a href="https://tokenservice.dev/dashboard" style="color: #2563eb;">Token Service 控制台</a></p>
      </div>
    </body>
    </html>
  `;
}

// 验证码邮件模板
export function generateVerificationCodeEmail(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>登录验证码</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h1 style="color: #111827; margin: 0; font-size: 24px;">登录验证码</h1>
      </div>
      
      <p style="margin-bottom: 24px;">您好，</p>
      
      <p style="margin-bottom: 24px;">您正在登录 Token Service，请输入以下验证码完成登录：</p>
      
      <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827;">${code}</div>
      </div>
      
      <p style="color: #6b7280; margin-bottom: 24px;">此验证码将在10分钟后过期，请勿泄露给他人。</p>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; color: #6b7280; font-size: 14px;">
        <p>此邮件由 Token Service 自动发送，请勿回复。</p>
        <p>如非您本人操作，请忽略此邮件。</p>
      </div>
    </body>
    </html>
  `;
}

// 月度账单邮件模板
export function generateMonthlyBillEmail(data: {
  userName: string;
  year: number;
  month: number;
  totalTokens: number;
  totalCost: number;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>月度账单</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h1 style="color: #111827; margin: 0 0 8px 0; font-size: 24px;">月度账单</h1>
        <p style="color: #6b7280; margin: 0;">${data.year}年${data.month}月</p>
      </div>
      
      <p style="margin-bottom: 24px;">您好 ${data.userName || ''}，</p>
      
      <p style="margin-bottom: 24px;">您${data.year}年${data.month}月的API用量账单已生成：</p>
      
      <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <span style="color: #6b7280;">总Token用量</span>
          <span style="font-weight: 600; font-size: 18px;">${data.totalTokens.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          <span style="color: #111827; font-weight: 600;">应付金额</span>
          <span style="font-weight: 700; font-size: 20px; color: #059669;">¥${data.totalCost.toFixed(2)}</span>
        </div>
      </div>
      
      <p style="margin-bottom: 24px;">发票将在账单支付后提供，请登录控制台查看详情。</p>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; color: #6b7280; font-size: 14px;">
        <p>此邮件由 Token Service 自动发送，请勿回复。</p>
        <p>如需查看账单详情，请访问：<a href="https://tokenservice.dev/dashboard/bills" style="color: #2563eb;">Token Service 控制台</a></p>
      </div>
    </body>
    </html>
  `;
}
