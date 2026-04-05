/// <reference path="../types.d.ts" />

// 初始化数据库
export const onRequest: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { env } = context;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    // 检查是否已有用户
    const existing = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
    
    if (existing && (existing.count as number) > 0) {
      return Response.json({ success: true, message: 'Database already seeded' }, { headers });
    }

    // 创建示例用户
    await env.DB.prepare(`
      INSERT INTO users (email, name, company_name, company_code, company_address, company_phone, status, email_verified) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      '120083449@qq.com',
      '孙鹏飞',
      '北京墨丘科技有限公司',
      '91110108MA006A322A',
      '北京市海淀区花园路2号2号楼四层407室',
      '13683600172',
      'active',
      1
    ).run();

    return Response.json({ success: true, message: 'Database seeded successfully' }, { headers });
  } catch (error) {
    console.error('Seed Error:', error);
    return Response.json({ success: false, error: String(error) }, { status: 500, headers });
  }
};
