import ProviderDetailClient from "./client";

// 为静态导出生成参数 (使用 provider code 如 'kimi', 'glm')
export function generateStaticParams() {
  return [
    { id: 'kimi' },
    { id: 'glm' },
    { id: 'claude' },
    { id: 'seedance' },
    { id: 'azure' },
    { id: 'openai' },
    { id: 'gemini' },
  ];
}

// 使用 async 处理 params
export default async function ProviderDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <ProviderDetailClient providerId={id} />;
}
