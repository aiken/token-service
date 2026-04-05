"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Bill, BillDetail } from "@/types";

// 支持的服务平台
const providers = [
  { value: "kimi", label: "Kimi", color: "bg-purple-100 text-purple-800" },
  { value: "glm", label: "GLM", color: "bg-blue-100 text-blue-800" },
  { value: "claude", label: "Claude", color: "bg-orange-100 text-orange-800" },
  { value: "openai", label: "OpenAI", color: "bg-green-100 text-green-800" },
  { value: "azure", label: "Azure", color: "bg-cyan-100 text-cyan-800" },
  { value: "gemini", label: "Gemini", color: "bg-indigo-100 text-indigo-800" },
  { value: "seedance", label: "Seedance 2.0", color: "bg-pink-100 text-pink-800" },
];

// 模拟账单明细数据
const mockBillDetails: Record<number, BillDetail[]> = {
  1: [ // user1@example.com 2024年1月账单
    { id: 1, bill_id: 1, api_key_id: 1, api_key_name: "生产环境-主Key", provider: "kimi", total_tokens: 1500000, cost: 150 },
    { id: 2, bill_id: 1, api_key_id: 2, api_key_name: "测试环境", provider: "kimi", total_tokens: 500000, cost: 50 },
    { id: 3, bill_id: 1, api_key_id: 3, api_key_name: "智谱生产", provider: "glm", total_tokens: 500000, cost: 50 },
  ],
  4: [ // user1@example.com 2023年12月账单
    { id: 4, bill_id: 4, api_key_id: 1, api_key_name: "生产环境-主Key", provider: "kimi", total_tokens: 2000000, cost: 200 },
    { id: 5, bill_id: 4, api_key_id: 3, api_key_name: "智谱生产", provider: "glm", total_tokens: 1200000, cost: 120 },
  ],
  2: [ // user2@example.com 2024年1月账单
    { id: 6, bill_id: 2, api_key_id: 4, api_key_name: "开发环境", provider: "claude", total_tokens: 1000000, cost: 100 },
    { id: 7, bill_id: 2, api_key_id: 5, api_key_name: "GPT-4测试", provider: "openai", total_tokens: 800000, cost: 80 },
  ],
  6: [ // user2@example.com 2023年11月账单
    { id: 8, bill_id: 6, api_key_id: 4, api_key_name: "开发环境", provider: "claude", total_tokens: 1500000, cost: 150 },
    { id: 9, bill_id: 6, api_key_id: 5, api_key_name: "GPT-4测试", provider: "openai", total_tokens: 600000, cost: 60 },
  ],
  3: [ // user3@example.com 2024年1月账单
    { id: 10, bill_id: 3, api_key_id: 6, api_key_name: "个人项目", provider: "kimi", total_tokens: 500000, cost: 50 },
  ],
  5: [ // user4@example.com 2023年12月账单
    { id: 11, bill_id: 5, api_key_id: 7, api_key_name: "生产环境", provider: "kimi", total_tokens: 2500000, cost: 250 },
    { id: 12, bill_id: 5, api_key_id: 8, api_key_name: "GLM生产", provider: "glm", total_tokens: 1500000, cost: 150 },
    { id: 13, bill_id: 5, api_key_id: 9, api_key_name: "Claude测试", provider: "claude", total_tokens: 1200000, cost: 120 },
  ],
};

// 模拟账单数据
const mockBills: Bill[] = [
  { id: 1, user_id: 1, user_email: "user1@example.com", bill_year: 2024, bill_month: 1, total_tokens: 2500000, total_cost: 250, status: "paid", created_at: "2024-01-01" },
  { id: 2, user_id: 2, user_email: "user2@example.com", bill_year: 2024, bill_month: 1, total_tokens: 1800000, total_cost: 180, status: "paid", created_at: "2024-01-01" },
  { id: 3, user_id: 3, user_email: "user3@example.com", bill_year: 2024, bill_month: 1, total_tokens: 500000, total_cost: 50, status: "pending", created_at: "2024-01-01" },
  { id: 4, user_id: 1, user_email: "user1@example.com", bill_year: 2023, bill_month: 12, total_tokens: 3200000, total_cost: 320, status: "paid", created_at: "2023-12-01" },
  { id: 5, user_id: 4, user_email: "user4@example.com", bill_year: 2023, bill_month: 12, total_tokens: 5200000, total_cost: 520, status: "overdue", created_at: "2023-12-01" },
  { id: 6, user_id: 2, user_email: "user2@example.com", bill_year: 2023, bill_month: 11, total_tokens: 2100000, total_cost: 210, status: "paid", created_at: "2023-11-01" },
];

