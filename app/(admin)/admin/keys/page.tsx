"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KeysIndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    // 重定向到提供方管理页面
    router.replace("/admin/keys/providers");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-slate-600">加载中...</div>
    </div>
  );
}
