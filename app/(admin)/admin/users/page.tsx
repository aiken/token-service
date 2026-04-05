"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatNumber } from "@/lib/utils";
import { mockUsers, mockProviders, mockProviderKeys, mockUserBills } from "@/lib/mock-data";
import type { ProviderKey, User, Bill } from "@/types";

type TabType = "overview" | "apikeys" | "bills";

// localStorage key for persisting provider keys (shared with provider detail page)
const STORAGE_KEY = "token_service_provider_keys";

// Get keys from localStorage or use initial data
const getStoredKeys = (): ProviderKey[] => {
  if (typeof window === "undefined") return mockProviderKeys;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return mockProviderKeys;
    }
  }
  return mockProviderKeys;
};

// Save keys to localStorage
const saveKeys = (keys: ProviderKey[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
};

// 格式化用量显示
function formatUsage(bytes: number): string {
  if (bytes === 0) return "0";
  if (bytes < 1000) return `${bytes}`;
  if (bytes < 1000000) return `${(bytes / 1000).toFixed(1)}K`;
  return `${(bytes / 1000000).toFixed(2)}M`;
}

// 获取Key状态显示文本和颜色
function getKeyStatusDisplay(status: ProviderKey["status"]) {
  switch (status) {
    case "available":
      return { text: "可用", color: "bg-green-100 text-green-800" };
    case "allocated":
      return { text: "已分配", color: "bg-blue-100 text-blue-800" };
    case "disabled":
      return { text: "已禁用", color: "bg-gray-100 text-gray-800" };
    case "exhausted":
      return { text: "已用完", color: "bg-red-100 text-red-800" };
    default:
      return { text: status, color: "bg-gray-100 text-gray-800" };
  }
}

export default function AdminUsersPage() {
  // 状态管理
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [providerKeys, setProviderKeys] = useState<ProviderKey[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 分配Key相关状态
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);

  // 添加用户弹窗状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    name: "",
    company_name: "",
    company_code: "",
    company_address: "",
    company_phone: "",
    bank_name: "",
    bank_account: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      window.location.href = "/admin/login";
      return;
    }
    setIsAuthorized(true);
    
    // Load provider keys from localStorage
    const storedKeys = getStoredKeys();
    setProviderKeys(storedKeys);
  }, []);

  // 过滤用户
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 获取用户分配的Keys
  const getUserAllocatedKeys = (userId: number): ProviderKey[] => {
    return providerKeys.filter(
      (key) => key.allocated_to === userId && key.status === "allocated"
    );
  };

  // 获取用户的API Keys数量
  const getUserKeyCount = (userId: number): number => {
    return getUserAllocatedKeys(userId).length;
  };

  // 获取用户的账单
  const getUserBills = (userId: number): Bill[] => {
    return mockUserBills[userId] || [];
  };

  // 切换用户状态
  const toggleUserStatus = (userId: number) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          const newStatus = user.status === "active" ? "suspended" : "active";
          return { ...user, status: newStatus };
        }
        return user;
      })
    );
  };

  // 查看用户详情
  const viewUserDetail = (user: User) => {
    setSelectedUser(user);
    setActiveTab("overview");
    setShowDetail(true);
    setShowAllocateModal(false);
    setSelectedProviderId("");
    setSelectedKeyId(null);
  };

  // 获取指定Provider的可用Keys
  const getAvailableKeysForProvider = (providerId: string): ProviderKey[] => {
    return providerKeys.filter(
      (key) => key.provider_id === providerId && key.status === "available"
    );
  };

  // 分配Key给用户
  const handleAllocateKey = () => {
    if (!selectedUser || !selectedKeyId) return;

    const now = new Date().toISOString();
    
    setProviderKeys((prev) => {
      const updated = prev.map((key) => {
        if (key.id === selectedKeyId) {
          return {
            ...key,
            status: "allocated" as const,
            allocated_to: selectedUser.id,
            allocated_to_email: selectedUser.email,
            allocated_at: now,
          };
        }
        return key;
      });
      // 保存到 localStorage
      saveKeys(updated);
      return updated;
    });

    // 重置选择
    setSelectedKeyId(null);
    setSelectedProviderId("");
    setShowAllocateModal(false);
  };

  // 回收Key
  const handleReclaimKey = (keyId: number) => {
    if (!confirm("确定要回收这个API Key吗？回收后该用户将无法继续使用。")) return;

    setProviderKeys((prev) => {
      const updated = prev.map((key) => {
        if (key.id === keyId) {
          return {
            ...key,
            status: "available" as const,
            allocated_to: undefined,
            allocated_to_email: undefined,
            allocated_at: undefined,
          };
        }
        return key;
      });
      // 保存到 localStorage
      saveKeys(updated);
      return updated;
    });
  };

  // 打开分配模态框
  const openAllocateModal = () => {
    setShowAllocateModal(true);
    setSelectedProviderId("");
    setSelectedKeyId(null);
  };

  // 关闭分配模态框
  const closeAllocateModal = () => {
    setShowAllocateModal(false);
    setSelectedProviderId("");
    setSelectedKeyId(null);
  };

  // 打开添加用户弹窗
  const openAddModal = () => {
    setShowAddModal(true);
    setNewUserForm({
      email: "",
      name: "",
      company_name: "",
      company_code: "",
      company_address: "",
      company_phone: "",
      bank_name: "",
      bank_account: "",
    });
    setFormErrors({});
  };

  // 关闭添加用户弹窗
  const closeAddModal = () => {
    setShowAddModal(false);
    setFormErrors({});
  };

  // 验证邮箱格式
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 验证统一社会信用代码（18位字母数字）
  const validateCompanyCode = (code: string): boolean => {
    const codeRegex = /^[A-Za-z0-9]{18}$/;
    return codeRegex.test(code);
  };

  // 验证表单
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newUserForm.email.trim()) {
      errors.email = "请输入联系人邮箱";
    } else if (!validateEmail(newUserForm.email)) {
      errors.email = "请输入有效的邮箱地址";
    }

    if (!newUserForm.name.trim()) {
      errors.name = "请输入联系人姓名";
    }

    if (!newUserForm.company_name.trim()) {
      errors.company_name = "请输入企业名称";
    }

    if (!newUserForm.company_code.trim()) {
      errors.company_code = "请输入统一社会信用代码";
    } else if (!validateCompanyCode(newUserForm.company_code)) {
      errors.company_code = "统一社会信用代码必须为18位字母或数字";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 处理添加用户
  const handleAddUser = () => {
    if (!validateForm()) return;

    const maxId = Math.max(...users.map((u) => u.id), 0);
    const now = new Date().toISOString();

    const newUser: User = {
      id: maxId + 1,
      email: newUserForm.email.trim(),
      name: newUserForm.name.trim(),
      company_name: newUserForm.company_name.trim(),
      company_code: newUserForm.company_code.trim().toUpperCase(),
      company_address: newUserForm.company_address.trim() || undefined,
      company_phone: newUserForm.company_phone.trim() || undefined,
      bank_name: newUserForm.bank_name.trim() || undefined,
      bank_account: newUserForm.bank_account.trim() || undefined,
      status: "active",
      email_verified: false,
      created_at: now,
      updated_at: now,
    };

    setUsers((prev) => [...prev, newUser]);
    closeAddModal();
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">用户管理</h1>
          <p className="mt-1 text-sm text-slate-500">
            管理系统所有企业用户及其API Key分配
          </p>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="flex gap-4">
        <Input
          placeholder="搜索企业名称、联系人或邮箱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button variant="outline">导出数据</Button>
        <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
          + 添加用户
        </Button>
      </div>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-4 font-medium">企业名称</th>
                  <th className="text-left py-3 px-4 font-medium">联系人</th>
                  <th className="text-left py-3 px-4 font-medium">邮箱</th>
                  <th className="text-center py-3 px-4 font-medium">API Keys数量</th>
                  <th className="text-center py-3 px-4 font-medium">状态</th>
                  <th className="text-left py-3 px-4 font-medium">注册时间</th>
                  <th className="text-right py-3 px-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4">{user.id}</td>
                    <td className="py-3 px-4 font-medium">{user.company_name}</td>
                    <td className="py-3 px-4">{user.name || "-"}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {user.email}
                        {user.email_verified && (
                          <span className="text-green-600" title="已验证">
                            ✓
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {getUserKeyCount(user.id)} 个
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : user.status === "suspended"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.status === "active"
                          ? "正常"
                          : user.status === "suspended"
                          ? "已暂停"
                          : "已删除"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{formatDate(user.created_at)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => viewUserDetail(user)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          管理
                        </button>
                        {user.status !== "deleted" && (
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={
                              user.status === "active"
                                ? "text-red-600 hover:text-red-800"
                                : "text-green-600 hover:text-green-800"
                            }
                          >
                            {user.status === "active" ? "暂停" : "恢复"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">未找到匹配的用户</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 用户详情弹窗 */}
      {showDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 头部 */}
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedUser.company_name}</h2>
                  <p className="text-sm text-slate-600">
                    {selectedUser.name} · {selectedUser.email}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-slate-500 hover:text-slate-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* 标签页 */}
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabType)}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="px-6 pt-4 border-b border-slate-200">
                <TabsList className="bg-transparent p-0 h-auto space-x-6">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-2"
                  >
                    概览
                  </TabsTrigger>
                  <TabsTrigger
                    value="apikeys"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-2"
                  >
                    API Key分配 ({getUserAllocatedKeys(selectedUser.id).length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="bills"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-2"
                  >
                    账单 ({getUserBills(selectedUser.id).length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-auto p-6">
                {/* 概览标签 */}
                <TabsContent value="overview" className="mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    {/* 基本信息 */}
                    <div className="col-span-2 mb-2">
                      <h3 className="text-sm font-medium text-slate-500 mb-3">
                        基本信息
                      </h3>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium mb-1">用户ID</p>
                      <p className="text-slate-900 font-semibold text-lg">
                        {selectedUser.id}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium mb-1">邮箱</p>
                      <p className="text-slate-900 font-semibold">
                        {selectedUser.email}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium mb-1">联系人</p>
                      <p className="text-slate-900 font-semibold text-lg">
                        {selectedUser.name || "-"}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium mb-1">状态</p>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ${
                          selectedUser.status === "active"
                            ? "bg-green-100 text-green-700"
                            : selectedUser.status === "suspended"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedUser.status === "active"
                          ? "正常"
                          : selectedUser.status === "suspended"
                          ? "已暂停"
                          : "已删除"}
                      </span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        API Keys数量
                      </p>
                      <p className="text-slate-900 font-semibold text-lg">
                        {getUserAllocatedKeys(selectedUser.id).length} 个
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium mb-1">注册时间</p>
                      <p className="text-slate-900 font-semibold">
                        {formatDate(selectedUser.created_at)}
                      </p>
                    </div>

                    {/* 企业信息 */}
                    <div className="col-span-2 mt-4 mb-2">
                      <h3 className="text-sm font-medium text-slate-500 mb-3">
                        企业信息
                      </h3>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        企业名称
                      </p>
                      <p className="text-slate-900 font-semibold">
                        {selectedUser.company_name}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        统一社会信用代码
                      </p>
                      <p className="text-slate-900 font-semibold">
                        {selectedUser.company_code}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg col-span-2">
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        企业地址
                      </p>
                      <p className="text-slate-900 font-semibold">
                        {selectedUser.company_address || "-"}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        企业电话
                      </p>
                      <p className="text-slate-900 font-semibold">
                        {selectedUser.company_phone || "-"}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        开户银行
                      </p>
                      <p className="text-slate-900 font-semibold">
                        {selectedUser.bank_name || "-"}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg col-span-2">
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        银行账号
                      </p>
                      <p className="text-slate-900 font-semibold">
                        {selectedUser.bank_account || "-"}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* API Key分配标签 */}
                <TabsContent value="apikeys" className="mt-0 space-y-4">
                  {/* 分配新Key按钮 */}
                  {!showAllocateModal && (
                    <Button onClick={openAllocateModal}>+ 分配新Key</Button>
                  )}

                  {/* 分配Key模态框 */}
                  {showAllocateModal && (
                    <Card className="border-blue-200 bg-blue-50/50">
                      <CardHeader>
                        <CardTitle className="text-base">分配新API Key</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* 选择Provider */}
                        <div>
                          <label className="text-sm font-medium block mb-2">
                            选择服务商
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {mockProviders.map((provider) => (
                              <button
                                key={provider.id}
                                onClick={() => {
                                  setSelectedProviderId(provider.id);
                                  setSelectedKeyId(null);
                                }}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  selectedProviderId === provider.id
                                    ? provider.color + " ring-2 ring-offset-1 ring-slate-400"
                                    : "bg-white border border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                {provider.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 选择Key */}
                        {selectedProviderId && (
                          <div>
                            <label className="text-sm font-medium block mb-2">
                              选择可用的Key
                              <span className="text-slate-500 font-normal ml-2">
                                (共{" "}
                                {
                                  getAvailableKeysForProvider(selectedProviderId)
                                    .length
                                }{" "}
                                个可用)
                              </span>
                            </label>
                            {getAvailableKeysForProvider(selectedProviderId)
                              .length > 0 ? (
                              <div className="grid grid-cols-2 gap-2">
                                {getAvailableKeysForProvider(selectedProviderId).map(
                                  (key) => (
                                    <button
                                      key={key.id}
                                      onClick={() => setSelectedKeyId(key.id)}
                                      className={`p-3 rounded-lg border text-left transition-colors ${
                                        selectedKeyId === key.id
                                          ? "border-blue-500 bg-blue-50"
                                          : "border-slate-200 bg-white hover:border-slate-300"
                                      }`}
                                    >
                                      <div className="font-mono text-sm">
                                        {key.key_mask}
                                      </div>
                                      <div className="text-xs text-slate-500 mt-1">
                                        创建于 {formatDate(key.created_at)}
                                      </div>
                                    </button>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="p-4 bg-slate-100 rounded-lg text-slate-500 text-center">
                                该服务商暂无可用的Key
                              </div>
                            )}
                          </div>
                        )}

                        {/* 操作按钮 */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={handleAllocateKey}
                            disabled={!selectedKeyId}
                          >
                            确认分配
                          </Button>
                          <Button variant="outline" onClick={closeAllocateModal}>
                            取消
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 已分配的Keys列表 */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-500">
                      已分配的API Keys
                    </h3>
                    {getUserAllocatedKeys(selectedUser.id).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getUserAllocatedKeys(selectedUser.id).map((key) => {
                          const provider = mockProviders.find(
                            (p) => p.id === key.provider_id
                          );
                          const statusDisplay = getKeyStatusDisplay(key.status);
                          const usagePercent = key.usage_limit
                            ? Math.min(
                                100,
                                Math.round(
                                  (key.current_usage / key.usage_limit) * 100
                                )
                              )
                            : null;

                          return (
                            <Card key={key.id}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded ${provider?.color}`}
                                      >
                                        {provider?.name}
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded ${statusDisplay.color}`}
                                      >
                                        {statusDisplay.text}
                                      </span>
                                    </div>
                                    <p className="font-mono text-sm text-slate-700">
                                      {key.key_mask}
                                    </p>
                                    {key.last_used_at && (
                                      <p className="text-xs text-slate-500 mt-1">
                                        最后使用:{" "}
                                        {formatDate(key.last_used_at)}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* 用量进度条 */}
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>用量</span>
                                    <span>
                                      {formatUsage(key.current_usage)}
                                      {key.usage_limit
                                        ? ` / ${formatUsage(key.usage_limit)}`
                                        : ""}
                                    </span>
                                  </div>
                                  {key.usage_limit && (
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          usagePercent && usagePercent > 80
                                            ? "bg-red-500"
                                            : "bg-blue-500"
                                        }`}
                                        style={{ width: `${usagePercent}%` }}
                                      />
                                    </div>
                                  )}
                                  {!key.usage_limit && (
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                      <div
                                        className="h-2 rounded-full bg-slate-400"
                                        style={{
                                          width: `${Math.min(
                                            100,
                                            (key.current_usage / 1000000) * 100
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* 操作按钮 */}
                                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                                  <button
                                    onClick={() => handleReclaimKey(key.id)}
                                    className="text-sm text-red-600 hover:text-red-800"
                                  >
                                    回收
                                  </button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
                        该用户暂未分配任何API Keys
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* 账单标签 */}
                <TabsContent value="bills" className="mt-0 space-y-4">
                  {getUserBills(selectedUser.id).length > 0 ? (
                    getUserBills(selectedUser.id).map((bill) => (
                      <Card key={bill.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {bill.bill_year}年{bill.bill_month}月账单
                              </p>
                              <p className="text-sm text-slate-600">
                                用量:{" "}
                                {formatNumber(bill.total_tokens)} tokens
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">
                                ¥{bill.total_cost.toFixed(2)}
                              </p>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  bill.status === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : bill.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {bill.status === "paid"
                                  ? "已支付"
                                  : bill.status === "pending"
                                  ? "待支付"
                                  : "已逾期"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      该用户暂无账单
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>

            {/* 底部 */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-between">
              <Button variant="outline" onClick={() => setShowDetail(false)}>
                关闭
              </Button>
              <Button
                variant={
                  selectedUser.status === "active" ? "destructive" : "default"
                }
                onClick={() => {
                  toggleUserStatus(selectedUser.id);
                }}
              >
                {selectedUser.status === "active" ? "暂停账户" : "恢复账户"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 添加用户弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 头部 */}
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">添加新用户</h2>
                <button
                  onClick={closeAddModal}
                  className="text-slate-500 hover:text-slate-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* 表单内容 */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-3">
                    基本信息
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        联系人邮箱 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="请输入邮箱"
                        value={newUserForm.email}
                        onChange={(e) =>
                          setNewUserForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className={formErrors.email ? "border-red-500" : ""}
                      />
                      {formErrors.email && (
                        <p className="text-xs text-red-500">{formErrors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        联系人姓名 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="请输入姓名"
                        value={newUserForm.name}
                        onChange={(e) =>
                          setNewUserForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className={formErrors.name ? "border-red-500" : ""}
                      />
                      {formErrors.name && (
                        <p className="text-xs text-red-500">{formErrors.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 企业信息 */}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-3">
                    企业信息
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        企业名称 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="请输入企业名称"
                        value={newUserForm.company_name}
                        onChange={(e) =>
                          setNewUserForm((prev) => ({
                            ...prev,
                            company_name: e.target.value,
                          }))
                        }
                        className={formErrors.company_name ? "border-red-500" : ""}
                      />
                      {formErrors.company_name && (
                        <p className="text-xs text-red-500">
                          {formErrors.company_name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        统一社会信用代码 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="18位字母或数字"
                        value={newUserForm.company_code}
                        onChange={(e) =>
                          setNewUserForm((prev) => ({
                            ...prev,
                            company_code: e.target.value,
                          }))
                        }
                        className={formErrors.company_code ? "border-red-500" : ""}
                      />
                      {formErrors.company_code && (
                        <p className="text-xs text-red-500">
                          {formErrors.company_code}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">企业地址</label>
                      <Input
                        placeholder="请输入企业注册地址"
                        value={newUserForm.company_address}
                        onChange={(e) =>
                          setNewUserForm((prev) => ({
                            ...prev,
                            company_address: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">企业电话</label>
                      <Input
                        placeholder="请输入企业联系电话"
                        value={newUserForm.company_phone}
                        onChange={(e) =>
                          setNewUserForm((prev) => ({
                            ...prev,
                            company_phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">开户银行</label>
                      <Input
                        placeholder="请输入开户银行"
                        value={newUserForm.bank_name}
                        onChange={(e) =>
                          setNewUserForm((prev) => ({
                            ...prev,
                            bank_name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">银行账号</label>
                      <Input
                        placeholder="请输入银行账号"
                        value={newUserForm.bank_account}
                        onChange={(e) =>
                          setNewUserForm((prev) => ({
                            ...prev,
                            bank_account: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部操作按钮 */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={closeAddModal}>
                取消
              </Button>
              <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
                确认添加
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
