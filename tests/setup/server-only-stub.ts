// Vitest runs library code outside Next.js's build pipeline, which is what
// normally turns the real `server-only` package into a no-op for server code.
// This stub replaces it in tests (see vitest.config.ts alias) so modules that
// import "server-only" can be exercised directly in integration tests.
export {};
