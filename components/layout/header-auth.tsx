"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/auth/supabase-browser";

export function HeaderAuth({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      {isAdmin && (
        <Button asChild size="sm" variant="ghost" title="Admin">
          <Link href="/admin">
            <ShieldCheck /> <span className="hidden lg:inline">Admin</span>
          </Link>
        </Button>
      )}
      <Button asChild size="sm" variant="ghost">
        <Link href="/account">
          <User /> <span className="hidden lg:inline">{email.split("@")[0]}</span>
        </Link>
      </Button>
      <Button size="sm" variant="ghost" onClick={handleSignOut} title="Sign out">
        <LogOut />
      </Button>
    </div>
  );
}
