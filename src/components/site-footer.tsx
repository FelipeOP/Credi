import Link from "next/link";

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
      <span className="footer-note">Hecho para Colombia · COP</span>
    </footer>
  );
}
