export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 사이드 메뉴 — Issue #5에서 구현 */}
      <aside className="w-56 shrink-0 bg-white shadow" />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 상단 네비게이션 — Issue #5에서 구현 */}
        <header className="h-14 shrink-0 bg-white shadow-sm" />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
