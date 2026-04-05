"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// 管理员账号（实际应该存储在数据库中）
const ADMIN_EMAIL = "admin@tokenservice.com";
const ADMIN_PASSWORD = "admin123456"; // 实际应该使用哈希存储

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("请输入邮箱和密码");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      // 验证管理员账号
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // 生成管理员token
        const adminToken = "admin-token-" + Date.now();
        localStorage.setItem("admin_token", adminToken);
        localStorage.setItem("admin_user", JSON.stringify({ email, role: "admin" }));
        
        // 跳转到管理后台首页
        window.location.href = "/admin";
      } else {
        setError("邮箱或密码错误");
      }
    } catch (error) {
      setError("登录失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">管理后台登录</CardTitle>
          <CardDescription>
            Token Service 管理系统
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              管理员邮箱
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@tokenservice.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              密码
            </label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "登录中..." : "登录"}
          </Button>

          <div className="text-center text-xs text-slate-500">
            演示账号: admin@tokenservice.com / admin123456
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
