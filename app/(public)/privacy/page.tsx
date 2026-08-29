import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How KnowHow collects, uses, and retains your data, including quiz answers and account information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="text-3xl font-bold tracking-tight">Privacy policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Proof-of-concept notice — this policy describes MVP data handling and is not a final legal document.</p>

      <div className="prose-sm mt-8 space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">What we collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Account data: email address (via Supabase Auth) and optional profile details (region, education level, display name).</li>
            <li>Quiz data: your answers, normalized trait scores, and computed results. Quiz answers are treated as personal preference data, not identity or employment records.</li>
            <li>Saved careers and quiz history, if you're signed in.</li>
            <li>Basic, privacy-conscious product analytics (e.g. "career viewed") that never includes raw answers, emails, or free-text content.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">What we don't do</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>We do not use quiz answers for recruitment, employment screening, or automated hiring decisions.</li>
            <li>We do not sell personal data to third parties.</li>
            <li>We do not send your quiz answers, email address, or other identifying details to our analytics provider.</li>
            <li>We do not send your personal identifiers to the Gemini AI service — only an anonymized summary of scores and career facts.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Retention</h2>
          <p className="mt-2">
            Anonymous quiz results are stored behind an opaque, unguessable link and expire automatically after
            180 days. Signed-in users can view and delete their saved careers and quiz history at any time from{" "}
            <code>/account</code>. Deleting your account removes your profile, saved careers, and quiz history.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Your choices</h2>
          <p className="mt-2">
            You can take the quiz anonymously without an account. You can request deletion of your data by
            removing saved items in your account, or by contacting the site operator.
          </p>
        </section>
      </div>
    </div>
  );
}
