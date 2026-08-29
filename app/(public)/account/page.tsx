import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, ListChecks, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/auth-form";
import { DeleteAccountButton } from "@/components/auth/delete-account-button";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default async function AccountPage() {
  const user = await getCurrentUser().catch(() => null);

  if (!user) {
    return (
      <div className="container-page max-w-md py-16">
        <div className="mb-6 text-center">
          <User className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Sign in to KnowHow</h1>
          <p className="mt-1 text-sm text-muted-foreground">Save careers and revisit your quiz results anytime.</p>
        </div>
        <AuthForm />
      </div>
    );
  }

  const [savedCount, resultCount] = await Promise.all([
    prisma.savedCareer.count({ where: { userId: user.id } }),
    prisma.quizResult.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">Your account</h1>
      <p className="mt-1 text-muted-foreground">{user.email}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/account/saved">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <Bookmark className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Saved careers</CardTitle>
                <CardDescription>{savedCount} saved</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/account/quiz-results">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <ListChecks className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Quiz history</CardTitle>
                <CardDescription>{resultCount} result{resultCount === 1 ? "" : "s"}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="mt-10 rounded-lg border border-border p-5">
        <h2 className="font-semibold">Data & privacy</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You can permanently delete your saved careers, quiz history, and profile at any time. See our{" "}
          <Link href="/privacy" className="text-primary underline underline-offset-2">
            privacy policy
          </Link>{" "}
          for details on retention.
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
