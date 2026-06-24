import Link from "next/link";

export default function GatePage(): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col bg-ink grain">
      <header className="px-6 sm:px-10 py-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-amber flex items-center justify-center font-display font-bold text-ink text-sm">
            L
          </div>
          <span className="font-display text-white text-lg tracking-tight">Lab Praktikum</span>
        </div>
        <span className="font-mono text-xs text-white/40">ruang ujian terkendali</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl w-full">
          <p className="font-mono text-xs text-amber mb-3 tracking-widest uppercase">001 — Pintu Masuk</p>
          <h1 className="font-display text-4xl sm:text-6xl text-white leading-[1.05] mb-6">
            Satu pintu,
            <br />
            dua peran.
          </h1>
          <p className="text-white/55 max-w-xl mb-10 leading-relaxed">
            Admin memegang kendali penuh atas sesi, bank soal, dan rekap nilai. Praktikan masuk
            lewat kode unik sesi untuk mengerjakan ujian dengan waktu yang berjalan per soal.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/admin/login"
              className="group text-left p-6 rounded-md bg-panel border border-line hover:border-amber transition-colors block"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-slate">/admin</span>
                <span className="text-amber group-hover:translate-x-1 transition-transform inline-block">
                  →
                </span>
              </div>
              <h2 className="font-display text-xl mb-1">Panel Admin</h2>
              <p className="text-sm text-slate">Kelola sesi, soal, dan nilai akhir.</p>
            </Link>

            <Link
              href="/exam"
              className="group text-left p-6 rounded-md bg-transparent border border-white/15 hover:border-amber transition-colors block"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-white/40">/ujian</span>
                <span className="text-amber group-hover:translate-x-1 transition-transform inline-block">
                  →
                </span>
              </div>
              <h2 className="font-display text-xl text-white mb-1">Ruang Praktikan</h2>
              <p className="text-sm text-white/50">Masuk dengan kode unik sesi.</p>
            </Link>
          </div>
        </div>
      </main>
      <footer className="px-6 sm:px-10 py-4 text-center text-white/25 text-xs font-mono">
        akses terproteksi · data tersimpan di Postgres
      </footer>
    </div>
  );
}
