/** Client- and server-safe check — these are NEXT_PUBLIC_ env vars, inlined at build time. */
export function isSupabaseConfiguredPublic(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
