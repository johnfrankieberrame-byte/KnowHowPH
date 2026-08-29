import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function NotAuthorized({ email }: { email?: string }) {
  return (
    <div className="container-page flex min-h-screen max-w-xl flex-col items-center justify-center py-16 text-center">
      <ShieldAlert className="h-10 w-10 text-warning" aria-hidden />
      <Alert variant="warning" className="mt-6 text-left">
        <AlertTitle>You don&apos;t have admin access</AlertTitle>
        <AlertDescription>
          {email ? <>Signed in as <span className="font-medium text-foreground">{email}</span>, but this</> : "This"}{" "}
          account isn&apos;t authorized to view the KnowHow admin CMS. If you believe this is a mistake, ask an
          existing admin to grant your account access.
        </AlertDescription>
      </Alert>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/">Back to KnowHow</Link>
      </Button>
    </div>
  );
}
