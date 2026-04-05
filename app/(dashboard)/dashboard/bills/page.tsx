"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const mockBills = [
  { year: 2024, month: 1, tokens: 2500000, cost: 250, status: "paid" },
  { year: 2023, month: 12, tokens: 3200000, cost: 320, status: "paid" },
  { year: 2023, month: 11, tokens: 2800000, cost: 280, status: "paid" },
  { year: 2023, month: 10, tokens: 2100000, cost: 210, status: "paid" },
];

export default function BillsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">账单</h1>
        <p className="mt-1 text-sm text-slate-500">
          查看您的历史账单记录
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>月度账单</CardTitle>
          <CardDescription>最近12个月的账单记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium">账单月份</th>
                  <th className="text-right py-3 px-4 font-medium">Token用量</th>
                  <th className="text-right py-3 px-4 font-medium">金额</th>
                  <th className="text-center py-3 px-4 font-medium">状态</th>
                  <th className="text-right py-3 px-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {mockBills.map((bill) => (
                  <tr key={`${bill.year}-${bill.month}`} className="border-b border-slate-100">
                    <td className="py-3 px-4">{bill.year}年{bill.month}月</td>
                    <td className="py-3 px-4 text-right">{bill.tokens.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(bill.cost)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        bill.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : bill.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {bill.status === "paid" ? "已支付" : bill.status === "pending" ? "待支付" : "已逾期"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
