import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  displayMoney,
  moneyCaretPosition,
  normalizeMoneyInput,
  parseMoneyInput,
} from "@/lib/money-input";

interface FieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  prefix?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
}
export function NumberField({
  label,
  value,
  onChange,
  suffix,
  prefix,
  hint,
  min = 0,
  max = 1e12,
  step = 1,
}: FieldProps) {
  const id = useId();
  const isMoney = prefix === "$";
  const inputRef = useRef<HTMLInputElement>(null);
  const [moneyText, setMoneyText] = useState(() => displayMoney(value));
  const emittedValue = useRef(value);
  const caret = useRef<number | null>(null);
  useEffect(() => {
    if (!Object.is(value, emittedValue.current)) {
      setMoneyText(displayMoney(value));
      emittedValue.current = value;
    }
  }, [value]);
  useEffect(() => {
    if (!isMoney || !inputRef.current) return;
    const invalid = Number.isFinite(value) && (value < min || value > max);
    inputRef.current.setCustomValidity(
      invalid
        ? `Ingresa un monto entre ${displayMoney(min)} y ${displayMoney(max)} pesos.`
        : "",
    );
  }, [isMoney, value, min, max]);
  useLayoutEffect(() => {
    if (caret.current === null || !inputRef.current) return;
    inputRef.current.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  }, [moneyText]);
  function updateMoney(raw: string, position: number) {
    const next = normalizeMoneyInput(raw);
    const significant = raw.slice(0, position).replace(/[^\d,-]/g, "").length;
    const nextCaret = moneyCaretPosition(next, significant);
    const nextValue = parseMoneyInput(next);
    emittedValue.current = nextValue;
    caret.current = nextCaret;
    setMoneyText(next);
    onChange(nextValue);
    if (next === moneyText) {
      inputRef.current?.setSelectionRange(nextCaret, nextCaret);
      caret.current = null;
    }
  }
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-shell">
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          ref={inputRef}
          id={id}
          type={isMoney ? "text" : "number"}
          inputMode={isMoney || step < 1 ? "decimal" : "numeric"}
          required
          min={min}
          max={max}
          step={step}
          value={isMoney ? moneyText : Number.isNaN(value) ? "" : value}
          onChange={(event) =>
            isMoney
              ? updateMoney(
                  event.target.value,
                  event.target.selectionStart ?? event.target.value.length,
                )
              : onChange(
                  event.target.value === "" ? NaN : Number(event.target.value),
                )
          }
          onKeyDown={(event) => {
            if (!isMoney || !["Backspace", "Delete"].includes(event.key))
              return;
            const input = event.currentTarget;
            const start = input.selectionStart ?? 0;
            if (start !== input.selectionEnd) return;
            const separator = event.key === "Backspace" ? start - 1 : start;
            if (moneyText[separator] !== ".") return;
            event.preventDefault();
            const digit =
              event.key === "Backspace" ? separator - 1 : separator + 1;
            updateMoney(
              moneyText.slice(0, digit) + moneyText.slice(digit + 1),
              event.key === "Backspace" ? digit : start,
            );
          }}
          onBlur={() => {
            if (isMoney) setMoneyText(displayMoney(value));
          }}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  children,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
      >
        {children}
      </select>
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
