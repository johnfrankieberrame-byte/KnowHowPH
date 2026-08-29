import Link from "next/link";
import { ArrowUpRight, MapPin, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/careers/verification-badge";
import { formatSchoolType } from "@/lib/utils/format";

export interface SchoolCardData {
  slug: string;
  name: string;
  type: string;
  region: string;
  provinceCity: string;
  description: string;
  verificationStatus: string;
  programCount: number;
}

export function SchoolCard({ school }: { school: SchoolCardData }) {
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Badge variant="accent">{formatSchoolType(school.type)}</Badge>
          <VerificationBadge status={school.verificationStatus} />
        </div>
        <CardTitle className="mt-1">
          <Link href={`/schools/${school.slug}`} className="hover:text-primary">
            {school.name}
            <ArrowUpRight className="ml-1 inline h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">{school.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col gap-2 pt-0 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {school.provinceCity}, {school.region}
        </span>
        <span className="inline-flex items-center gap-1">
          <GraduationCap className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {school.programCount} {school.programCount === 1 ? "program" : "programs"} listed
        </span>
      </CardContent>
    </Card>
  );
}
