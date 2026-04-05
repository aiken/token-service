"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatCurrency } from "@/lib/utils";

// 模拟统计数据
const mockStats = {
  totalUsers: 156,
  totalApiKeys: 423,
  todayTokens: 1250000,
  todayRevenue: 125.5,
  monthTokens: 35000000,
  monthRevenue: 3500,
};

// 模拟最近注册用户
const mockRecentUsers = [
  { id: 1, email: "user1@example.com", name: "张三", created_at: "2024-01-15", apiKeys: 3 },
  { id: 2, email: "user2@example.com", name: "李四", created_at: "2024-01-14", apiKeys: 2 },
  { id: 3, email: "user3@example.com", name: null, created_at: "2024-01-14", apiKeys: 1 },
  { id: 4, email: "user4@example.com", name: "王五", created_at: "2024-01-13", apiKeys: 5 },
  { id: 5, email: "user5@example.com", name: null, created_at: "2024-01-12", apiKeys: 2 },
];

// 模拟平台用量分布
const mockProviderStats = [
  { provider: "Kimi", tokens: 18000000, percentage: 51 },
  { provider: "GLM", tokens: 12000000, percentage: 34 },
  { provider: "Claude", tokens: 5000000, percentage: 15 },
];

export default function AdminDashboardPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查管理员权限
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      window.location.href = "/admin/login";
      return;
    }
    setIsAuthorized(true);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">加载中...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">管理概览</h1>
        <p className="mt-1 text-sm text-slate-500">
          查看系统整体运行状态
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总用户数</CardDescription>
            <CardTitle className="text-3xl">{mockStats.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              API Keys: {mockStats.totalApiKeys}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>今日用量</CardDescription>
            <CardTitle className="text-3xl">{formatNumber(mockStats.todayTokens)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              收入: {formatCurrency(mockStats.todayRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>本月用量</CardDescription>
            <CardTitle className="text-3xl">{formatNumber(mockStats.monthTokens)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              收入: {formatCurrency(mockStats.monthRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近注册用户 */}
        <Card>
          <CardHeader>
            <CardTitle>最近注册用户</CardTitle>
            <CardDescription>最近5个注册的用户</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRecentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-xs text-slate-500">
                      {user.name || "未设置姓名"} · 注册于 {user.created_at}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {user.apiKeys} 个Key
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-800">
                查看全部用户 →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 平台用量分布 */}
        <Card>
          <CardHeader>
            <CardTitle>平台用量分布</CardTitle>
            <CardDescription>本月各平台用量占比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProviderStats.map((item) => (
                <div key={item.provider}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.provider}</span>
                    <span className="text-sm text-slate-500">
                      {formatNumber(item.tokens)} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-slate-900 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
