# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Médicos neurologistas, psiquiatras e equipes de clínicas médicas no Brasil (operação individual ou colaborativa com papéis: Proprietário, Administrador e Membro) que acompanham pacientes em tratamento neuropsiquiátrico contínuo.

## Product Purpose

Centralizar o prontuário de pacientes, o catálogo farmacológico, o registro de doses, a agenda clínica, o analytics preditivo e a exportação de relatórios em PDF, apoiando a decisão posológica com rastreabilidade e agilidade no consultório.

## Positioning

Combina gestão de prontuário e posologia neuropsiquiátrica com validação determinística de faixas seguras (`minDose`–`maxDose`), detector automático de interações entre classes terapêuticas e análise pós-dose baseada no estado subjetivo do paciente (humor, energia, sono e efeitos adversos).

## Operating Context

Uso cotidiano em consultório e clínica (desktop e mobile web em português `pt-BR`), com necessidade de leitura rápida entre consultas, registros posológicos frequentes, conferência imediata de alertas farmacológicos e geração de dossiês clínicos em PDF.

## Capabilities and Constraints

- 11 módulos web autenticados via Firebase (`Login`, `Dashboard`, `Pacientes`, `Agenda`, `Medicamentos`, `Registrar Dose`, `Histórico`, `Analytics`, `Relatórios`, `Clínica`, `Configurações`).
- Dados persistidos em Firebase Auth, Realtime Database, Cloud Firestore e Storage; convites de equipe via EmailJS.
- Restrição clínica obrigatória: ferramenta de apoio tecnológico e acadêmico que não substitui o julgamento médico profissional, protocolos clínicos oficiais ou a responsabilidade de prescrição.
- Todos os fluxos de teste automatizado (Vitest) e rotas existentes devem ser preservados sem quebra funcional.

## Brand Commitments

- Nome do produto: **NeuroDose Assist** (marca curta: **Neuro-Dose**).
- Paleta institucional obrigatória: azul-marinho clínico (`#1B4965`) e teal clínico (`#2C7A7B`), combinados a superfícies claras neutras.
- Referência visual confirmada pelo usuário: layout bento moderno com sidebar clara, canvas cinza suave, cards bem arredondados, card KPI principal em gradiente institucional e botões em formato pílula.

## Evidence on Hand

- Aplicação funcional completa em `src/` com 28 arquivos de testes unitários (121 testes).
- Demo publicada em `https://neuro-dose.vercel.app/`.
- Sem depoimentos reais ou métricas comerciais externas confirmadas; não fabricar prova social ou reivindicações clínicas além dos dados reais do usuário autenticado.

## Product Principles

1. **Clareza clínica imediata:** os indicadores essenciais (pacientes ativos, doses, eficácia, alertas e próxima consulta) devem ser escaneáveis no primeiro olhar.
2. **Hierarquia sem ruído:** destacar a ação principal (registrar dose) e o indicador líder sem competir por atenção com adornos desnecessários.
3. **Consistência entre módulos:** tokens globais e shell compartilhado garantem que toda página herde a mesma gramática visual.
4. **Segurança e transparência:** estados vazios, alertas farmacológicos e status de conectividade devem comunicar sempre dados reais.

## Accessibility & Inclusion

- Conformidade alvo WCAG 2.1 AA (contraste >=4.5:1 em texto normal, alvos de toque >=44×44px em mobile, navegação por teclado completa e suporte a `prefers-reduced-motion`).
