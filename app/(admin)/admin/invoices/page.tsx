"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

// 模拟发票数据
const mockInvoices = [
  { id: 1, user_id: 1, user_email: "user1@example.com", invoice_year: 2024, invoice_month: 1, amount_cny: 250, file_name: "发票_2024_01_user1.pdf", status: "available", created_at: "2024-01-05" },
  { id: 2, user_id: 2, user_email: "user2@example.com", invoice_year: 2024, invoice_month: 1, amount_cny: 180, file_name: "发票_2024_01_user2.pdf", status: "downloaded", created_at: "2024-01-05" },
  { id: 3, user_id: 1, user_email: "user1@example.com", invoice_year: 2023, invoice_month: 12, amount_cny: 320, file_name: "发票_2023_12_user1.pdf", status: "downloaded", created_at: "2023-12-05" },
  { id: 4, user_id: 3, user_email: "user3@example.com", invoice_year: 2023, invoice_month: 12, amount_cny: 50, file_name: "发票_2023_12_user3.pdf", status: "available", created_at: "2023-12-05" },
];

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 上传表单数据
  const [uploadData, setUploadData] = useState({
    userId: "",
    userEmail: "",
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    amount: "",
  });

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      window.location.href = "/admin/login";
      return;
    }
    setIsAuthorized(true);
  }, []);

  // 过滤发票
  const filteredInvoices = invoices.filter((invoice) =>
    invoice.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 处理文件上传
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert("请选择文件");
      return;
    }

    setUploading(true);

    // 模拟上传过程
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 添加新发票记录
    const newInvoice = {
      id: Date.now(),
      user_id: parseInt(uploadData.userId),
      user_email: uploadData.userEmail,
      invoice_year: parseInt(uploadData.year),
      invoice_month: parseInt(uploadData.month),
      amount_cny: parseFloat(uploadData.amount),
      file_name: file.name,
      status: "available",
      created_at: new Date().toISOString().split("T")[0],
    };

    setInvoices([newInvoice, ...invoices]);
    setUploading(false);
    setShowUploadForm(false);
    setUploadData({
      userId: "",
      userEmail: "",
      year: new Date().getFullYear().toString(),
      month: (new Date().getMonth() + 1).toString(),
      amount: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 删除发票
  const deleteInvoice = (invoiceId: number) => {
    if (!confirm("确定要删除这张发票吗？")) return;
    setInvoices(invoices.filter(inv => inv.id !== invoiceId));
  };

  // 下载发票
  const downloadInvoice = (invoice: typeof mockInvoices[0]) => {
    // 模拟下载
    alert(`下载发票: ${invoice.file_name}`);
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
          <h1 className="text-2xl font-bold text-slate-900">发票管理</h1>
          <p className="mt-1 text-sm text-slate-600">
            上传和管理用户发票
          </p>
        </div>
        <Button onClick={() => setShowUploadForm(true)}>上传发票</Button>
      </div>

      {/* 上传发票表单 */}
      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>上传新发票</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">用户ID</label>
                  <Input
                    type="number"
                    value={uploadData.userId}
                    onChange={(e) => setUploadData({ ...uploadData, userId: e.target.value })}
                    placeholder="1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">用户邮箱</label>
                  <Input
                    type="email"
                    value={uploadData.userEmail}
                    onChange={(e) => setUploadData({ ...uploadData, userEmail: e.target.value })}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">年份</label>
                  <Input
                    type="number"
                    value={uploadData.year}
                    onChange={(e) => setUploadData({ ...uploadData, year: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">月份</label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={uploadData.month}
                    onChange={(e) => setUploadData({ ...uploadData, month: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">金额</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={uploadData.amount}
                    onChange={(e) => setUploadData({ ...uploadData, amount: e.target.value })}
                    placeholder="250.00"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">发票文件 (PDF)</label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={uploading}>
                  {uploading ? "上传中..." : "上传"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 搜索栏 */}
      <div className="flex gap-4">
        <Input
          placeholder="搜索用户邮箱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* 发票列表 */}
      <Card>
        <CardHeader>
          <CardTitle>发票列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-4 font-medium">用户</th>
                  <th className="text-left py-3 px-4 font-medium">发票月份</th>
                  <th className="text-right py-3 px-4 font-medium">金额</th>
                  <th className="text-left py-3 px-4 font-medium">文件名</th>
                  <th className="text-center py-3 px-4 font-medium">状态</th>
                  <th className="text-left py-3 px-4 font-medium">上传时间</th>
                  <th className="text-right py-3 px-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">{invoice.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{invoice.user_email}</p>
                        <p className="text-xs text-slate-600">ID: {invoice.user_id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{invoice.invoice_year}年{invoice.invoice_month}月</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(invoice.amount_cny)}</td>
                    <td className="py-3 px-4 text-sm">{invoice.file_name}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          invoice.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {invoice.status === "available" ? "可下载" : "已下载"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{invoice.created_at}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => downloadInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          下载
                        </button>
                        <button
                          onClick={() => deleteInvoice(invoice.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">未找到匹配的发票</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
