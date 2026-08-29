import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Compass, ListChecks, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SearchBox } from "@/components/careers/search-box";
import { CareerCard } from "@/components/careers/career-card";
import { HomepageCta } from "@/components/homepage-cta";
import { getPublishedIndustries } from "@/lib/db/queries/industries";
import { getFeaturedCareers } from "@/lib/db/queries/careers";

export const metadata: Metadata = {
  title: "Find careers that fit you",
  description:
    "Explore Philippine career paths by industry, take a free career-match quiz, and see transparent, clearly-labeled salary and demand estimates.",
  alternates: { canonical: "/" },
};

const STEPS = [
  {
    icon: Compass,
    title: "Explore by industry",
    description:
      "Browse careers across Technology, Healthcare, Business, Creative, Engineering, and more — with plain-language overviews.",
  },
  {
    icon: ListChecks,
    title: "Take the career quiz",
    description:
      "Answer ~35 questions about your personality, skills, and goals. Our scoring engine matches you to careers deterministically and transparently.",
  },
  {
    icon: Sparkles,
    title: "Get a personalized explanation",
    description:
      "See your top matches immediately, then get an AI-generated explanation of why they fit and what to do next — always clearly labeled as informational.",
  },
];

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "KnowHow PH",
  url: appUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${appUrl}/careers?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default async function HomePage() {
  const [industries, featuredCareers] = await Promise.all([
    getPublishedIndustries(),
    getFeaturedCareers(6),
  ]);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
        <div className="container-page grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="mb-3 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              Built for career explorers in the Philippines
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Find career paths that fit how you work, what you value, and where you want to go.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Explore industries, compare careers side by side, and take a free quiz that matches you to
              paths using a transparent, deterministic scoring model — not a black box.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <HomepageCta cta="explore_careers" href="/careers" label="Explore Careers" icon={<ArrowRight />} />
              <HomepageCta
                cta="take_quiz"
                href="/quiz"
                label="Take the Career Quiz"
                variant="secondary"
                icon={<Sparkles />}
              />
            </div>
            <div className="mt-6">
              <SearchBox size="lg" />
            </div>
          </div>
          <div className="hidden md:block" aria-hidden>
            <div className="grid grid-cols-2 gap-4">
              {featuredCareers.slice(0, 4).map((c) => (
                <div key={c.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                  <p className="text-xs font-medium text-muted-foreground">{c.primaryIndustry.name}</p>
                  <p className="mt-1 font-semibold">{c.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Browse by industry</h2>
            <p className="mt-1 text-muted-foreground">Nine industries, dozens of career paths — start wherever you're curious.</p>
          </div>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/industries">
              View all industries <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {industries.map((industry) => (
            <Link key={industry.id} href={`/industries/${industry.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">{industry.name}</CardTitle>
                  <CardDescription>{industry._count.primaryCareers} career{industry._count.primaryCareers === 1 ? "" : "s"}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-muted/50 py-14">
        <div className="container-page">
          <h2 className="text-2xl font-bold tracking-tight">How KnowHow works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative rounded-lg border border-border bg-card p-6">
                <span className="absolute -top-3 left-6 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <step.icon className="h-6 w-6 text-primary" aria-hidden />
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured careers</h2>
            <p className="mt-1 text-muted-foreground">A cross-section of paths from across our catalog.</p>
          </div>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/careers">
              Explore all careers <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCareers.map((career) => (
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
      </section>

      <section className="container-page pb-14">
        <div className="rounded-xl border border-primary/20 bg-accent/60 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight">Not sure where to start?</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Take our free, 8–12 minute career quiz. It's an exploration tool, not a psychological test — you'll
            get your top matches immediately, explained transparently.
          </p>
          <div className="mt-6">
            <HomepageCta cta="take_quiz" href="/quiz" label="Take the Career Quiz" icon={<Sparkles />} />
          </div>
        </div>
      </section>

      <section className="container-page pb-16">
        <Alert variant="info">
          <Info />
          <AlertTitle>Career insights are estimates, not guarantees</AlertTitle>
          <AlertDescription>
            Salary, demand, and saturation figures shown on KnowHow are informational estimates for a proof-of-concept
            and may vary by city, employer, and experience. Many are clearly labeled{" "}
            <strong>POC seed data</strong> pending verification against real sources. Read our{" "}
            <Link href="/about" className="underline underline-offset-2">
              methodology and source policy
            </Link>{" "}
            for details.
          </AlertDescription>
        </Alert>
      </section>
    </div>
  );
}
