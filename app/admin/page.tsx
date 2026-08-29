import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Briefcase, Building2, Shapes, GraduationCap, BookMarked, ListTodo, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { getAdminDashboardCounts, getReviewQueueItems } from "@/lib/db/queries/admin";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Dashboard" };

function StatCard({
  label,
  value,
  href,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-bold leading-tight">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const [counts, reviewQueue] = await Promise.all([getAdminDashboardCounts(), getReviewQueueItems()]);
  const topReviewItems = reviewQueue.slice(0, 5);

  const published = counts.careersByPublicationStatus.PUBLISHED ?? 0;
  const draft = counts.careersByPublicationStatus.DRAFT ?? 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Content status across KnowHow PH.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={`${published} published, ${draft} draft careers`} value={counts.totalCareers} href="/admin/careers" icon={Briefcase} />
        <StatCard label="Items in review queue" value={counts.reviewQueueSize} href="/admin/review-queue" icon={ClipboardList} />
        <StatCard label="Industries" value={counts.industryCount} href="/admin/industries" icon={Building2} />
        <StatCard label="Categories" value={counts.categoryCount} href="/admin/categories" icon={Shapes} />
        <StatCard label="Schools" value={counts.schoolCount} href="/admin/schools" icon={GraduationCap} />
        <StatCard label="Programs" value={counts.programCount} href="/admin/programs" icon={BookMarked} />
        <StatCard label="Data sources" value={counts.sourceCount} href="/admin/sources" icon={ListTodo} />
        <StatCard
          label={`${counts.quizResultCount} results from ${counts.quizAttemptCount} attempts`}
          value={counts.quizAttemptCount}
          href="/admin/quiz"
          icon={ListTodo}
        />
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Needs attention</CardTitle>
              <CardDescription>Most overdue items in the review queue.</CardDescription>
            </div>
            <Link href="/admin/review-queue" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {topReviewItems.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Nothing flagged for review right now.</p>
            ) : (
              <ul className="divide-y divide-border">
                {topReviewItems.map((item) => (
                  <li key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.type} ·{" "}
                        {item.daysOverdue != null && item.daysOverdue > 0
                          ? `${item.daysOverdue} day${item.daysOverdue === 1 ? "" : "s"} overdue`
                          : item.nextReviewDueAt
                            ? `due ${formatDate(item.nextReviewDueAt)}`
                            : "no review date set"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <VerificationBadge status={item.verificationStatus} />
                      {item.type === "career" && (
                        <Link href={`/admin/careers/${item.id}`} className="text-sm font-medium text-primary hover:underline">
                          Review
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
