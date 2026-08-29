import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms governing use of the KnowHow proof-of-concept career discovery platform.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="text-3xl font-bold tracking-tight">Terms of use</h1>
      <p className="mt-2 text-sm text-muted-foreground">Proof-of-concept notice — these terms cover MVP usage and are not a final legal document.</p>

      <div className="prose-sm mt-8 space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Informational purpose only</h2>
          <p className="mt-2">
            KnowHow provides career information, quiz-based matching, and AI-generated explanations for
            informational purposes only. Nothing on this site is a guarantee of employment, income,
            admission, certification, or career success. Salary, demand, and saturation figures are
            estimates and may vary by city, employer, and experience — many are explicitly labeled as
            proof-of-concept (POC) seed data.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Not professional advice</h2>
          <p className="mt-2">
            KnowHow does not provide legal, medical, financial, or immigration advice, and the quiz is not a
            psychological, medical, or hiring assessment.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Acceptable use</h2>
          <p className="mt-2">
            Don't misuse the service: no scraping at scale, no attempts to bypass authentication or rate
            limits, and no use of quiz results for recruitment, screening, or discriminatory decision-making.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Changes</h2>
          <p className="mt-2">As a proof-of-concept, features, content, and these terms may change without notice.</p>
        </section>
      </div>
    </div>
  );
}
