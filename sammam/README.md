# SAMMAM product website

A standalone, bilingual Arabic/English product website for SAMMAM. The page is
plain HTML, CSS and JavaScript so it can be previewed or hosted without adding a
second application framework to the product.

## Preview

From the repository root, run:

```sh
python3 -m http.server 4174 --bind 127.0.0.1
```

Then open <http://127.0.0.1:4174/website/>. The website uses the approved logo,
bundled IBM Plex Sans Arabic font files from `../public/`, and a bundled Noto
Naskh Arabic display face for large Arabic headlines. Its OFL license is kept
beside the font files in `assets/`. Compact UI and reading text keep the legible
Plex voice; the font is served locally with no remote request.

## Content and behavior

- Arabic is the initial language; the EN / عربي control switches the page
  between Arabic RTL and English LTR.
- The appearance switcher supports Light (`نهاري`), Dark (`ليلي`), and System
  (`تلقائي`) themes while honoring the user's `prefers-color-scheme` and
  `prefers-reduced-motion` preferences.
- The hero Living Record Studio lets visitors step through or auto-play the
  conceptual 4-stage record chain (Issue → Linked RFI → Response → Resolution)
  and inspect it through Field, Management, and Audit/Governance lenses.
- Each of the five workflow tabs includes an interactive blueprint sandbox
  demonstrating SAMMAM's actual operational boundaries (distinct record save vs.
  evidence upload outcomes, `can_act` decision routing, material delivery
  receipts and reasoned reversals, Change Notice currency prerequisites, and
  report-to-source drill-down).
- The Governance section includes an interactive Authority & Scope Matrix
  showing how server authorization and PostgreSQL Forced RLS evaluate Company vs.
  Project scope.
- The construction image and two mascot poses are original generated artwork in
  `assets/`. The identity character is named صمّام; its line is “كل خطوة إلها
  أثر” / “Every step leaves a trace.”
- The record journey in the hero is conceptual and contains no live project
  data. The construction scene is editorial imagery, not a customer project.
- Product descriptions follow the implemented field-to-management scope. They
  do not present SAMMAM as an ERP, accounting system, or external approval
  authority.
