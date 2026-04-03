export function trackEvent(name: string, payload: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;

  // Placeholder hook for future analytics provider integration.
  window.dispatchEvent(new CustomEvent("taprush-analytics", { detail: { name, payload } }));
}
