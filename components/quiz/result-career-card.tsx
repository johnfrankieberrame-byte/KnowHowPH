import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { SECTION_LABELS, type QuizSectionKeyLiteral } from "@/lib/quiz/traits";

export interface ResultCareerData {
  rank: number;
  adjustedScore: number;
  matchReasons: string[];
  tradeOffs: string[];
  scoreBreakdown: {
    sectionFits: Record<string, number>;
    adjustments: Record<string, number>;
    softPenalties: number;
  };
  career: {
    slug: string;
    title: string;
    shortDescription: string;
    verificationStatus: string;
    primaryIndustry: { name: string };
  };
}

export function ResultCareerCard({ result, featured }: { result: ResultCareerData; featured?: boolean }) {
  return (
    <Card className={featured ? "border-primary/40 shadow-sm" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {featured && <Trophy className="h-4 w-4 text-secondary" aria-hidden />}
            <Badge variant={featured ? "default" : "outline"}>#{result.rank} match</Badge>
            <Badge variant="accent">{result.career.primaryIndustry.name}</Badge>
          </div>
          <VerificationBadge status={result.career.verificationStatus} />
        </div>
        <CardTitle className="mt-1 flex items-center justify-between gap-2">
          <Link href={`/careers/${result.career.slug}`} className="hover:text-primary">
            {result.career.title}
          </Link>
          <span className="text-lg font-bold text-primary">{Math.round(result.adjustedScore)}%</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{result.career.shortDescription}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Why this matched</p>
          <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
            {result.matchReasons.map((r, i) => <li key={i}>• {r}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Worth knowing</p>
          <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
            {result.tradeOffs.map((r, i) => <li key={i}>• {r}</li>)}
          </ul>
        </div>
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground">See score breakdown</summary>
          <div className="mt-2 space-y-1">
            {Object.entries(result.scoreBreakdown.sectionFits).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span>{SECTION_LABELS[key as QuizSectionKeyLiteral] ?? key}</span>
                <span>{Math.round(value)}%</span>
              </div>
            ))}
          </div>
        </details>
        <Link href={`/careers/${result.career.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View full career profile <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
