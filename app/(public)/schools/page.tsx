import type { Metadata } from "next";
import { School as SchoolIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SchoolCard } from "@/components/schools/school-card";
import { SchoolFilters } from "@/components/schools/school-filters";
import { getPublishedSchools, getSchoolRegions } from "@/lib/db/queries/schools";
import { schoolFilterQuerySchema } from "@/lib/validations/schools";

export const metadata: Metadata = {
  title: "Schools & training providers",
  description:
    "Browse Philippine schools, universities, and training providers by region, type, and verification status.",
  alternates: { canonical: "/schools" },
};

interface SchoolsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SchoolsPage({ searchParams }: SchoolsPageProps) {
  const params = await searchParams;
  const parsed = schoolFilterQuerySchema.safeParse({
    region: params.region,
    type: params.type,
    status: params.status,
  });
  // Malformed/tampered query params degrade to the unfiltered catalog rather than a crash.
  const query = parsed.success ? parsed.data : {};

  const [schools, regions] = await Promise.all([getPublishedSchools(query), getSchoolRegions()]);

  return (
    <div className="container-page py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">Schools & training providers</h1>
        <p className="mt-3 text-muted-foreground">
          Explore schools, universities, and training providers across the Philippines, and see the programs
          they offer. Listings are a proof-of-concept catalog — see each school's verification status for
          how much to trust the details.
        </p>
      </div>

      <div className="mt-8">
        <SchoolFilters regions={regions} />
      </div>

      {schools.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
          <SchoolIcon className="h-10 w-10 text-muted-foreground" aria-hidden />
          <div>
            <p className="font-medium">No schools match these filters yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Try clearing a filter, or check back soon — our school catalog is still being built out.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <SchoolCard
              key={school.id}
              school={{
                ...school,
                programCount: school.schoolPrograms.length,
              }}
            />
          ))}
        </div>
      )}

      <div className="mt-12">
        <Alert variant="info">
          <AlertTitle>About this catalog</AlertTitle>
          <AlertDescription>
            School and program records shown here may include clearly-labeled demo / proof-of-concept
            entries. They illustrate the product experience and should not be treated as an up-to-date or
            complete directory of accredited programs — always confirm admissions details directly with the
            school.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
