import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { CareerCard } from "@/components/careers/career-card";

export const metadata: Metadata = { title: "Saved careers", robots: { index: false } };

export default async function SavedCareersPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/account");

  const saved = await prisma.savedCareer.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { career: { include: { primaryIndustry: true, primaryCategory: true, metrics: true } } },
  });

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold tracking-tight">Saved careers</h1>
      <p className="mt-1 text-muted-foreground">Careers you've bookmarked for later.</p>

      {saved.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-lg border border-dashed border-border py-16 text-center">
          <Bookmark className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">You haven't saved any careers yet.</p>
          <Link href="/careers" className="mt-2 text-primary underline underline-offset-2">
            Browse careers
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map(({ career }) => (
            <CareerCard
              key={career.id}
              career={{
                ...career,
                salary: (() => {
                  const m = career.metrics.find((x) => x.metricType === "SALARY");
                  return m ? { min: m.salaryMin, max: m.salaryMax } : null;
                })(),
                demand: career.metrics.find((x) => x.metricType === "DEMAND")?.rating ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
