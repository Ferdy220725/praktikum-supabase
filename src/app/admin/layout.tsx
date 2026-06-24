import Link from "next/link";
import { logoutAction } from "./login/actions";

const NAV_ITEMS = [
  { href: "/admin/sessions", label: "Sesi", num: "01" },
  { href: "/admin/questions", label: "Bank Soal", num: "02" },
  { href: "/admin/grades", label: "Manajemen Nilai", num: "03" },
  { href: "/admin/results", label: "Hasil Ujian", num: "04" },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="min-h-screen flex bg-ink">
      <aside className="w-64 border-r border-white/10 flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-7 h-7 rounded-sm bg-amber flex items-center justify-center font-display font-bold text-ink text-xs">
              L
            </div>
            <span className="font-display text-white">Panel Admin</span>
          </div>
          <p className="font-mono text-[11px] text-white/35">sesi pekerjaan aktif</p>
        </div>

        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-full text-left px-6 py-3 flex items-center gap-3 transition-colors hover:bg-white/[0.03] block"
            >
              <span className="font-mono text-xs text-amber">{item.num}</span>
              <span className="text-sm text-white/70">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-white/10">
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-white/45 hover:text-bad">
              Keluar dari sesi admin →
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-panel overflow-y-auto">{children}</main>
    </div>
  );
}
