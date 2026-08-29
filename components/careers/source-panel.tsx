import { ExternalLink, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { formatDate } from "@/lib/utils/format";

export interface SourceRefData {
  fieldContext: string;
  note: string | null;
  source: {
    title: string;
    publisher: string;
    url: string | null;
    sourceType: string;
    retrievedDate: Date | null;
    methodologySummary: string | null;
    verificationStatus: string;
  };
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  GOVERNMENT: "Government",
  SCHOOL: "School",
  EMPLOYER: "Employer",
  JOB_PLATFORM: "Job platform",
  PROFESSIONAL_BODY: "Professional body",
  RESEARCH: "Research",
  INTERNAL_POC: "Internal POC",
  OTHER: "Other",
};

export function SourcePanel({ references }: { references: SourceRefData[] }) {
  if (references.length === 0) {
    return (
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Info className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Data & sources</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No sources have been attached to this career yet. Treat all figures as unverified.
        </CardContent>
      </Card>
    );
  }

  const seen = new Set<string>();
  const uniqueSources = references.filter((r) => {
    if (seen.has(r.source.title)) return false;
    seen.add(r.source.title);
    return true;
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <Info className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-base">Data & sources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uniqueSources.map((ref) => (
          <div key={ref.source.title} className="rounded-md border border-border p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{ref.source.title}</p>
              <VerificationBadge status={ref.source.verificationStatus} />
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <div>
                <dt className="font-medium text-foreground">Publisher</dt>
                <dd>{ref.source.publisher}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Source type</dt>
                <dd>{SOURCE_TYPE_LABELS[ref.source.sourceType] ?? ref.source.sourceType}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Retrieved</dt>
                <dd>{formatDate(ref.source.retrievedDate)}</dd>
              </div>
              {ref.source.url && (
                <div>
                  <dt className="font-medium text-foreground">Link</dt>
                  <dd>
                    <a
                      href={ref.source.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Visit source <ExternalLink className="h-3 w-3" />
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            {ref.source.methodologySummary && (
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Methodology: </span>
                {ref.source.methodologySummary}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
