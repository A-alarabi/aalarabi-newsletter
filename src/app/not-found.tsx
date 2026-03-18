import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-4xl font-bold text-[#1a1a2e] mb-3">٤٠٤</h1>
      <h2 className="text-xl font-semibold text-gray-600 mb-2">الصفحة غير موجودة</h2>
      <p className="text-gray-400 mb-8 max-w-sm">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تمّت إزالتها.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-[#1a1a2e] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#16213e] transition-colors"
      >
        العودة إلى الرئيسية
      </Link>
    </div>
  )
}
