import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { ReviewStatusSelect } from "@/components/admin/review-status-select";
import { getReviewQueueItems } from "@/lib/db/queries/admin";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Review queue" };
export const dynamic = "force-dynamic";

const TYPE_EDIT_HREF: Record<string, (id: string) => string> = {
  career: (id) => `/admin/careers/${id}`,
  school: () => `/admin/schools`,
  program: () => `/admin/programs`,
};

export default async function AdminReviewQueuePage() {
  const items = await getReviewQueueItems();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Review queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"} not yet verified or past their scheduled review date,
          most overdue first.
        </p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-3 font-medium">Item</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Why flagged</th>
              <th className="p-3 font-medium">Verification</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={`${item.type}-${item.id}`}>
                <td className="p-3 font-medium">{item.title}</td>
                <td className="p-3">
                  <Badge variant="outline" className="capitalize">
                    {item.type}
                  </Badge>
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {item.daysOverdue != null && item.daysOverdue > 0
                    ? `${item.daysOverdue} day${item.daysOverdue === 1 ? "" : "s"} overdue (due ${formatDate(item.nextReviewDueAt)})`
                    : item.nextReviewDueAt
                      ? `due ${formatDate(item.nextReviewDueAt)}`
                      : "not yet reviewed"}
                </td>
                <td className="p-3">
                  {item.type === "career" ? (
                    <ReviewStatusSelect careerId={item.id} verificationStatus={item.verificationStatus} />
                  ) : (
                    <VerificationBadge status={item.verificationStatus} />
                  )}
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={TYPE_EDIT_HREF[item.type](item.id)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                  Nothing flagged for review right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
