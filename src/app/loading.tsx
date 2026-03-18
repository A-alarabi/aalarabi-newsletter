export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#1a1a2e] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">جارٍ التحميل...</p>
      </div>
    </div>
  )
}
