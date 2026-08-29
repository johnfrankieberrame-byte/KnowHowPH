"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authFormSchema, type AuthFormValues } from "@/lib/validations/auth";
import { isSupabaseConfiguredPublic } from "@/lib/auth/config";

export function AuthForm() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [serverError, setServerError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({ resolver: zodResolver(authFormSchema) });

  if (!isSupabaseConfiguredPublic()) {
    return (
      <Alert variant="warning">
        <AlertDescription>
          Sign-in isn't configured for this deployment yet. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable accounts — the rest of KnowHow (careers, quiz) works
          fully without them.
        </AlertDescription>
      </Alert>
    );
  }

  async function onSubmit(values: AuthFormValues) {
    setServerError(null);
    setInfo(null);
    const { createSupabaseBrowserClient } = await import("@/lib/auth/supabase-browser");
    const supabase = createSupabaseBrowserClient();

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) {
        setServerError(error.message);
        return;
      }
      router.push("/account");
      router.refresh();
    } else {
      const { error, data } = await supabase.auth.signUp(values);
      if (error) {
        setServerError(error.message);
        return;
      }
      if (data.session) {
        router.push("/account");
        router.refresh();
      } else {
        setInfo("Check your email to confirm your account, then sign in.");
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "sign-in" | "sign-up")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign in</TabsTrigger>
          <TabsTrigger value="sign-up">Create account</TabsTrigger>
        </TabsList>
        <TabsContent value={mode}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                {...register("password")}
                aria-invalid={Boolean(errors.password)}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
            {info && (
              <Alert variant="info">
                <AlertDescription>{info}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : mode === "sign-in" ? <LogIn /> : <UserPlus />}
              {mode === "sign-in" ? "Sign in" : "Create account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
