# Credi

Free financial calculators for Colombia, built with Next.js App Router, React and TypeScript. Financial calculations, PDF generation and optional simulation storage run in the browser. Source code, identifiers, comments and project documentation are in English; the product UI is Spanish (`es-CO`, COP).

## Run locally

Requires Node.js 24 and pnpm 11 (the version in `packageManager`).

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:3000. Run `pnpm test`, `pnpm typecheck` and `pnpm build` before shipping. The production build is a static export in `out/`; no application server or financial API is required.

## Product decisions

- Black and copper visual identity inspired by the supplied Slash reference. Serif display typography; sans-serif UI and tabular numerals. Restrained CSS motion with reduced-motion support.
- Four independently addressable calculators: `/credito/`, `/abonos/`, `/inversion/`, `/ingresos/`. The home page presents the credit calculator and canonicalizes to `/credito/`.
- Fixed-rate, monthly, level-payment loans; monthly fixed-rate investment projections. No taxes, insurance, fees, variable rates or exact daily CDT settlement in v1.
- Optional local storage, no accounts. Save explicitly persists all four input sets and appears only on calculator routes. Legacy v1 saves migrate by adding the default income inputs. Financial inputs are never included in telemetry. Downloaded PDFs remain under the user's control.
- React PDF for client-side report generation, AdSense for eventual advertising, GA4 for optional analytics.
- COP amount inputs group thousands while typing, preserve up to two entered cents with a comma, and keep numeric values separate from display text. Editing in the middle preserves the caret relative to the digits.
- PDF reports use a white statement-style layout with restrained copper accents, explicit font sizes/leading, a compact executive summary and proportioned numeric columns. The Nu screenshot is a layout reference only; no personal details or Nu branding are reproduced.
- Colombia Icons React (`@mteherandev/colombia-icons-react`, MIT) replaces Phosphor. `src/components/icons.ts` maps upstream Spanish export names to the application's English vocabulary. Generic line icons preserve the restrained visual system; no unrelated decorative icons are added.
- The footer heart is a user-approved Colombian flag accent: hard-stop yellow, blue and red SVG strokes. Keep this treatment confined to the country icon; footer text and the rest of the interface retain the existing palette.

## Architecture

```text
src/app/                    Static routes, metadata, global styles
src/components/             Forms, navigation, tables, charts, consent and PDF presentation
src/lib/finance/types.ts     Domain input and result contracts
src/lib/finance/calculations.ts  Pure decimal financial calculations
src/lib/finance/calculations.test.ts  Independent cash-flow and reference checks
src/lib/report.ts            Report data and explanatory text, independent of rendering
src/lib/defaults.ts          Editable example inputs
src/lib/content.ts           Route copy and FAQ content
src/lib/format.ts            Spanish/COP presentation formatting
```

Keep financial rules out of components. A calculated snapshot supplies the summary, chart, table and PDF together. Editing inputs marks the snapshot stale and disables export until recalculated. Recharts loads separately; React PDF loads only on export. PDF components use their own renderer primitives, not HTML/CSS components.

## Financial rules

Amounts use `decimal.js` at 32 significant digits. Monetary movements round to two decimals with half-up rounding; the final installment absorbs cent-level residue. The UI displays whole pesos for reading; PDFs retain cents.

- Effective annual rate: monthly rate = `(1 + annualRate / 100)^(1/12) - 1`.
- Nominal annual **arrears** rate with `m` compounding periods: monthly rate = `(1 + annualRate / 100 / m)^(m/12) - 1`. Supported periodicities: 1, 2, 4, 12 and 365. Advance rates are out of scope.
- Monthly arrears (`M.V.`): `rateKind: "monthly"` uses the separate `monthlyRate` percentage directly / 100. `annualRate` remains the input for annual options. The monthly field is optional for compatibility with saved annual simulations but required when monthly mode is selected. `24% N.A.M.V.` (nominal annual, 12 periods) equals `2% M.V.`; both imply approximately `26.8242% E.A.`. Never divide a monthly percentage by 12 or silently overwrite the user's annual input. The prepayment `rateSource: "annual"` identifier is retained for compatibility and now means the selected entered rate, which can also be monthly.
- Monthly installment = `principal * rate / (1 - (1 + rate)^(-months))`. At zero rate use `principal / months`.
- Prepayment comparison uses the same starting balance and rate for both future schedules. Already-paid interest is excluded. Contractual month labels retain the paid-month offset; extra-payment start/end months are relative to the next unpaid period, inclusive.
- A beginning-of-period extra is applied before interest. An end-of-period extra is applied after the ordinary installment. Extras never exceed the remaining capital.
- Term mode keeps the ordinary payment. Payment mode recalculates after every extra for the remaining term. The new payment remains in effect after the extra-payment window ends.
- Active balance can be reconstructed from original inputs and installments paid or supplied explicitly. With a supplied balance, the last baseline installment may adjust to meet the remaining term; do not hide this convention.
- Optional implied rate is solved from the **original** principal, term and bank installment using bisection. It assumes the installment contains only principal and interest. Never portray it as proof of the contractual rate.
- Investment interest accrues before the end-of-month contribution. Reinvestment adds interest to the invested balance. Withdrawn interest accumulates separately; total value includes it without further assumed return.
- Annual summaries aggregate flows and use the last closing balance, never sum balances. Years are contract/projection blocks, not calendar years.
- Income goals default to 9% E.A., an editable scenario rather than a market quote. Required capital = desired monthly income / equivalent monthly rate, rounded upward to cents. `src/lib/finance/income.ts` reinvests returns and applies end-month deposits until the goal or the selected 1–600-month horizon. Milestones are the first crossing of 25/50/75/100% of required capital. An already met goal uses month zero; unmet goals report shortfall and estimated closing income. Initial capital may be zero. Income goals require a positive rate (0.01–200% E.A.).
- Product selection changes explanations, not the assumed constant-rate mathematics. CDT payment dates/contribution restrictions, savings-rate variability and ETF total returns versus dividends are explicit. ETF returns and monthly withdrawals are not guaranteed. Accumulation has no withdrawals; modeled post-goal income is gross interest on the closing balance, excluding taxes, fees, inflation and price changes.
- Loan tables use “Capital de la cuota”: the installment minus interest, excluding additional principal payments. UI, FAQs and PDFs share a numeric example. Paired form fields use shared grid rows so wrapped labels do not shift input positions.

