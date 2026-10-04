import Link from "next/link";
import { Heart } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="footer-brand">
          credi<span>.</span>
        </Link>
        <p>Entiende tus números. Decide con claridad.</p>
      </div>
      <nav aria-label="Información">
        <Link href="/metodologia/">Metodología</Link>
        <Link href="/privacidad/">Privacidad</Link>
        <a href="#privacy-settings">Preferencias de privacidad</a>
      </nav>
      <span className="footer-note">
        <span>Hecho por Colombianos para el mundo</span>
        <span className="footer-country-icons" aria-hidden="true">
          <svg
            className="footer-flag-definitions"
            width="0"
            height="0"
            focusable="false"
          >
            <defs>
              <linearGradient
                id="footer-colombia-heart"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="3.5"
                x2="0"
                y2="20.5"
              >
                <stop offset="0%" stopColor="#fcd116" />
                <stop offset="50%" stopColor="#fcd116" />
                <stop offset="50%" stopColor="#0054cf" />
                <stop offset="75%" stopColor="#0054cf" />
                <stop offset="75%" stopColor="#ce1126" />
                <stop offset="100%" stopColor="#ce1126" />
              </linearGradient>
            </defs>
          </svg>
          <Heart
            size={18}
            stroke="url(#footer-colombia-heart)"
            strokeWidth={1.8}
            focusable="false"
          />
        </span>
      </span>
    </footer>
  );
}
