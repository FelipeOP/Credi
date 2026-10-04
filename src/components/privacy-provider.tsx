"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "@phosphor-icons/react";

interface Consent {
  analytics: boolean;
  advertising: boolean;
}
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    adsbygoogle?: unknown[];
  }
}
const ConsentContext = createContext<Consent>({
  analytics: false,
  advertising: false,
});
const consentKey = "credi.consent.v1";
const measurementId = process.env.NEXT_PUBLIC_GA_ID;
const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const configured = Boolean(measurementId || publisherId);

export function trackEvent(
  name: "simulation_calculated" | "report_exported",
  calculator: string,
) {
  if (!window.gtag) return;
  window.gtag("event", name, { calculator_type: calculator });
}

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>({
    analytics: false,
    advertising: false,
  });
  const [draft, setDraft] = useState(consent);
  const [hasDecision, setHasDecision] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(consentKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as Consent;
      if (
        typeof saved.analytics !== "boolean" ||
        typeof saved.advertising !== "boolean"
      )
        return;
      setConsent(saved);
      setDraft(saved);
      setHasDecision(true);
    } catch {
      /* Consent defaults to denied when storage is unavailable. */
    }
  }, []);
  useEffect(() => {
    if (!measurementId || !consent.analytics) {
      window.gtag?.("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      return;
    }
    window.dataLayer ??= [];
    window.gtag ??= (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
    if (!document.getElementById("credi-ga")) {
      window.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      const script = document.createElement("script");
      script.id = "credi-ga";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.append(script);
    }
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("event", "page_view", {
      page_path: pathname,
      page_location: `${window.location.origin}${pathname}`,
    });
  }, [consent.analytics, pathname]);
  useEffect(() => {
    if (
      !consent.advertising ||
      !publisherId ||
      document.getElementById("credi-ads")
    )
      return;
    const script = document.createElement("script");
    script.id = "credi-ads";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
    document.head.append(script);
  }, [consent.advertising]);
  function save(nextConsent: Consent) {
    setConsent(nextConsent);
    setDraft(nextConsent);
    setHasDecision(true);
    try {
      localStorage.setItem(consentKey, JSON.stringify(nextConsent));
      setNotice("Preferencias actualizadas.");
    } catch {
      setNotice(
        "Preferencias aplicadas para esta visita. El navegador no permite guardarlas.",
      );
    }
  }
  return (
    <ConsentContext.Provider value={consent}>
      {children}
      <section className="privacy-settings" id="privacy-settings">
        <details>
          <summary>
            <ShieldCheck size={17} /> Preferencias de privacidad
          </summary>
          <p>
            Los cálculos funcionan sin analítica ni publicidad. Tú eliges qué
            servicios permitir.
          </p>
          <label>
            <input
              type="checkbox"
              checked={draft.analytics}
              onChange={(event) =>
                setDraft({ ...draft, analytics: event.target.checked })
              }
            />{" "}
            Analítica de uso
          </label>
          <label>
            <input
              type="checkbox"
              checked={draft.advertising}
              onChange={(event) =>
                setDraft({ ...draft, advertising: event.target.checked })
              }
            />{" "}
            Publicidad de Google
          </label>
          <div className="privacy-actions">
            <button className="quiet-button" onClick={() => save(draft)}>
              Guardar preferencias
            </button>
            <button
              className="text-button"
              onClick={() => save({ analytics: false, advertising: false })}
            >
              Rechazar opcionales
            </button>
          </div>
          <p role="status">{notice}</p>
        </details>
      </section>
      {configured && !hasDecision && (
        <aside className="consent-banner" aria-label="Privacidad">
          <div>
            <strong>Tu privacidad, tu elección.</strong>
            <p>
              Permite la analítica y los anuncios, o sigue calculando sin ellos.
            </p>
          </div>
          <button
            className="quiet-button"
            onClick={() => save({ analytics: false, advertising: false })}
          >
            Rechazar
          </button>
          <button
            className="primary-button"
            onClick={() => save({ analytics: true, advertising: true })}
          >
            Aceptar
          </button>
          <a href="#privacy-settings">Personalizar</a>
        </aside>
      )}
    </ConsentContext.Provider>
  );
}

export const useConsent = () => useContext(ConsentContext);
