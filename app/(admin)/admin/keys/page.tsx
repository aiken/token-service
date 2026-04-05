"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProviders, getProviderStats } from "@/lib/mock-data";
import type { ProviderConfig } from "@/types";

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
