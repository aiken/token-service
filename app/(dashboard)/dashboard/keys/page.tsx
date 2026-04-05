"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProviders, mockUserApiKeys, mockProviderKeys } from "@/lib/mock-data";
import type { UserApiKey, ProviderConfig, ProviderKey } from "@/types";
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

// 扩展 UserApiKey 类型以包含关联数据
interface ExtendedUserApiKey extends UserApiKey {
  provider?: ProviderConfig;
  provider_key?: ProviderKey;
}

export default function UserKeysPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userKeys, setUserKeys] = useState<ExtendedUserApiKey[]>([]);
  const [revealedKey, setRevealedKey] = useState<number | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>("all");

  // 当前用户ID（实际应从 JWT 或上下文获取）
  const currentUserId = 1;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // 加载用户的分配 Keys
    const allocatedKeys = mockUserApiKeys
      .filter((k) => k.user_id === currentUserId)
      .map((userKey) => ({
        ...userKey,
        provider: mockProviders.find((p) => p.id === userKey.provider_id),
        provider_key: mockProviderKeys.find(
          (pk) => pk.id === userKey.provider_key_id
        ),
      }));

    setUserKeys(allocatedKeys);
    setIsLoading(false);
  }, []);

  // 按平台分组统计
  const keysByProvider = mockProviders.map((p) => ({
    ...p,
    count: userKeys.filter((k) => k.provider_id === p.id && k.status === "active").length,
  }));

  // 过滤显示的 keys
  const filteredKeys = userKeys.filter((key) => {
    if (filterProvider === "all") return true;
    return key.provider_id === filterProvider;
  });

  // 切换 Key 启用状态
  const handleToggleStatus = (keyId: number) => {
    setUserKeys(
      userKeys.map((key) => {
        if (key.id === keyId) {
          return { ...key, status: key.status === "active" ? "inactive" : "active" };
        }
        return key;
      })
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
        <p className="mt-1 text-sm text-slate-600">
          查看和管理分配给您的 API Keys
        </p>
      </div>

      {/* 全局统计 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">总分配数</p>
                <p className="text-2xl font-bold text-slate-900">{userKeys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">已启用</p>
                <p className="text-2xl font-bold text-slate-900">
                  {userKeys.filter((k) => k.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">已禁用</p>
                <p className="text-2xl font-bold text-slate-900">
                  {userKeys.filter((k) => k.status === "inactive").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">提供方</p>
                <p className="text-2xl font-bold text-slate-900">
                  {new Set(userKeys.map((k) => k.provider_id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 平台筛选 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterProvider("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filterProvider === "all"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          全部 ({userKeys.length})
        </button>
        {keysByProvider
          .filter((p) => p.count > 0)
          .map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterProvider(p.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterProvider === p.id
                  ? p.color.replace("bg-", "bg-").replace("100", "500 text-white")
                  : p.color
              }`}
            >
              {p.name} ({p.count})
            </button>
          ))}
      </div>

      {/* 提示信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>提示：</strong> API Keys 由管理员从资源池分配给您。如需更多 Keys 或其他提供方的访问权限，请联系管理员。
        </p>
      </div>

      {/* Keys 列表 */}
      <div className="space-y-6">
        {(filterProvider === "all"
          ? mockProviders.filter((p) => userKeys.some((k) => k.provider_id === p.id))
          : mockProviders.filter((p) => p.id === filterProvider)
        ).map((provider) => {
          const providerKeys = userKeys.filter((k) => k.provider_id === provider.id);
          if (providerKeys.length === 0) return null;

          return (
            <div key={provider.id}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${provider.color}`}
                >
                  {provider.name}
                </span>
                <span className="text-sm text-slate-600">({providerKeys.length} 个)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providerKeys.map((key) => (
                  <Card
                    key={key.id}
                    className={key.status === "inactive" ? "opacity-60" : ""}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate text-slate-900">
                              {key.key_name}
                            </p>
                            {key.status === "inactive" && (
                              <span className="text-xs text-slate-500">(已禁用)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-slate-600 font-mono">
                              {revealedKey === key.id
                                ? key.provider_key?.key_mask.replace("****", "xxxxxxxxxxxx")
                                : key.provider_key?.key_mask}
                            </p>
                            <button
                              onClick={() =>
                                setRevealedKey(revealedKey === key.id ? null : key.id)
                              }
                              className="p-1 text-slate-500 hover:text-slate-700 rounded"
                            >
                              {revealedKey === key.id ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {key.provider_key?.usage_limit && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-600">用量</span>
                                <span className="text-slate-900">
                                  {key.provider_key.current_usage.toLocaleString()} /{" "}
                                  {key.provider_key.usage_limit.toLocaleString()} tokens
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      (key.provider_key.current_usage /
                                        key.provider_key.usage_limit) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          {key.provider_key?.last_used_at && (
                            <p className="text-xs text-slate-500 mt-2">
                              最后使用: {key.provider_key.last_used_at}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleToggleStatus(key.id)}
                        >
                          {key.status === "active" ? "禁用" : "启用"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {filteredKeys.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <p className="text-slate-600">
              暂无分配的 API Key，请联系管理员分配
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
