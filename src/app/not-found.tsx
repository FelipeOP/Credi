import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="page-container prose-page">
      <span className="eyebrow">404</span>
      <h1>
        No encontramos <span>esta página.</span>
      </h1>
      <p>Puedes continuar con una de las calculadoras de Credi.</p>
      <Link href="/credito/" className="primary-button">
        Calcular un crédito
      </Link>
    </main>
  );
}
