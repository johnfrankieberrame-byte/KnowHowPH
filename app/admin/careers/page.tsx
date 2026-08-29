import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PublicationStatusBadge } from "@/components/admin/publication-status-badge";
import { PublishButton } from "@/components/admin/publish-button";
import { ReviewStatusSelect } from "@/components/admin/review-status-select";
import { CareersFilterBar } from "@/components/admin/careers-filter-bar";
import { getAllCareersForAdmin, getAllIndustriesForAdmin } from "@/lib/db/queries/admin";
import { formatDate } from "@/lib/utils/format";
import type { PublicationStatus, VerificationStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Careers" };

type SearchParams = { q?: string; publicationStatus?: string; verificationStatus?: string; industryId?: string };

export default async function AdminCareersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  const [careers, industries] = await Promise.all([
    getAllCareersForAdmin({
      q: sp.q || undefined,
      publicationStatus: (sp.publicationStatus as PublicationStatus) || undefined,
      verificationStatus: (sp.verificationStatus as VerificationStatus) || undefined,
      industryId: sp.industryId || undefined,
    }),
    getAllIndustriesForAdmin(),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Careers</h1>
          <p className="mt-1 text-sm text-muted-foreground">{careers.length} career{careers.length === 1 ? "" : "s"}</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/careers/new">
            <Plus className="h-4 w-4" /> New career
          </Link>
        </Button>
      </div>

      <div className="mb-4">
        <CareersFilterBar industries={industries.map((i) => ({ id: i.id, name: i.name }))} />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Industry</th>
              <th className="p-3 font-medium">Publication</th>
              <th className="p-3 font-medium">Verification</th>
              <th className="p-3 font-medium">Last reviewed</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {careers.map((career) => (
              <tr key={career.id} className="align-middle hover:bg-muted/40">
                <td className="p-3">
                  <Link href={`/admin/careers/${career.id}`} className="font-medium hover:text-primary">
                    {career.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{career.primaryCategory.name}</p>
                </td>
                <td className="p-3 text-muted-foreground">{career.primaryIndustry.name}</td>
                <td className="p-3">
                  <PublicationStatusBadge status={career.publicationStatus} />
                </td>
                <td className="p-3">
                  <ReviewStatusSelect careerId={career.id} verificationStatus={career.verificationStatus} />
                </td>
                <td className="p-3 text-xs text-muted-foreground">{formatDate(career.lastReviewedAt)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <PublishButton careerId={career.id} publicationStatus={career.publicationStatus} />
                    <Link href={`/admin/careers/${career.id}`} className="text-xs font-medium text-primary hover:underline">
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {careers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                  No careers match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export const dynamic = "force-dynamic";
