"use client";

import { useEffect, useState } from "react";
import { DownloadSimple, SpinnerGap } from "@/components/icons";
import type { ReportModel } from "@/lib/report";
import { trackEvent } from "./privacy-provider";
import { useConsent } from "./privacy-provider";

export function ExportButton({
  report,
  disabled,
}: {
  report: ReportModel;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [includeMonthly, setIncludeMonthly] = useState(true);
  const [error, setError] = useState("");
  const [download, setDownload] = useState<{ url: string; filename: string }>();
  const { analytics } = useConsent();
  useEffect(() => {
    if (!download) return;
    return () => URL.revokeObjectURL(download.url);
  }, [download]);
  useEffect(() => {
    setDownload(undefined);
  }, [report, includeMonthly]);
  async function exportReport() {
    setBusy(true);
    setError("");
    try {
      const [{ pdf }, { ReportDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./report-document"),
      ]);
      const date = new Intl.DateTimeFormat("es-CO", {
        dateStyle: "long",
        timeZone: "America/Bogota",
      }).format(new Date());
      const blob = await pdf(
        <ReportDocument
          report={report}
          includeMonthly={includeMonthly}
          date={date}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const filename = `credi-${report.kind}-${new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date())}.pdf`;
      setDownload({ url, filename });
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      if (analytics) trackEvent("report_exported", report.kind);
    } catch {
      setError("No pudimos generar el PDF. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="export-control">
      <button
        className="quiet-button"
        onClick={exportReport}
        disabled={busy || disabled}
      >
        {busy ? (
          <SpinnerGap size={17} className="spin" />
        ) : (
          <DownloadSimple size={17} />
        )}{" "}
        {busy ? "Preparando PDF…" : "Exportar PDF"}
      </button>
      <label className="export-option">
        <input
          type="checkbox"
          checked={includeMonthly}
          onChange={(event) => setIncludeMonthly(event.target.checked)}
        />{" "}
        Incluir detalle mensual
      </label>
      {download && !disabled && (
        <a
          className="pdf-download-link"
          href={download.url}
          download={download.filename}
        >
          PDF listo · Descargar de nuevo
        </a>
      )}
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
    </div>
  );
}
