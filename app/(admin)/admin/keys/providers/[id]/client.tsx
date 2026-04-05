"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockProviders,
  mockProviderKeys as initialKeys,
} from "@/lib/mock-data";
import type { ProviderConfig, ProviderKey } from "@/types";
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  AlertCircle,
  User,
  Ban,
  Trash2,
  Search,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";

interface ProviderDetailClientProps {
  providerId: string;
}

// localStorage key for persisting provider keys
const STORAGE_KEY = "token_service_provider_keys";

// Get keys from localStorage or use initial data
const getStoredKeys = (): ProviderKey[] => {
  if (typeof window === "undefined") return initialKeys;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return initialKeys;
    }
  }
  return initialKeys;
};

// Save keys to localStorage
const saveKeys = (keys: ProviderKey[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
};

export default function ProviderDetailClient({ providerId }: ProviderDetailClientProps) {
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [provider, setProvider] = useState<ProviderConfig | null>(null);
  const [keys, setKeys] = useState<ProviderKey[]>([]);
  const [activeTab, setActiveTab] = useState("pool");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 添加 Key 弹窗
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeysInput, setNewKeysInput] = useState("");

  // 控制哪些 Key 显示明文
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());
  // 跟踪已复制的 Key（用于显示复制成功提示）
  const [copiedKeys, setCopiedKeys] = useState<Set<number>>(new Set());

  // 编辑 Provider
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    base_url: "",
  });

  // 在客户端加载数据
  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      window.location.href = "/admin/login";
      return;
    }
    setIsAuthorized(true);

    // 查找 Provider
    const foundProvider = mockProviders.find((pr) => pr.id === providerId);
    if (foundProvider) {
      setProvider(foundProvider);
      setEditForm({
        name: foundProvider.name,
        description: foundProvider.description || "",
        base_url: foundProvider.base_url || "",
      });
    }

    // 查找 Keys (从 localStorage 或初始数据)
    const storedKeys = getStoredKeys();
    const providerKeys = storedKeys.filter((k) => k.provider_id === providerId);
    setKeys(providerKeys);

    setIsLoading(false);
  }, [providerId]);

  if (!isAuthorized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">加载中...</div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600 mb-4">未找到提供方: {providerId}</p>
          <p className="text-sm text-slate-500 mb-4">
            可用的提供方: {mockProviders.map(p => p.id).join(", ")}
          </p>
          <Button onClick={() => router.push("/admin/keys/providers")}>
            返回提供方列表
          </Button>
        </div>
      </div>
    );
  }

  // 统计
  const stats = {
    total: keys.length,
    available: keys.filter((k) => k.status === "available").length,
    allocated: keys.filter((k) => k.status === "allocated").length,
    disabled: keys.filter((k) => k.status === "disabled").length,
  };

  // 过滤 Keys
  const filteredKeys = keys.filter(
    (k) =>
      k.key_mask.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.allocated_to_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 保存 Provider 编辑
  const handleSaveProvider = () => {
    const updatedProvider = { ...provider, ...editForm };
    setProvider(updatedProvider);
    
    // 更新 localStorage 中的 providers
    const PROVIDERS_STORAGE_KEY = "token_service_providers";
    const stored = localStorage.getItem(PROVIDERS_STORAGE_KEY);
    if (stored) {
      try {
        const providers = JSON.parse(stored);
        const updatedProviders = providers.map((p: ProviderConfig) =>
          p.id === providerId ? { ...p, ...editForm } : p
        );
        localStorage.setItem(PROVIDERS_STORAGE_KEY, JSON.stringify(updatedProviders));
      } catch {
        // ignore parse error
      }
    }
    setIsEditing(false);
  };

  // 添加 Keys
  const handleAddKeys = () => {
    if (!newKeysInput.trim()) return;
    const keyLines = newKeysInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const newKeys: ProviderKey[] = keyLines.map((keyValue, index) => ({
      id: Date.now() + index,
      provider_id: providerId,
      key_mask: `sk-****${keyValue.slice(-4)}`,
      key_value: keyValue,
      status: "available",
      current_usage: 0,
      created_at: new Date().toISOString(),
    }));

    const updatedKeys = [...keys, ...newKeys];
    setKeys(updatedKeys);
    // 更新 localStorage
    const allKeys = getStoredKeys();
    saveKeys([...allKeys, ...newKeys]);
    setNewKeysInput("");
    setShowAddModal(false);
  };

  // 切换 Key 状态
  const toggleKeyStatus = (keyId: number) => {
    const updatedKeys = keys.map((k) => {
      if (k.id === keyId) {
        const newStatus: ProviderKey["status"] = k.status === "disabled" ? "available" : "disabled";
        return { ...k, status: newStatus };
      }
      return k;
    });
    setKeys(updatedKeys);
    // 更新 localStorage
    const allKeys = getStoredKeys();
    const newAllKeys = allKeys.map((k) => {
      if (k.id === keyId) {
        const newStatus: ProviderKey["status"] = k.status === "disabled" ? "available" : "disabled";
        return { ...k, status: newStatus };
      }
      return k;
    });
    saveKeys(newAllKeys);
  };

  // 删除 Key
  const handleDelete = (keyId: number) => {
    if (!confirm("确定要永久删除这个 API Key 吗？")) return;
    const updatedKeys = keys.filter((k) => k.id !== keyId);
    setKeys(updatedKeys);
    // 更新 localStorage
    const allKeys = getStoredKeys();
    const newAllKeys = allKeys.filter((k) => k.id !== keyId);
    saveKeys(newAllKeys);
  };

  // 切换 Key 显示/隐藏
  const toggleKeyVisibility = (keyId: number) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  // 复制 Key 到剪贴板
  const copyKeyToClipboard = async (key: ProviderKey) => {
    const textToCopy = key.key_value || key.key_mask;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedKeys((prev) => new Set(prev).add(key.id));
      // 2秒后清除复制成功状态
      setTimeout(() => {
        setCopiedKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(key.id);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error("复制失败:", err);
      alert("复制失败，请手动复制");
    }
  };

  // 状态徽章
  const getStatusBadge = (status: ProviderKey["status"]) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
            <CheckCircle2 className="w-3 h-3" />可用
          </span>
        );
      case "allocated":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
            <User className="w-3 h-3" />已分配
          </span>
        );
      case "disabled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
            <Ban className="w-3 h-3" />禁用
          </span>
        );
      case "exhausted":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">
            <AlertCircle className="w-3 h-3" />耗尽
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" />返回
        </Button>
      </div>

      {/* Provider 信息卡片 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">显示名称</label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">描述</label>
                    <Input
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">API Base URL</label>
                    <Input
                      value={editForm.base_url}
                      onChange={(e) => setEditForm({ ...editForm, base_url: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveProvider}>
                      <Save className="w-4 h-4 mr-1" />保存
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4 mr-1" />取消
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-slate-900">{provider.name}</h1>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">ID: {provider.id}</p>
                  {provider.description && (
                    <p className="text-slate-600 mb-2">{provider.description}</p>
                  )}
                  {provider.base_url && (
                    <p className="text-sm text-slate-500">API: {provider.base_url}</p>
                  )}
                </div>
              )}
            </div>
            {/* 统计 */}
            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-600">Keys 总数</p>
              </div>
              <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{stats.available}</p>
                <p className="text-xs text-green-600">可用</p>
              </div>
              <div className="text-center px-4 py-2 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{stats.allocated}</p>
                <p className="text-xs text-blue-600">已分配</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pool">
            资源池 ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="allocations">
            分配情况 ({stats.allocated})
          </TabsTrigger>
        </TabsList>

        {/* 资源池标签 - 显示所有 Keys */}
        <TabsContent value="pool" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="搜索 Key 掩码或用户..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />添加 Keys
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-medium">ID</th>
                    <th className="text-left py-3 px-4 font-medium">Key 掩码</th>
                    <th className="text-left py-3 px-4 font-medium">状态</th>
                    <th className="text-left py-3 px-4 font-medium">分配用户</th>
                    <th className="text-right py-3 px-4 font-medium">用量</th>
                    <th className="text-right py-3 px-4 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKeys.map((key) => (
                    <tr key={key.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-600">#{key.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-mono text-slate-900 max-w-[200px] truncate"
                            title={visibleKeys.has(key.id) && key.key_value ? key.key_value : key.key_mask}
                          >
                            {visibleKeys.has(key.id) && key.key_value
                              ? key.key_value
                              : key.key_mask}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleKeyVisibility(key.id)}
                            title={visibleKeys.has(key.id) ? "隐藏" : "显示"}
                          >
                            {visibleKeys.has(key.id) ? (
                              <EyeOff className="w-4 h-4 text-slate-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-slate-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyKeyToClipboard(key)}
                            title="复制"
                          >
                            {copiedKeys.has(key.id) ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-500" />
                            )}
                          </Button>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(key.status)}</td>
                      <td className="py-3 px-4">
                        {key.allocated_to_email ? (
                          <span className="text-slate-900">{key.allocated_to_email}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {key.current_usage > 0 ? key.current_usage.toLocaleString() : "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 只有非已分配的 Key 可以禁用/删除 */}
                          {key.status !== "allocated" && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => toggleKeyStatus(key.id)}>
                                {key.status === "disabled" ? "启用" : "禁用"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDelete(key.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {key.status === "allocated" && (
                            <span className="text-xs text-slate-400">请在用户管理回收</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredKeys.length === 0 && (
                <div className="text-center py-12 text-slate-600">暂无 Keys</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 分配情况标签 */}
        <TabsContent value="allocations" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-medium">Key 掩码</th>
                    <th className="text-left py-3 px-4 font-medium">分配用户</th>
                    <th className="text-left py-3 px-4 font-medium">分配时间</th>
                    <th className="text-right py-3 px-4 font-medium">用量</th>
                    <th className="text-right py-3 px-4 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {keys
                    .filter((k) => k.status === "allocated")
                    .map((key) => (
                      <tr key={key.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span 
                              className="font-mono text-slate-900 max-w-[200px] truncate"
                              title={visibleKeys.has(key.id) && key.key_value ? key.key_value : key.key_mask}
                            >
                              {visibleKeys.has(key.id) && key.key_value
                                ? key.key_value
                                : key.key_mask}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => toggleKeyVisibility(key.id)}
                              title={visibleKeys.has(key.id) ? "隐藏" : "显示"}
                            >
                              {visibleKeys.has(key.id) ? (
                                <EyeOff className="w-4 h-4 text-slate-500" />
                              ) : (
                                <Eye className="w-4 h-4 text-slate-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyKeyToClipboard(key)}
                              title="复制"
                            >
                              {copiedKeys.has(key.id) ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-500" />
                              )}
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-900">{key.allocated_to_email}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {key.allocated_at
                            ? new Date(key.allocated_at).toLocaleDateString("zh-CN")
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {key.current_usage.toLocaleString()}
                          {key.usage_limit && (
                            <span className="text-slate-500"> / {key.usage_limit.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            使用中
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {keys.filter((k) => k.status === "allocated").length === 0 && (
                <div className="text-center py-12 text-slate-600">暂无已分配的 Keys</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 添加 Keys 弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>添加 API Keys 到资源池</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">请输入 API Key，每行一个。系统将自动提取后 4 位作为掩码。</p>
              <textarea
                className="w-full h-40 rounded-md border border-slate-200 px-3 py-2 text-sm font-mono"
                placeholder="sk-xxxxxxxxxxxx1234&#10;sk-xxxxxxxxxxxx5678"
                value={newKeysInput}
                onChange={(e) => setNewKeysInput(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>取消</Button>
                <Button onClick={handleAddKeys} disabled={!newKeysInput.trim()}>
                  添加 ({newKeysInput.split("\n").filter((l) => l.trim()).length} 个)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
