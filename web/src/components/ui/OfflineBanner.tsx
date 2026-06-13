"use client";

import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof window === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    function onOnline() { setIsOnline(true); }
    function onOffline() { setIsOnline(false); }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 border-b border-danger/30 bg-danger/5 px-6 py-2"
    >
      <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-danger" />
      <p className="font-body text-[11px] tracking-[0.06em] text-danger">
        You&rsquo;re offline — showing cached data
      </p>
    </div>
  );
}
