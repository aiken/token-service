"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";

const mockDailyData = [
  { date: "2024-01-01", tokens: 45000, cost: 4.5 },
  { date: "2024-01-02", tokens: 52000, cost: 5.2 },
  { date: "2024-01-03", tokens: 48000, cost: 4.8 },
  { date: "2024-01-04", tokens: 61000, cost: 6.1 },
  { date: "2024-01-05", tokens: 55000, cost: 5.5 },
  { date: "2024-01-06", tokens: 42000, cost: 4.2 },
  { date: "2024-01-07", tokens: 38000, cost: 3.8 },
];

const mockProviderData = [
  { provider: "Kimi", tokens: 125000, cost: 12.5 },
  { provider: "GLM", tokens: 85000, cost: 8.5 },
  { provider: "Claude", tokens: 45000, cost: 4.5 },
];

export default function UsagePage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  const totalTokens = mockDailyData.reduce((sum, d) => sum + d.tokens, 0);
  const totalCost = mockDailyData.reduce((sum, d) => sum + d.cost, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">用量统计</h1>
        <p className="mt-1 text-sm text-slate-600">
          查看详细的API用量数据
        </p>
      </div>

      {/* 时间范围选择 */}
      <div className="flex gap-2">
        {(["week", "month", "year"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeRange === range
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            {range === "week" ? "本周" : range === "month" ? "本月" : "本年"}
          </button>
        ))}
      </div>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总Token用量</CardDescription>
            <CardTitle className="text-3xl">{formatNumber(totalTokens)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总费用</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totalCost)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 平台分布 */}
      <Card>
        <CardHeader>
          <CardTitle>平台用量分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockProviderData.map((item) => (
              <div key={item.provider} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.provider}</p>
                  <p className="text-sm text-slate-600">{formatNumber(item.tokens)} tokens</p>
                </div>
                <p className="font-medium">{formatCurrency(item.cost)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 每日明细 */}
      <Card>
        <CardHeader>
          <CardTitle>每日用量明细</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium">日期</th>
                  <th className="text-right py-3 px-4 font-medium">Token用量</th>
                  <th className="text-right py-3 px-4 font-medium">费用</th>
                </tr>
              </thead>
              <tbody>
                {mockDailyData.map((item) => (
                  <tr key={item.date} className="border-b border-slate-100">
                    <td className="py-3 px-4">{formatDate(item.date)}</td>
                    <td className="py-3 px-4 text-right">{formatNumber(item.tokens)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(item.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
