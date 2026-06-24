"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_MAX_AGE_SECONDS,
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/auth";

export interface LoginActionState {
  error: string | null;
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const password = String(formData.get("password") ?? "");
  const redirectTarget = String(formData.get("redirectTarget") ?? "/admin/sessions");

  if (!verifyAdminPassword(password)) {
    return { error: "Kata sandi salah. Coba lagi." };
  }

  const token = await createAdminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });

  redirect(redirectTarget.startsWith("/admin") ? redirectTarget : "/admin/sessions");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/");
}