The engine validates finite numbers, whole-month terms, ranges and supported options. Limits: 1–600 months, annual rates 0–200%, monthly rates 0–20%, and amounts up to COP 1 trillion. These are simulation limits, not legal rate limits.

## Reference workbook

The supplied `libranza_reporte.xlsx` is a structural and numeric example, not a financial rules specification. It contains an executive summary plus monthly/yearly schedules for normal and extra-payment scenarios.

Its example uses COP 29,300,000 over 24 months, a bank installment of COP 1,565,535 and COP 1,000,000 recurring extra payments. The announced 26.70% E.A. differs from the rate implied by that installment (approximately 28.2225% E.A.). Its extra-payment schedule uses beginning-of-period payments.

The **Load report example** action selects the implied-rate and beginning-of-period options explicitly. Tests reconcile the reference's approximately COP 4,054,112.12 interest savings and 10-month reduction within COP 0.10, allowing cent-level rounding differences. The workbook is not copied into the public repository.

## Deployment to Netlify

1. Connect this directory's repository to Netlify.
2. Use the included `netlify.toml`: build `pnpm build`, publish `out`, Node 24. This is a static export; no Next.js server adapter is needed.
3. Configure `NEXT_PUBLIC_SITE_URL` to the real HTTPS production origin **before building**. With no origin, the site deliberately produces noindex metadata, a disallow-all robots file and an empty sitemap. Never ship production without setting this value.
4. Configure the domain and HTTPS, then verify real canonical URLs and `/sitemap.xml`.
5. Verify the domain in Google Search Console via DNS, or set `GOOGLE_SITE_VERIFICATION` and rebuild. Submit the sitemap and request inspection of the main URLs. Indexing and ranking remain Google's decisions.

`NEXT_PUBLIC_*` values are public, embedded at build time and require a rebuild to change. They are not secrets. `.env.example` lists the supported settings.

## GA4 and AdSense setup

No live Google accounts or publisher IDs are created or assumed. The integrations remain inactive without configuration.

- Set `NEXT_PUBLIC_GA_ID` to the GA4 web measurement ID. Analytics is opt-in. Page views contain the route, without input values or query strings. Allowed events are `simulation_calculated` and `report_exported`, with only calculator type. Google Signals and ad personalization signals are disabled in GA configuration.
- Set `NEXT_PUBLIC_ADSENSE_CLIENT` (`ca-pub-...`) and `NEXT_PUBLIC_ADSENSE_SLOT` after publisher/site approval. A labeled, reserved-height manual ad unit appears below the complete result tables, away from inputs and export controls. No automatic ads, overlays or interstitials are enabled.
- Local consent controls default to denied. They provide a product prototype and basic consent gating, **not a Google-certified CMP**. Before public AdSense launch, implement a certified CMP/TCF integration for EEA/UK/Swiss visitors as required by Google, and review all target-region requirements. Connect its decisions to the integration gates rather than running competing consent systems.
- Publish the actual publisher-provided `ads.txt` at the domain root before activating ads. Do not publish fabricated publisher data.
- Complete the privacy notice with the real operator identity and contact before public launch; the current page documents technical behavior, not a finished legal policy.

Changing consent blocks new application-level requests/events; it does not erase data already held by Google or remove its previously loaded code. Test denial, acceptance and revocation against the real integration.

## Verification and current scope

Financial tests cover the source example, zero-rate loans, independent cash flows, conservation of principal, partial-year aggregation, oversized abonos, inclusive windows, installment recalculation, active-loan offsets and withdrawn/reinvested returns. Verify desktop and mobile, keyboard focus, FAQ expansion, table pagination, save/reload and real PDF downloads after UI changes.

Remaining external launch tasks are domain/repository setup, real account configuration, Search Console verification, AdSense approval and CMP/privacy completion. This repository does not imply those services are live.
