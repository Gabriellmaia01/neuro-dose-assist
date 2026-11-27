---
version: 1
slug: "src-pages-login-tsx"
primary_target: "src/pages/Login.tsx"
related_targets: ["src/components/login/LadoHeroLogin.tsx","src/components/login/SecaoSobrePlataforma.tsx"]
---

# Surface Brief: NeuroDose Assist Login & Product Gateway

- **Scope:** `src/pages/Login.tsx`, `src/components/login/*`, and login/scroll motion classes in `src/index.css`.
- **Visitor Mode:** Persuade (first-impression public gateway combining immediate clinician sign-in with scroll-choreographed editorial storytelling explaining the platform).
- **Audience & Job:** Neurologists, psychiatrists, and clinic leads arriving to sign in immediately OR scrolling down to evaluate what NeuroDose Assist does, how dosing safety/interactions work, and how clinical data is governed before creating a professional account.
- **Constraints:** Preserve every auth flow and test contract (`FormularioLogin.test.tsx`, `DialogoRecuperarSenha.test.tsx`, `useAutenticacaoLoginRecuperacao.test.tsx`), strict adherence to `DESIGN.md` maritime-clinical palette (`#0E293B`, `#1B4965`, `#2C7A7B`, `#F4F6F8`, `#FFFFFF`), zero invented metrics or testimonials, zero kickers above headings, full WCAG AA contrast, and `prefers-reduced-motion` parity.

## Motion Thesis

- **Focal moment:** A sticky 4-stage clinical workflow apparatus below the fold whose interactive stage morphs continuously as the visitor scrolls through the four clinical chapters (Prontuário → Validação Posológica & Interações → Análise Pós-Dose → Telemetria & Dossiê PDF), paired with an authored live pharmacokinetic curve in the dark navy hero panel.
- **Continuity:** A hairline `scaleX` scroll progress rail and a floating translucent top bar glide in past the fold, allowing one-click return to the sign-in form with automatic email input focus; tab switching (`Entrar` / `Novo cadastro`) uses an exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`) sliding indicator.
- **Feedback:** Immediate `150ms` tactile feedback on pill/input focus, chapter step selection, and form submit loading states.
- **Budget:** Zero new runtime dependencies; strictly GPU-composited `transform`, `opacity`, and bounded `clip-path` transitions, with `IntersectionObserver` + `rAF`-throttled scroll progress. All content remains visible by default if scripts fail; `prefers-reduced-motion: reduce` removes spatial displacement and stroke loops while preserving instant state transitions.

## Direction contract

THESIS: An Awwwards-caliber clinical gateway that pairs instant, distraction-free professional authentication above the fold with a scroll-choreographed interactive clinical narrative below — refusing both sterile split-box logins and gimmicky neon SaaS fluff.

OWN-WORLD: Deep Abyssal Navy (`#0E293B`) → Clinical Navy (`#1B4965`) → Clinical Teal (`#2C7A7B`) hero canvas carrying an authored SVG pharmacokinetic concentration curve, juxtaposed against Alabaster (`#F4F6F8`) and pure white `20px`-radius bento surfaces (`#FFFFFF`), crisp pill controls (`9999px`), tabular clinical telemetry (`nd-tabular`), and hairline slate dividers (`#E5ECF1`).

STORY: Returning clinicians sign in immediately at the top without friction; evaluating clinicians scroll down to see the live 4-stage clinical workflow lock into place step by step, inspect the real modules in an asymmetric bento showcase, review the transparent clinical-support disclaimer, and jump straight back to create an account or sign in.

FIRST VIEWPORT: Full-height split gateway (`min-h-[100svh]`): left dark navy panel with `Neuro-Dose` brand bar, anchor `"Explorar a plataforma"`, bold `48px` display `<h1>` ("Precisão posológica na Neurologia Clínica."), live SVG pharmacokinetic safety window diagram, and scroll cue; right alabaster column framing the elevated pure-white `20px` bento authentication card (`Entrar` / `Novo cadastro`, email/password inputs, Google OAuth, CFM/LGPD line). Below the fold starts the sticky 4-stage scroll narrative, bento module overview, and closing CTA.

FORM: seed: none (pinned) — "Utilize a skill de dsigner com as animaçoes e melhore a minha tela de login deixando numa versao premium com base nas metricas de awwards com uma animação que encaixe ao escrolar para baixo onde voce vai colocar mais informaçoes falando sobre oque e esse site" + `DESIGN.md` established maritime-clinical bento world.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
