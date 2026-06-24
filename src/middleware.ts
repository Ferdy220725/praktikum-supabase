import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminSessionToken } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Halaman login harus selalu bisa diakses, termasuk saat sesi sudah ada
  // (agar tombol "keluar" / sesi kedaluwarsa tidak terjebak redirect loop).
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const valid = await isValidAdminSessionToken(token);

  if (!valid) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
