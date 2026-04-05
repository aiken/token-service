"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProviderStats } from "@/lib/mock-data";
import { providersApi } from "@/lib/api-client";
import type { ProviderConfig } from "@/types";
import {
  Database,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Plus,
  Key,
  Users,
  Edit2,
  Trash2,
  ExternalLink,
} from "lucide-react";

// 颜色选项
const colorOptions = [
  { value: "bg-purple-100 text-purple-800", label: "紫色" },
  { value: "bg-blue-100 text-blue-800", label: "蓝色" },
  { value: "bg-orange-100 text-orange-800", label: "橙色" },
  { value: "bg-green-100 text-green-800", label: "绿色" },
  { value: "bg-cyan-100 text-cyan-800", label: "青色" },
  { value: "bg-indigo-100 text-indigo-800", label: "靛蓝" },
  { value: "bg-pink-100 text-pink-800", label: "粉色" },
  { value: "bg-red-100 text-red-800", label: "红色" },
];

export default function ProvidersPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // 弹窗状态
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderConfig | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    base_url: "",
    color: "bg-blue-100 text-blue-800",
  });

  // Load providers from API
  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      window.location.href = "/admin/login";
      return;
    }
    setIsAuthorized(true);
    
    // Load providers from API
    const loadProviders = async () => {
      setLoading(true);
      const result = await providersApi.getAll();
      if (result.success && result.data) {
        // Convert API data to ProviderConfig format (using code as id)
        const apiProviders = result.data as Array<{ id: number; code: string; name: string; description?: string; base_url?: string; status?: string; created_at?: string }>;
        const formattedProviders: ProviderConfig[] = apiProviders.map(p => ({
          id: p.code,  // Use code as the URL identifier
          name: p.name,
          color: "bg-blue-100 text-blue-800",  // Default color
          description: p.description,
          base_url: p.base_url,
          status: (p.status as 'active' | 'inactive') || 'active',
          created_at: p.created_at || new Date().toISOString(),
        }));
        setProviders(formattedProviders);
      }
      setLoading(false);
    };
    loadProviders();
  }, []);

  if (!isAuthorized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">加载中...</div>
      </div>
    );
  }

  // 打开添加弹窗
  const openAddModal = () => {
    setEditingProvider(null);
    setFormData({
      id: "",
      name: "",
      description: "",
      base_url: "",
      color: "bg-blue-100 text-blue-800",
    });
    setShowModal(true);
  };

  // 打开编辑弹窗
  const openEditModal = (provider: ProviderConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProvider(provider);
    setFormData({
      id: provider.id,
      name: provider.name,
      description: provider.description || "",
      base_url: provider.base_url || "",
      color: provider.color,
    });
    setShowModal(true);
  };

  // 保存 Provider
  const handleSave = async () => {
    if (!formData.id || !formData.name) {
      alert("请填写提供方 ID 和名称");
      return;
    }

    if (editingProvider) {
      // 编辑
      const result = await providersApi.update(parseInt(editingProvider.id), {
        name: formData.name,
        code: formData.id,
        base_url: formData.base_url,
        description: formData.description,
      });
      if (result.success) {
        setProviders(providers.map((p) =>
          p.id === editingProvider.id
            ? { ...p, ...formData, updated_at: new Date().toISOString() }
            : p
        ));
        setShowModal(false);
      } else {
        alert("保存失败: " + (result.error || "未知错误"));
      }
    } else {
      // 新增
      if (providers.some((p) => p.id === formData.id)) {
        alert("提供方 ID 已存在");
        return;
      }
      const result = await providersApi.create({
        name: formData.name,
        code: formData.id,
        base_url: formData.base_url,
        description: formData.description,
      });
      if (result.success && result.data) {
        const newProvider = result.data as ProviderConfig;
        setProviders([...providers, newProvider]);
        setShowModal(false);
      } else {
        alert("创建失败: " + (result.error || "未知错误"));
      }
    }
  };

  // 删除 Provider
  const handleDelete = async (providerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("确定要删除这个提供方吗？相关的 API Keys 也会被删除。")) return;
    const result = await providersApi.delete(parseInt(providerId));
    if (result.success) {
      setProviders(providers.filter((p) => p.id !== providerId));
    } else {
      alert("删除失败: " + (result.error || "未知错误"));
    }
  };

  // 计算全局统计
  const totalKeys = providers.reduce((sum, p) => sum + getProviderStats(p.id).total, 0);
  const totalAllocated = providers.reduce((sum, p) => sum + getProviderStats(p.id).allocated, 0);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">API Key 提供方</h1>
          <p className="mt-1 text-sm text-slate-600">
            管理各 AI 平台的 API Key 资源池和分配
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          添加提供方
        </Button>
      </div>

      {/* 全局统计 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">提供方总数</p>
                <p className="text-2xl font-bold text-slate-900">{providers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Key className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Keys 总数</p>
                <p className="text-2xl font-bold text-slate-900">{totalKeys}</p>
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
                <p className="text-sm text-slate-600">可用 Keys</p>
                <p className="text-2xl font-bold text-slate-900">
                  {providers.reduce((sum, p) => sum + getProviderStats(p.id).available, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">已分配</p>
                <p className="text-2xl font-bold text-slate-900">{totalAllocated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 提供方卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider) => {
          const stats = getProviderStats(provider.id);
          return (
            <Card
              key={provider.id}
              className="cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => router.push(`/admin/keys/providers/${provider.id}`)}
            >
              <CardContent className="p-5">
                {/* 头部 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        provider.status === "active" ? "bg-green-500" : "bg-slate-400"
                      }`}
                    />
                    <div>
                      <h3 className="font-semibold text-slate-900">{provider.name}</h3>
                      <p className="text-xs text-slate-500">{provider.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => openEditModal(provider, e)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(provider.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 描述 */}
                {provider.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{provider.description}</p>
                )}

                {/* 统计 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">资源池</p>
                    <p className="text-lg font-bold text-slate-900">{stats.total} 个</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">已分配</p>
                    <p className="text-lg font-bold text-slate-900">{stats.allocated} 个</p>
                  </div>
                </div>

                {/* 状态分布 */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded">
                    <CheckCircle2 className="w-3 h-3" />
                    可用 {stats.available}
                  </span>
                  {stats.disabled > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded">
                      <XCircle className="w-3 h-3" />
                      禁用 {stats.disabled}
                    </span>
                  )}
                  {stats.exhausted > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded">
                      <AlertCircle className="w-3 h-3" />
                      耗尽 {stats.exhausted}
                    </span>
                  )}
                </div>

                {/* 底部操作提示 */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">点击管理资源池和分配</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 添加/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingProvider ? "编辑提供方" : "添加提供方"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">提供方 ID <span className="text-red-500">*</span></label>
                <Input
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="例如：kimi"
                  disabled={!!editingProvider}
                />
                <p className="text-xs text-slate-500 mt-1">唯一标识，创建后不可修改</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">显示名称 <span className="text-red-500">*</span></label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：Kimi (Moonshot)"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">描述</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="例如：月之暗面大模型"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">API Base URL</label>
                <Input
                  value={formData.base_url}
                  onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                  placeholder="例如：https://api.moonshot.cn"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">颜色标识</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        formData.color === color.value
                          ? "ring-2 ring-offset-2 ring-slate-400 " + color.value
                          : color.value
                      }`}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  取消
                </Button>
                <Button onClick={handleSave}>
                  {editingProvider ? "保存修改" : "添加"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
