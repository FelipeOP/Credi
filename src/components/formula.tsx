import katex from "katex";
import type { ReactNode } from "react";

interface FormulaProps {
  title: string;
  expression: string;
  description: string;
  variables: Array<[string, string]>;
  example?: ReactNode;
}

// Render author-controlled TeX at build time; calculations stay in the finance engine.
export function Formula({
  title,
  expression,
  description,
  variables,
  example,
}: FormulaProps) {
  const markup = katex.renderToString(expression, {
    displayMode: true,
    output: "htmlAndMathml",
    throwOnError: true,
    trust: false,
    strict: "error",
  });
  return (
    <figure className="formula-card">
      <figcaption>{title}</figcaption>
      <div
        className="formula-equation"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
      <p className="formula-description">{description}</p>
      <dl className="formula-variables">
        {variables.map(([symbol, meaning]) => (
          <div key={symbol}>
            <dt>{symbol}</dt>
            <dd>{meaning}</dd>
          </div>
        ))}
      </dl>
      {example && (
        <div className="formula-example">
          <strong>Un ejemplo</strong>
          <p>{example}</p>
        </div>
      )}
    </figure>
  );
}
