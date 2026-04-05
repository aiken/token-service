import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-slate-900">Token Service</h1>
        <p className="text-lg text-slate-600">AI API 用量管理与计费平台</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800"
          >
            用户登录
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
          >
            管理后台
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-2">🔑 API Key 管理</h3>
            <p className="text-sm text-slate-600">集中管理 Kimi、GLM、Claude 等多个平台的 API Keys</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-2">📊 用量统计</h3>
            <p className="text-sm text-slate-600">实时监控 API 调用量，日/周/月多维度分析</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-2">💰 账单管理</h3>
            <p className="text-sm text-slate-600">自动生成月度账单，支持发票下载</p>
          </div>
        </div>
      </div>
    </div>
  );
}
