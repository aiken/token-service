import { mockProviders } from "@/lib/mock-data";
import ProviderDetailClient from "./client";

// 为静态导出生成参数
export function generateStaticParams() {
  return mockProviders.map((provider) => ({
    id: provider.id,
  }));
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
