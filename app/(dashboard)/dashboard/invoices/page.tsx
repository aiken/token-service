"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const mockInvoices = [
  { id: 1, year: 2024, month: 1, amount: 250, fileName: "发票_2024_01.pdf", status: "available" },
  { id: 2, year: 2023, month: 12, amount: 320, fileName: "发票_2023_12.pdf", status: "downloaded" },
  { id: 3, year: 2023, month: 11, amount: 280, fileName: "发票_2023_11.pdf", status: "downloaded" },
];

export default function InvoicesPage() {
  const handleDownload = (id: number) => {
    // TODO: 实现下载逻辑
    console.log(`Downloading invoice ${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">发票</h1>
        <p className="mt-1 text-sm text-slate-600">
          下载您的月度发票
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>发票列表</CardTitle>
          <CardDescription>可下载的月度发票</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {invoice.year}年{invoice.month}月发票
                  </p>
                  <p className="text-sm text-slate-600">
                    金额: {formatCurrency(invoice.amount)}
                  </p>
                  <p className="text-xs text-slate-500">{invoice.fileName}</p>
                </div>
                <div className="flex items-center gap-3">
                  {invoice.status === "downloaded" && (
                    <span className="text-xs text-slate-500">已下载</span>
                  )}
                  <button
                    onClick={() => handleDownload(invoice.id)}
                    className="px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800"
                  >
                    下载
                  </button>
                </div>
              </div>
            ))}

            {mockInvoices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-600">暂无发票</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
