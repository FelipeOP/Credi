"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  defaultInvestment,
  defaultLoan,
  defaultPrepayment,
} from "@/lib/defaults";
import {
  calculateInvestment,
  calculateLoan,
  calculatePrepayment,
} from "@/lib/finance/calculations";
import type {
  InvestmentInput,
  LoanInput,
  PrepaymentInput,
} from "@/lib/finance/types";

export interface SimulationState {
  loan: LoanInput;
  prepayment: PrepaymentInput;
  investment: InvestmentInput;
}
const initialState: SimulationState = {
  loan: defaultLoan,
  prepayment: defaultPrepayment,
  investment: defaultInvestment,
};
const storageKey = "credi.simulations.v1";
const SessionContext = createContext<{
  state: SimulationState;
  setState: React.Dispatch<React.SetStateAction<SimulationState>>;
  save: () => void;
  clear: () => void;
  message: string;
  hasSaved: boolean;
} | null>(null);

function validStoredState(value: unknown): value is SimulationState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as SimulationState;
  try {
    if (
      typeof candidate.investment?.reinvest !== "boolean" ||
      typeof candidate.prepayment?.bankPayment !== "number"
    )
      return false;
    calculateLoan(candidate.loan);
    calculatePrepayment(candidate.prepayment);
    calculateInvestment(candidate.investment);
    return true;
  } catch {
    return false;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const [message, setMessage] = useState("");
  const [hasSaved, setHasSaved] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (validStoredState(parsed)) {
        setState(parsed);
        setHasSaved(true);
        setMessage(
          "Simulaciones recuperadas de este dispositivo. Pulsa Calcular para actualizar el reporte.",
        );
      } else
        setMessage(
          "La simulación guardada no es válida. Puedes reemplazarla con una nueva.",
        );
    } catch {
      setMessage("No pudimos acceder al guardado de este dispositivo.");
    }
  }, []);
  function save() {
    if (!validStoredState(state)) {
      setMessage("Revisa los datos de las simulaciones antes de guardar.");
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      setHasSaved(true);
      setMessage("Simulaciones guardadas solo en este dispositivo.");
    } catch {
      setMessage(
        "El navegador no permite guardar. Puedes continuar y exportar tu reporte.",
      );
    }
  }
  function clear() {
    try {
      localStorage.removeItem(storageKey);
      setHasSaved(false);
      setMessage(
        "Se eliminó la copia guardada. Tus cálculos actuales siguen disponibles.",
      );
    } catch {
      setMessage("No pudimos eliminar el guardado del dispositivo.");
    }
  }
  return (
    <SessionContext.Provider
      value={{ state, setState, save, clear, message, hasSaved }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession requires SessionProvider");
  return value;
}
