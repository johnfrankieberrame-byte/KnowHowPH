import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { HeaderNav } from "@/components/layout/header-nav";
import { HeaderAuth } from "@/components/layout/header-auth";

const NAV_LINKS = [
  { href: "/careers", label: "Careers" },
  { href: "/industries", label: "Industries" },
  { href: "/schools", label: "Schools" },
  { href: "/quiz", label: "Career Quiz" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const user = await getCurrentUser().catch(() => null);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" aria-hidden />
          </span>
          KnowHow
          <span className="sr-only">PH — Career discovery for the Philippines</span>
        </Link>

        <HeaderNav links={NAV_LINKS} />

        <div className="flex items-center gap-2">
          {user ? (
            <HeaderAuth email={user.email} isAdmin={user.role === "ADMIN"} />
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/account">Sign in</Link>
            </Button>
          )}
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/quiz">Take the Quiz</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
