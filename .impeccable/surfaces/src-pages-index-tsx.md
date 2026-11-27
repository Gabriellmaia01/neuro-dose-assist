---
version: 1
slug: "src-pages-index-tsx"
primary_target: "src/pages/Index.tsx"
related_targets: ["src/components/layout/MainLayout.tsx","src/components/layout/Sidebar.tsx","src/components/layout/Header.tsx"]
---

# Surface Brief: NeuroDose Clinical Bento Shell & Dashboard

- **Scope:** `src/pages/Index.tsx`, `src/components/layout/MainLayout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx`, `src/components/painel/*`, `src/components/dashboard/*`, and global tokens in `src/index.css`.
- **Visitor Mode:** Operate (authenticated clinical workspace; speed, clarity, scannability, and consistent controls outrank ornament).
- **Audience & Job:** Neurologists, psychiatrists, and clinic staff reviewing active patients, 7-day dosing telemetry, pharmacological alerts, and upcoming appointments before and between consultations.
- **Constraints:** Preserve every existing test contract (`PainelDeControle.test.tsx`, `HardenLayout.test.tsx`), route link (`/dose`, `/history`, `/reports`, `/patients`, `/appointments`, `/analytics`), WCAG AA contrast, and responsive drawer accessibility.

## Direction contract

THESIS: A bright, airy clinical bento workspace inspired by the user's reference dashboard — replacing the heavy dark navy sidebar and flat stacked cards with a luminous light rail, crisp rounded-2xl bento modules, pill CTAs, and one deep navy-teal hero metric anchor — while refusing generic green SaaS templates by committing wholly to NeuroDose's `#1B4965` / `#2C7A7B` maritime-clinical palette.

OWN-WORLD: Soft cool-alabaster canvas (`#F4F6F8`), light frosted-stone sidebar (`#F8FAFC`) with crisp 1px borders (`#E4EAEF`), pure white `20px`-radius bento cards with subtle elevation, pill-shaped buttons (`rounded-full`) led by solid `#1B4965` primary and outlined white secondary actions, circular `ArrowUpRight` card triggers, hatched-pattern + solid pill telemetry bars, a semi-circular clinical efficacy gauge, and a deep `#0F2A3E` → `#1B4965` botanical-wave dark accent card reserved for the hero KPI and live last-dose focus.

STORY: On arrival, the clinician reads their daily caseload and 7-day pharmacological performance at a glance, sees any urgent interaction alerts or next consultation immediately, and jumps in one click to register a dose (`+ Registrar Dose`), open history, or export a report.

FIRST VIEWPORT: Light left sidebar (`240px`) with `MENU` / `SISTEMA` sections and pill-bar active indicator; clean top bar with quick search (`⌘K`), connectivity status, notifications popover, and profile pill; below it, the page header (`Centro de Telemetria e Decisão Farmacológica`) flanked by pill CTAs (`+ Registrar Dose` solid navy + `Exportar Relatório` outlined + quick links), followed immediately by the 4-column bento KPI row (card 1 drenched in `#0F2A3E`–`#1B4965`–`#2C7A7B` gradient with circular white arrow button, cards 2–4 crisp white with tabular numerals and trend pills) and the 3-column bento analytics row (7-day dosing/efficacy pill-bar & curve card, next-appointment reminder card with pill CTA, and pharmacological alerts/actions card).

FORM: seed: none (pinned) — "utilize essa Ui da imagem como referecia de como quero que o meu dashboard seja e que sirva de inspiração pras outras paginas" + "Adotar o layout bento, sidebar clara e botões pílula da imagem, mas mantendo a paleta azul-marinho/teal do NeuroDose (#1B4965 / #2C7A7B)" + "Redesign completo do Shell (Sidebar + Header) + Dashboard (/) + tokens globais".

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
