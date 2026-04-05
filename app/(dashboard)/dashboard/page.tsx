"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatCurrency } from "@/lib/utils";
import type { UsageSummary, ProviderUsage } from "@/types";

// 支持的服务平台
const providers = [
  { value: "kimi", label: "Kimi", color: "bg-purple-500" },
  { value: "glm", label: "GLM", color: "bg-blue-500" },
  { value: "claude", label: "Claude", color: "bg-orange-500" },
  { value: "openai", label: "OpenAI", color: "bg-green-500" },
  { value: "azure", label: "Azure", color: "bg-cyan-500" },
  { value: "gemini", label: "Gemini", color: "bg-indigo-500" },
  { value: "seedance", label: "Seedance 2.0", color: "bg-pink-500" },
];

// 模拟数据
const mockSummary: UsageSummary = {
  today: { tokens: 125000, cost: 12.5 },
  thisMonth: { tokens: 2500000, cost: 250 },
  total: { tokens: 15000000, cost: 1500 },
};

const mockProviderStats: ProviderUsage[] = [
  { provider: "kimi", tokens: 800000, percentage: 32 },
  { provider: "glm", tokens: 600000, percentage: 24 },
  { provider: "claude", tokens: 500000, percentage: 20 },
  { provider: "openai", tokens: 400000, percentage: 16 },
  { provider: "azure", tokens: 150000, percentage: 6 },
  { provider: "gemini", tokens: 50000, percentage: 2 },
];

// 各平台API Key数量
const mockKeyCounts = [
  { provider: "kimi", count: 3 },
  { provider: "glm", count: 2 },
  { provider: "claude", count: 1 },
  { provider: "openai", count: 2 },
  { provider: "azure", count: 1 },
  { provider: "gemini", count: 1 },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<UsageSummary>(mockSummary);
  const [providerStats, setProviderStats] = useState<ProviderUsage[]>(mockProviderStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>
        <p className="mt-1 text-sm text-slate-600">
          查看您的API用量概况
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>今日用量</CardDescription>
            <CardTitle className="text-3xl">{formatNumber(summary.today.tokens)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              费用: {formatCurrency(summary.today.cost)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>本月用量</CardDescription>
            <CardTitle className="text-3xl">{formatNumber(summary.thisMonth.tokens)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              费用: {formatCurrency(summary.thisMonth.cost)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总用量</CardDescription>
            <CardTitle className="text-3xl">{formatNumber(summary.total.tokens)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              总费用: {formatCurrency(summary.total.cost)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 平台用量分布 */}
        <Card>
          <CardHeader>
            <CardTitle>平台用量分布</CardTitle>
            <CardDescription>本月各AI平台用量占比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {providerStats.map((stat) => {
                const provider = providers.find(p => p.value === stat.provider);
                return (
                  <div key={stat.provider}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${provider?.color}`}></span>
                        <span className="text-sm font-medium">{provider?.label}</span>
                      </div>
                      <span className="text-sm text-slate-600">
                        {formatNumber(stat.tokens)} ({stat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`${provider?.color} h-2 rounded-full transition-all`}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* API Keys 统计 */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys 统计</CardTitle>
            <CardDescription>各平台配置的API Key数量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {mockKeyCounts.map((item) => {
                const provider = providers.find(p => p.value === item.provider);
                return (
                  <div key={item.provider} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${provider?.color}`}></span>
                      <span className="text-sm font-medium">{provider?.label}</span>
                    </div>
                    <p className="text-2xl font-bold">{item.count}</p>
                    <p className="text-xs text-slate-600">个API Key</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">总计</span>
                <span className="text-lg font-bold">
                  {mockKeyCounts.reduce((sum, k) => sum + k.count, 0)} 个API Key
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
