"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Shapes,
  GraduationCap,
  BookMarked,
  Library,
  ListTodo,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/careers", label: "Careers", icon: Briefcase },
  { href: "/admin/industries", label: "Industries", icon: Building2 },
  { href: "/admin/categories", label: "Categories", icon: Shapes },
  { href: "/admin/schools", label: "Schools", icon: GraduationCap },
  { href: "/admin/programs", label: "Programs", icon: BookMarked },
  { href: "/admin/sources", label: "Sources", icon: Library },
  { href: "/admin/quiz", label: "Quiz", icon: ListTodo },
  { href: "/admin/review-queue", label: "Review queue", icon: ListTodo },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      <div className="mb-2 px-2 py-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">KnowHow Admin</p>
      </div>
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
      <div className="mt-auto border-t border-border pt-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to site
        </Link>
      </div>
    </nav>
  );
}
