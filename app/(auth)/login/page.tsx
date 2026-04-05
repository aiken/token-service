"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [sentCode, setSentCode] = useState("");

  const sendCode = async () => {
    if (!email || countdown > 0) return;
    
    setError("");
    setIsLoading(true);
    
    try {
      // 模拟发送验证码
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 生成6位验证码
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(newCode);
      setCode(newCode); // 自动填充（仅演示用）
      
      setIsCodeSent(true);
      setCountdown(60);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setError("网络错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!email || !code) return;
    
    setError("");
    setIsLoading(true);
    
    try {
      // 模拟验证
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 创建模拟token和用户信息
      const mockToken = "mock-jwt-token-" + Date.now();
      const user = {
        id: 1,
        email,
        name: email.split('@')[0],
      };
      
      // 保存到localStorage
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(user));
      
      // 跳转到仪表盘
      window.location.href = "/dashboard";
    } catch (error) {
      setError("网络错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Token Service</CardTitle>
        <CardDescription>
          请输入邮箱登录您的账户
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
            邮箱地址
          </label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isCodeSent}
          />
        </div>
        
        {isCodeSent && (
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">
              验证码
            </label>
            <Input
              id="code"
              type="text"
              placeholder="请输入6位验证码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
            <p className="text-xs text-green-600">
              演示模式：验证码已自动填充
            </p>
          </div>
        )}

        <Button
          className="w-full"
          onClick={isCodeSent ? verifyCode : sendCode}
          disabled={isLoading || (!isCodeSent && !email) || (isCodeSent && !code)}
        >
          {isLoading
            ? "处理中..."
            : isCodeSent
            ? "登录"
            : countdown > 0
            ? `${countdown}秒后重试`
            : "获取验证码"}
        </Button>

        {isCodeSent && (
          <button
            onClick={() => {
              setIsCodeSent(false);
              setCode("");
              setSentCode("");
              setError("");
            }}
            className="w-full text-sm text-slate-600 hover:text-slate-800"
          >
            使用其他邮箱
          </button>
        )}
      </CardContent>
    </Card>
  );
}
