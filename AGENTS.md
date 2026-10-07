# Working on Credi

Read `README.md` first. It is the authoritative product and calculation context. This file defines contribution conventions for any coding agent.

## User-approved choices

- Next.js App Router + React + strict TypeScript, static export for Netlify.
- English source code, filenames, identifiers, comments, tests and documentation. Spanish user-facing copy, `es-CO`, COP. Do not translate identifiers into Spanish.
- Black + copper aesthetic inspired by Slash. Preserve the established palette, restrained serif display/sans UI pairing and decimal-aligned financial data. Avoid unrelated gradients, neon colors, visual clutter and decorative motion.
- The footer heart has a user-approved Colombian flag treatment. Restrict yellow/blue/red accents to that icon; keep the surrounding text and interface in the existing palette.
- Browser-only financial logic and PDF generation, no accounts, optional explicit local save.
- React PDF, AdSense and GA4. Live account setup is a separate deployment dependency; do not fabricate IDs or claim setup has been completed.
- First version: fixed-rate loans and investments. Broader financial products need clearly documented calculation changes.

## Code ownership and boundaries

- `src/lib/finance` owns mathematical behavior and input validation. Keep it pure and independent of React, DOM, storage, network and analytics.
- `src/lib/report.ts` maps calculated snapshots to report content. UI and PDF must share the same calculated values and assumptions.
- Components own presentation and interactions. PDF uses React PDF primitives; never assume DOM components or styles can render into a PDF.
- Static route pages own indexable text, metadata and educational FAQs. Primary calculator navigation uses real URLs, not hidden panels under one URL.
- Methodology formulas use the server-rendered `Formula` component with KaTeX HTML + MathML. Render only author-controlled TeX, keep symbol definitions and numeric examples, and do not move financial calculations into the renderer.
- Session state is shared under the root provider. Never persist automatically merely because the user typed. Existing saved inputs restore on reload; malformed/unavailable storage must fail safely.
- Export must be disabled whenever inputs differ from the calculated snapshot.
- Use package dependencies already installed; inspect `package.json` before adding or importing new ones. Native CSS is sufficient for current motion.

## Financial invariants

1. Convert E.A. by compounding equivalence, never divide by 12. Nominal rates require explicit periodicity and are arrears only.
   Monthly M.V. uses `monthlyRate` directly as a percentage, separate from `annualRate`. N.A.M.V. is nominal annual with 12 periods. Preserve both input values on mode changes and compatibility with older saved annual simulations.
2. Preserve half-up cents rounding and final-payment residue handling. Display formatting is not calculation precision.
3. Every loan closes at zero. Ordinary capital plus extra capital equals starting capital. Payments equal capital plus interest.
4. Annual balances are ending balances, not sums. Annual flow totals reconcile to monthly totals.
5. Compare future schedules using the same rate and starting balance. Paid interest is excluded.
6. Extra-payment timing and inclusive relative-month windows are explicit. Final extras are capped to remaining capital.
7. Payment-reduction mode recalculates after each extra; term-reduction mode retains the ordinary installment.
8. Bank-installment inference uses original loan inputs. Explain that insurance/fees invalidate the interpretation as pure interest.
9. Investment contributions occur at month end. Withdrawn interest is separated from invested balance and does not compound.
10. Never silently expand the scope to taxes, fees, variable rates, inflation or exact daily CDT settlement. Specify the model and verify independent expected cash flows first.
11. Income goals use a positive assumed E.A. rate (default 9%), compound-equivalent monthly income and upward-rounded required capital. Reinvest during accumulation, deposit at month end, stop at goal or horizon. Keep already-reached and unreachable goals explicit. Product labels do not change mathematics; ETF total return is not guaranteed monthly income or dividends.

Use `src/components/icons.ts` for icons. Its English aliases wrap Colombia Icons exports. Keep saved v1 simulations compatible when adding input sets; do not persist while typing. Route-level FAQs must remain reachable from methodology/privacy pages.

## Design, accessibility and privacy

- Keep primary actions identifiable, inputs labeled, keyboard focus visible and table captions/headers intact.
- Preserve reduced-motion support and responsive layouts; only tables may scroll horizontally. Test at 360px and desktop widths.
- Explain terms beside results and in FAQs. Do not present implementation details as product features.
- Never put financial values into URLs, telemetry, logs or network payloads. Telemetry is consent-gated and limited to documented events and calculator type.
- Ads must be labeled, separated from calculations and controls, and reserve layout space. Do not add auto-ads or obscure content.
- The local consent interface is not a certified CMP. Keep this deployment limitation documented until a proper integration is completed.

## Required verification

Run `pnpm test`, `pnpm typecheck` and `pnpm build` for meaningful code changes. Tests must check independently derived cash flows, reference values or invariants rather than merely repeating implementation logic. Test every changed financial branch.

For UI/report changes, inspect desktop/mobile and an actual generated PDF. Confirm calculation, stale-result state, export, table frequency/scenario switching, pagination, FAQ, local save/reload and error handling. Verify no third-party requests occur before consent when integrations are configured.

Document changes to financial assumptions and public environment settings in README. Summarize actual checks and unfinished external dependencies candidly. Do not deploy, activate third-party billing, modify accounts or publish without an explicit user request.

## Suggested next areas

Production domain and Google configuration; certified regional consent; operator/contact details; automated browser accessibility checks; additional one-off abonos and exact daily CDT calculation as separately specified features.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
