import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/admin-shell";
import { NotAuthorized } from "@/components/admin/not-authorized";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser().catch(() => null);

  // Not signed in at all — send to the account/sign-in page rather than
  // rendering a dead end inside /admin.
  if (!user) {
    redirect("/account");
  }

  // Signed in but not an admin — show an inline message instead of
  // redirecting (a redirect back to "/" could loop if the user keeps
  // navigating to /admin, and this makes the reason explicit).
  if (user.role !== "ADMIN") {
    return <NotAuthorized email={user.email} />;
  }

  return <AdminShell>{children}</AdminShell>;
}
