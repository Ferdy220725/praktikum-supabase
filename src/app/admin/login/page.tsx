"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { loginAction, type LoginActionState } from "./actions";

const initialState: LoginActionState = { error: null };

export default function AdminLoginPage(): React.JSX.Element {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-ink grain">
      <form
        action={formAction}
        className={`w-full max-w-sm bg-panel rounded-md p-8 border border-line ${
          state.error ? "shake" : ""
        }`}
      >
        <input type="hidden" name="redirectTarget" value="/admin/sessions" />
        <p className="font-mono text-xs text-amber uppercase tracking-widest mb-2">
          Akses Terproteksi
        </p>
        <h1 className="font-display text-2xl mb-6">Masuk sebagai Admin</h1>

        <label htmlFor="password" className="block text-sm text-slate mb-1">
          Kata sandi
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          placeholder="••••••"
          className="w-full px-3 py-2.5 rounded-sm border border-line bg-white font-mono text-sm mb-2 focus:border-amber outline-none"
        />
        {state.error ? (
          <p className="text-bad text-sm mb-3">{state.error}</p>
        ) : (
          <div className="mb-3" />
        )}

        <button
          type="submit"
          className="w-full py-2.5 rounded-sm bg-ink text-white font-medium hover:bg-ink/90 transition-colors mb-3"
        >
          Masuk
        </button>
        <Link href="/" className="block text-center w-full py-2 text-sm text-slate hover:text-ink">
          ← kembali
        </Link>
      </form>
    </div>
  );
}