export default function AdminBillsPage() {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      window.location.href = "/admin/login";
      return;
    }
    setIsAuthorized(true);
  }, []);

  // 获取账单明细
  const getBillDetails = (billId: number): BillDetail[] => {
    return mockBillDetails[billId] || [];
  };

  // 过滤账单
  const filteredBills = bills.filter((bill) => {
    const matchSearch = bill.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMonth = filterMonth ? `${bill.bill_year}-${String(bill.bill_month).padStart(2, "0")}` === filterMonth : true;
    return matchSearch && matchMonth;
  });

  // 更新账单状态
  const updateBillStatus = (billId: number, newStatus: string) => {
    setBills(bills.map(bill => bill.id === billId ? { ...bill, status: newStatus as "paid" | "pending" | "overdue" } : bill));
  };

  // 查看详情
  const viewDetail = (bill: Bill) => {
    setSelectedBill(bill);
    setShowDetail(true);
  };

  // 计算统计数据
  const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.total_cost, 0);
  const paidAmount = filteredBills.filter(b => b.status === "paid").reduce((sum, bill) => sum + bill.total_cost, 0);
  const pendingAmount = filteredBills.filter(b => b.status === "pending").reduce((sum, bill) => sum + bill.total_cost, 0);
  const overdueAmount = filteredBills.filter(b => b.status === "overdue").reduce((sum, bill) => sum + bill.total_cost, 0);

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
          <h1 className="text-2xl font-bold text-slate-900">账单管理</h1>
          <p className="mt-1 text-sm text-slate-500">
            管理所有用户的月度账单及API Key用量明细
          </p>
        </div>
        <Button>生成新账单</Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-slate-500">账单总额</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-slate-500">已支付</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-slate-500">待支付</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-slate-500">已逾期</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</p>
          </CardHeader>
        </Card>
      </div>

      {/* 筛选栏 */}
      <div className="flex gap-4">
        <Input
          placeholder="搜索用户邮箱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="max-w-xs"
        />
        <Button variant="outline" onClick={() => { setSearchTerm(""); setFilterMonth(""); }}>
          重置筛选
        </Button>
      </div>

      {/* 账单列表 */}
      <Card>
        <CardHeader>
          <CardTitle>账单列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-4 font-medium">用户</th>
                  <th className="text-left py-3 px-4 font-medium">账单月份</th>
                  <th className="text-right py-3 px-4 font-medium">Token用量</th>
                  <th className="text-right py-3 px-4 font-medium">金额</th>
                  <th className="text-center py-3 px-4 font-medium">状态</th>
                  <th className="text-right py-3 px-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">{bill.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{bill.user_email}</p>
                        <p className="text-xs text-slate-500">ID: {bill.user_id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{bill.bill_year}年{bill.bill_month}月</td>
                    <td className="py-3 px-4 text-right">{formatNumber(bill.total_tokens)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(bill.total_cost)}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          bill.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : bill.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {bill.status === "paid" ? "已支付" : bill.status === "pending" ? "待支付" : "已逾期"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => viewDetail(bill)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          查看明细
                        </button>
                        {bill.status !== "paid" && (
                          <button
                            onClick={() => updateBillStatus(bill.id, "paid")}
                            className="text-green-600 hover:text-green-800"
                          >
                            标记已付
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBills.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">未找到匹配的账单</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 账单详情弹窗 - 包含API Key用量明细 */}
      {showDetail && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 头部 */}
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedBill.bill_year}年{selectedBill.bill_month}月账单
                  </h2>
                  <p className="text-sm text-slate-500">{selectedBill.user_email}</p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-auto p-6">
              {/* 账单概览 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 font-medium">总用量</p>
                  <p className="text-2xl font-bold text-slate-900">{formatNumber(selectedBill.total_tokens)}</p>
                  <p className="text-xs text-slate-500">tokens</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 font-medium">总金额</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(selectedBill.total_cost)}</p>
                  <p className="text-xs text-slate-500">CNY</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 font-medium">状态</p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      selectedBill.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : selectedBill.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedBill.status === "paid" ? "已支付" : selectedBill.status === "pending" ? "待支付" : "已逾期"}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">生成于 {selectedBill.created_at}</p>
                </div>
              </div>

              {/* API Key 用量明细 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">API Key 用量明细</h3>
                
                {getBillDetails(selectedBill.id).length > 0 ? (
                  <div className="space-y-3">
                    {/* 明细表格 */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="text-left py-2 px-3 font-medium">API Key</th>
                            <th className="text-left py-2 px-3 font-medium">平台</th>
                            <th className="text-right py-2 px-3 font-medium">Token用量</th>
                            <th className="text-right py-2 px-3 font-medium">占比</th>
                            <th className="text-right py-2 px-3 font-medium">费用</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getBillDetails(selectedBill.id).map((detail) => {
                            const provider = providers.find(p => p.value === detail.provider);
                            const percentage = ((detail.total_tokens / selectedBill.total_tokens) * 100).toFixed(1);
                            return (
                              <tr key={detail.id} className="border-b border-slate-100">
                                <td className="py-3 px-3">
                                  <p className="font-medium text-slate-900">{detail.api_key_name}</p>
                                  <p className="text-xs text-slate-500">ID: {detail.api_key_id}</p>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`text-xs px-2 py-0.5 rounded ${provider?.color}`}>
                                    {provider?.label}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">{formatNumber(detail.total_tokens)}</td>
                                <td className="py-3 px-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                      <div
                                        className={`${provider?.color.split(" ")[0]} h-1.5 rounded-full`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-slate-600">{percentage}%</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right font-medium">{formatCurrency(detail.cost)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 font-medium">
                            <td className="py-3 px-3" colSpan={2}>合计</td>
                            <td className="py-3 px-3 text-right">{formatNumber(selectedBill.total_tokens)}</td>
                            <td className="py-3 px-3 text-right">100%</td>
                            <td className="py-3 px-3 text-right">{formatCurrency(selectedBill.total_cost)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* 平台用量分布图 */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">平台用量分布</h4>
                      <div className="space-y-2">
                        {Array.from(new Set(getBillDetails(selectedBill.id).map(d => d.provider))).map((providerValue) => {
                          const provider = providers.find(p => p.value === providerValue);
                          const providerTotal = getBillDetails(selectedBill.id)
                            .filter(d => d.provider === providerValue)
                            .reduce((sum, d) => sum + d.total_tokens, 0);
                          const percentage = ((providerTotal / selectedBill.total_tokens) * 100).toFixed(1);
                          return (
                            <div key={providerValue} className="flex items-center gap-3">
                              <span className="text-sm w-20 text-slate-700">{provider?.label}</span>
                              <div className="flex-1 bg-slate-100 rounded-full h-2">
                                <div
                                  className={`${provider?.color.split(" ")[0]} h-2 rounded-full`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-700 w-16 text-right">{percentage}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600">
                    暂无API Key用量明细
                  </div>
                )}
              </div>
            </div>

            {/* 底部 */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-between">
              <Button variant="outline" onClick={() => setShowDetail(false)}>
                关闭
              </Button>
              {selectedBill.status !== "paid" && (
                <Button 
                  onClick={() => { updateBillStatus(selectedBill.id, "paid"); setShowDetail(false); }}
                >
                  标记为已支付
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
