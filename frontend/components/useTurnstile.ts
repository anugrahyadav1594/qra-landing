/** Minimal Cloudflare Turnstile integration (§9.1 / §10.3).
 *
 * Only activates when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. The widget is
 * rendered into a div and the token is handed back via `onToken`, so the
 * form can submit it to the backend for server-side verification. */
"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export function useTurnstile(siteKey: string, onToken: (token: string) => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;
  const [ready, setReady] = useState(!siteKey);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile!.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => onTokenRef.current(token),
      });
      setReady(true);
    };

    if (window.turnstile) {
      renderWidget();
      return () => {
        cancelled = true;
      };
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.onload = renderWidget;
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.remove();
    };
  }, [siteKey]);

  const reset = () => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  return { containerRef, ready, reset };
}
