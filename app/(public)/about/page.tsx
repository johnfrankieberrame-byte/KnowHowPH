import type { Metadata } from "next";
import { CheckCircle2, AlertTriangle, Database, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Methodology & source policy",
  description:
    "How KnowHow scores career matches, labels data provenance, and handles proof-of-concept salary and demand estimates.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="text-3xl font-bold tracking-tight">About KnowHow</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        KnowHow is a proof-of-concept career discovery platform for the Philippines. It's built to help
        senior high school students, college students, fresh graduates, career shifters, and freelancers
        understand what careers involve — transparently, without pretending to know more than it does.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">The career quiz is exploratory, not diagnostic</h2>
        <p className="mt-2 text-muted-foreground">
          Our quiz is a career-exploration tool. It is not a psychological assessment, a personality
          diagnosis, or a hiring test. It should never be used for recruitment or employment screening.
          Results are a starting point for further research and conversation — not a verdict.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Deterministic scoring is authoritative</h2>
        <p className="mt-2 text-muted-foreground">
          Career matches are ranked by a transparent, versioned scoring algorithm that compares your
          answers (normalized into trait scores) against each career's profile. Every result includes a
          breakdown you can inspect. When we use Gemini AI to write a friendlier explanation of your
          results, the AI explains the existing ranking — it never changes it, and it cannot invent
          careers, scores, or facts that weren't already computed.
        </p>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Data provenance labels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">POC seed data</strong> — an illustrative placeholder value created for this proof-of-concept. Not sourced from a verified dataset.</p>
            <p><strong className="text-foreground">Unverified</strong> — sourced but not yet cross-checked by our team.</p>
            <p><strong className="text-foreground">Needs review</strong> — flagged as potentially outdated or inconsistent.</p>
            <p><strong className="text-foreground">Verified</strong> — checked against a cited, dated source.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle className="text-base">POC data limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Most salary, demand, and saturation figures in this MVP are illustrative placeholders labeled
              <strong className="text-foreground"> POC estimate</strong>, not live labor-market data. They exist so
              the product experience is coherent — treat them as directional, not authoritative.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <RefreshCw className="h-5 w-5 text-primary" /> How future data should be verified
        </h2>
        <ul className="mt-3 space-y-2 text-muted-foreground">
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Every metric and fact can cite a <code>DataSource</code> record with a title, publisher, URL, retrieval date, and methodology note.</li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Admins can set <code>lastReviewedAt</code> / <code>nextReviewDueAt</code> on careers so stale content surfaces in the review queue.</li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Preference is given to government (e.g. PSA, DOLE, TESDA), school, and professional-body sources over aggregated job-platform data.</li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Verification status is only upgraded to "Verified" once a human reviewer has checked the source.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">What's next</h2>
        <p className="mt-2 text-muted-foreground">
          Planned modules include company profiles and ratings, job-posting trend ingestion, verified
          regional salary datasets, and an expert counselor review workflow. The data model is designed so
          these can be added without reshaping the core career, quiz, or provenance structures.
        </p>
      </section>
    </div>
  );
}
