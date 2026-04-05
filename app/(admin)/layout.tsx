"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "概览", href: "/admin" },
  { name: "用户管理", href: "/admin/users" },
  { name: "API Keys", href: "/admin/keys" },
  { name: "账单管理", href: "/admin/bills" },
  { name: "发票管理", href: "/admin/invoices" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 登录页面不需要布局
  if (pathname === "/admin/login" || pathname === "/admin/login/") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航 */}
      <nav className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">管理后台</span>
              <span className="ml-2 text-slate-400">|</span>
              <span className="ml-2 text-slate-300">Token Service</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white">
                返回前台
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("admin_token");
                  window.location.href = "/admin/login";
                }}
                className="text-sm text-slate-300 hover:text-white"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 二级导航 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "inline-flex items-center py-4 px-1 border-b-2 text-sm font-medium",
                  pathname === item.href || pathname === item.href + "/"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
