import { describe, expect, it } from "vitest";
import {
  displayMoney,
  moneyCaretPosition,
  normalizeMoneyInput,
  parseMoneyInput,
} from "./money-input";

describe("COP input", () => {
  it("formats complete pesos and preserves entered cents", () => {
    expect(displayMoney(29300000)).toBe("29.300.000");
    expect(normalizeMoneyInput("$ 1.234.567,50 COP")).toBe("1.234.567,50");
    expect(parseMoneyInput("1.234.567,50")).toBe(1234567.5);
  });
  it("supports empty input, partial decimals, and negative validation", () => {
    expect(Number.isNaN(parseMoneyInput(""))).toBe(true);
    expect(normalizeMoneyInput("0001200,")).toBe("1.200,");
    expect(normalizeMoneyInput(",5")).toBe("0,5");
    expect(parseMoneyInput(normalizeMoneyInput("-1000"))).toBe(-1000);
  });
  it("keeps the caret relative to digits when grouping changes", () => {
    expect(moneyCaretPosition("12.345.678", 3)).toBe(4);
    expect(moneyCaretPosition("1.234,50", 6)).toBe(7);
  });
});
