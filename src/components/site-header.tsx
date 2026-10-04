"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookmarkSimple, Check, Trash } from "@/components/icons";
import { useSession } from "./session-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const { save, clear, hasSaved, message } = useSession();
  const calculatorPaths = [
    "/",
    "/credito",
    "/abonos",
    "/inversion",
    "/ingresos",
  ];
  const isCalculator = calculatorPaths.includes(
    pathname.replace(/\/$/, "") || "/",
  );
  const questionsPath = isCalculator
    ? `${pathname}#questions`
    : "/credito/#questions";
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="wordmark" aria-label="Credi, inicio">
            <span className="brand-symbol" aria-hidden="true">
              c.
            </span>
            credi<span className="brand-dot">.</span>
          </Link>
          <nav className="utility-nav" aria-label="Navegación general">
            <Link href="/metodologia/">
              Cómo calculamos <ArrowUpRight size={14} />
            </Link>
            <Link href={questionsPath}>Preguntas frecuentes</Link>
          </nav>
          {isCalculator && (
            <div className="header-actions">
              <button className="quiet-button save-button" onClick={save}>
                <BookmarkSimple size={17} /> <span>Guardar simulación</span>
              </button>
              {hasSaved && (
                <button
                  className="icon-button"
                  onClick={clear}
                  aria-label="Eliminar simulaciones guardadas"
                >
                  <Trash size={17} />
                </button>
              )}
            </div>
          )}
        </div>
      </header>
      {isCalculator && message && (
        <div className="storage-message" role="status">
          <Check size={16} />
          {message}
        </div>
      )}
      <div className="tool-navigation">
        <nav aria-label="Calculadoras financieras">
          {[
            { href: "/credito/", label: "Crédito", number: "01" },
            { href: "/abonos/", label: "Abonos a capital", number: "02" },
            { href: "/inversion/", label: "Inversión", number: "03" },
            { href: "/ingresos/", label: "Meta de ingresos", number: "04" },
          ].map(({ href, label, number }) => (
            <Link
              key={href}
              href={href}
              className={
                pathname === href ||
                pathname === href.slice(0, -1) ||
                (pathname === "/" && href === "/credito/")
                  ? "tool-link active"
                  : "tool-link"
              }
              aria-current={
                pathname === href ||
                pathname === href.slice(0, -1) ||
                (pathname === "/" && href === "/credito/")
                  ? "page"
                  : undefined
              }
            >
              <span>{number}</span>
              {label}
            </Link>
          ))}
        </nav>
        <span className="navigation-note">Gratis. Sin registro.</span>
      </div>
    </>
  );
}
