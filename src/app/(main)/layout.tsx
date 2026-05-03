import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthProvider } from "@/lib/auth-context";
import type { AuthUser } from "@/types";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialUser: AuthUser | null = null;

  const cookieStore = await cookies();
  const rawToken = cookieStore.get("auth-token")?.value;
  if (rawToken) {
    try {
      const payload = verifyToken(rawToken);
      const rep = await prisma.salesRep.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, email: true, role: true },
      });
      if (rep) {
        initialUser = {
          id: rep.id,
          name: rep.name,
          email: rep.email,
          role: rep.role as AuthUser["role"],
        };
      }
    } catch {
      // Invalid token — initialUser remains null
    }
  }

  return (
    <AuthProvider initialUser={initialUser}>
      <div className="flex h-screen bg-gray-100">
        {/* 사이드 메뉴 — Issue #5에서 구현 */}
        <aside className="w-56 shrink-0 bg-white shadow" />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* 상단 네비게이션 — Issue #5에서 구현 */}
          <header className="h-14 shrink-0 bg-white shadow-sm" />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
