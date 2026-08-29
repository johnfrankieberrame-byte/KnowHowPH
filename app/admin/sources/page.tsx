import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { SourceFormDialog } from "@/components/admin/source-form-dialog";
import { getAllSourcesForAdmin } from "@/lib/db/queries/admin";
import { formatSourceType, formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Data sources" };
export const dynamic = "force-dynamic";

function toDateInputValue(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function AdminSourcesPage() {
  const sources = await getAllSourcesForAdmin();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data sources</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sources.length} sources — attach these to career metrics and source references.
          </p>
        </div>
        <SourceFormDialog mode="create" />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Retrieved</th>
              <th className="p-3 font-medium">Used by</th>
              <th className="p-3 font-medium">Verification</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sources.map((source) => (
              <tr key={source.id}>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{source.title}</span>
                    {source.url && (
                      <a href={source.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{source.publisher}</p>
                </td>
                <td className="p-3 text-muted-foreground">{formatSourceType(source.sourceType)}</td>
                <td className="p-3 text-muted-foreground">{formatDate(source.retrievedDate)}</td>
                <td className="p-3 text-muted-foreground">
                  {source._count.careerMetrics + source._count.careerReferences + source._count.schoolPrograms} refs
                </td>
                <td className="p-3">
                  <VerificationBadge status={source.verificationStatus} />
                </td>
                <td className="p-3 text-right">
                  <SourceFormDialog
                    mode="edit"
                    sourceId={source.id}
                    defaults={{
                      title: source.title,
                      publisher: source.publisher,
                      url: source.url ?? "",
                      sourceType: source.sourceType,
                      sourceDate: toDateInputValue(source.sourceDate),
                      retrievedDate: toDateInputValue(source.retrievedDate),
                      methodologySummary: source.methodologySummary ?? "",
                      verificationStatus: source.verificationStatus,
                      notes: source.notes ?? "",
                      archivedUrl: source.archivedUrl ?? "",
                    }}
                  />
                </td>
              </tr>
            ))}
            {sources.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                  No data sources yet. Add one to start citing evidence on careers.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
