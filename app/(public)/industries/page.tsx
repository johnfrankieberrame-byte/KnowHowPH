import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getPublishedIndustries } from "@/lib/db/queries/industries";

export const metadata: Metadata = {
  title: "Industries",
  description: "Browse Philippine career paths grouped by industry — Technology, Healthcare, Business, Creative, Engineering, and more.",
  alternates: { canonical: "/industries" },
};

export default async function IndustriesPage() {
  const industries = await getPublishedIndustries();

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold tracking-tight">Industries</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Careers are organized in a three-level hierarchy: industry, category, then career. Start broad, then
        narrow down.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {industries.map((industry) => (
          <Card key={industry.id}>
            <CardHeader>
              <CardTitle>
                <Link href={`/industries/${industry.slug}`} className="hover:text-primary">
                  {industry.name}
                </Link>
              </CardTitle>
              <CardDescription>{industry.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {industry.categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-muted"
                    >
                      <span>{cat.name}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {cat._count.primaryCareers} <ChevronRight className="h-3 w-3" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/industries/${industry.slug}`}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View all {industry._count.primaryCareers} careers <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
