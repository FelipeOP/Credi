"use client";

import { useEffect, useRef } from "react";
import { useConsent } from "./privacy-provider";

export function AdSlot() {
  const { advertising } = useConsent();
  const element = useRef<HTMLModElement>(null);
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT;
  const active = advertising && Boolean(publisherId && slotId);
  useEffect(() => {
    if (
      !active ||
      !element.current ||
      element.current.dataset.adsbygoogleStatus
    )
      return;
    try {
      (window.adsbygoogle ??= []).push({});
    } catch {
      /* An unfilled or blocked ad never prevents calculator use. */
    }
  }, [active]);
  return (
    <aside className="ad-slot" aria-label="Publicidad">
      <span className="ad-label">PUBLICIDAD</span>
      {active ? (
        <ins
          ref={element}
          className="adsbygoogle"
          style={{ display: "block", minHeight: 100 }}
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-format="horizontal"
          data-full-width-responsive="false"
        />
      ) : (
        <p>Este espacio ayuda a mantener Credi gratis.</p>
      )}
    </aside>
  );
}
