export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";

export default function AdminIndexPage(): never {
  // Langsung dialihkan ke halaman manajemen sesi admin
  redirect("/admin/sessions");
}