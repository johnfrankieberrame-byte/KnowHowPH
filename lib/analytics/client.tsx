"use client";

import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import type { AnalyticsEvent } from "@/lib/analytics/events";

interface AnalyticsClient {
  track: <E extends AnalyticsEvent["name"]>(
    name: E,
    props: Extract<AnalyticsEvent, { name: E }>["props"]
  ) => void;
}

const noopClient: AnalyticsClient = { track: () => {} };
const AnalyticsContext = createContext<AnalyticsClient>(noopClient);

/**
 * Analytics abstraction. Renders as a no-op unless NEXT_PUBLIC_POSTHOG_HOST +
 * a client key are configured, so the app works with zero analytics setup.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const posthogRef = useRef<{ capture: (name: string, props?: Record<string, unknown>) => void } | null>(
    null
  );

  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  useEffect(() => {
    if (!host) return;
    let cancelled = false;
    import("posthog-js")
      .then((mod) => {
        if (cancelled) return;
        const posthog = mod.default;
        posthog.init("browser-key-not-required-for-poc", {
          api_host: host,
          capture_pageview: true,
          autocapture: false,
        });
        posthogRef.current = posthog;
      })
      .catch(() => {
        // PostHog isn't installed or failed to load — analytics stays a no-op.
      });
    return () => {
      cancelled = true;
    };
  }, [host]);

  const client = useMemo<AnalyticsClient>(
    () => ({
      track: (name, props) => {
        if (process.env.NODE_ENV === "development") {
          console.debug("[analytics]", name, props);
        }
        posthogRef.current?.capture(name, props as Record<string, unknown>);
      },
    }),
    []
  );

  return <AnalyticsContext.Provider value={client}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
