import { Plus } from "@phosphor-icons/react/dist/ssr";
import { calculatorContent } from "@/lib/content";
import type { CalculatorKind } from "@/lib/finance/types";

export function FAQ({ kind }: { kind: CalculatorKind }) {
  return (
    <section className="faq-section" id="questions" aria-labelledby="faq-title">
      <div className="faq-intro">
        <span className="eyebrow">ENTENDER TAMBIÉN CUENTA</span>
        <h2 id="faq-title">
          Resolvamos
          <br />
          <span>tus dudas.</span>
        </h2>
        <p>Un poco de contexto para leer tus resultados con confianza.</p>
        <a href="/metodologia/">
          Explorar la metodología <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="faq-list">
        {calculatorContent[kind].faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <Plus size={18} aria-hidden="true" />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
