"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "user@example.com",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setIsLoading(true);
    // TODO: 保存用户信息
    setTimeout(() => {
      setMessage("保存成功");
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">账户设置</h1>
        <p className="mt-1 text-sm text-slate-600">
          管理您的账户信息
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>个人资料</CardTitle>
          <CardDescription>更新您的个人信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">姓名</label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="请输入您的姓名"
            />
          </div>
          <div>
            <label className="text-sm font-medium">邮箱</label>
            <Input
              value={profile.email}
              disabled
              className="bg-slate-100"
            />
            <p className="text-xs text-slate-600 mt-1">邮箱不可修改</p>
          </div>
          {message && (
            <p className="text-sm text-green-600">{message}</p>
          )}
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "保存中..." : "保存"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>通知设置</CardTitle>
          <CardDescription>配置邮件通知选项</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">每日用量报告</p>
              <p className="text-sm text-slate-600">每天上午9点发送昨日用量报告</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">月度账单通知</p>
              <p className="text-sm text-slate-600">每月1日发送月度账单</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
