"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/lib/analytics/client";

export function HomepageCta({
  cta,
  href,
  label,
  icon,
  variant = "default",
}: {
  cta: "explore_careers" | "take_quiz" | "search";
  href: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "secondary";
}) {
  const analytics = useAnalytics();
  return (
    <Button asChild size="lg" variant={variant} onClick={() => analytics.track("homepage_cta_clicked", { cta })}>
      <Link href={href}>
        {label} {icon}
      </Link>
    </Button>
  );
}
