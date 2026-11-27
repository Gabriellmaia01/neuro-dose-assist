import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import History from "@/pages/History";
import type { ItemHistorico } from "@/lib/tiposHistorico";

const mockUseDadosHistorico = vi.fn();
const mockExportarHistoricoPdf = vi.fn();
const mockRecarregar = vi.fn();

vi.mock("@/components/layout/MainLayout", () => ({
  MainLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/useDadosHistorico", () => ({
  useDadosHistorico: () => mockUseDadosHistorico(),
}));

vi.mock("@/lib/exportarHistoricoPdf", () => ({
  exportarHistoricoPdf: (...args: unknown[]) => mockExportarHistoricoPdf(...args),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

const itensExemplo: ItemHistorico[] = [
  {
    id: "dose-1",
    patientId: "p-1",
    medicationId: "m-1",
    patientName: "Lucas Silva",
    medicationName: "Ritalina",
    doseAmount: "10",
    time: "08:00",
    indication: "TDAH",
    subjectiveState: { mood: 4, energy: 8, sleep: 7, effects: "" },
    analysis: {
      recommendation: "Manter posologia",
      riskAssessment: [],
      efficacyPrediction: 85,
      postDoseInsights: [],
    },
    timestamp: "2026-11-09T11:00:00.000Z",
    createdAt: "2026-11-09T11:00:00.000Z",
    displayType: "dose",
  },
  {
    id: "dose-2",
    patientId: "p-2",
    medicationId: "m-2",
    patientName: "Adriana Lima",
    medicationName: "Escitalopram",
    doseAmount: "5",
    time: "21:00",
    indication: "Ansiedade",
    subjectiveState: { mood: 3, energy: 6, sleep: 5, effects: "Sonolência leve" },
    analysis: {
      recommendation: "Monitorar sono",
      riskAssessment: [],
      efficacyPrediction: 72,
      postDoseInsights: [],
    },
    timestamp: "2026-11-10T00:00:00.000Z",
    createdAt: "2026-11-10T00:00:00.000Z",
    displayType: "dose",
  },
];

describe("Página de Histórico", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDadosHistorico.mockReturnValue({
      itensHistorico: itensExemplo,
      pacientes: [
        { id: "p-1", name: "Lucas Silva" },
        { id: "p-2", name: "Adriana Lima" },
      ],
      logsAtividade: [
        {
          id: "log-1",
          action: "create",
          entityType: "patient",
          entityId: "p-1",
          entityName: "Lucas Silva",
          description: "Cadastrou paciente Lucas Silva",
          userId: "u-1",
          userName: "Dra. Ana",
          timestamp: "2026-11-09T11:00:00.000Z",
        },
        {
          id: "log-2",
          action: "update",
          entityType: "patient",
          entityId: "p-2",
          entityName: "Adriana Lima",
          description: "Atualizou cadastro de Adriana Lima",
          userId: "u-1",
          userName: "Dra. Ana",
          timestamp: "2026-11-10T11:00:00.000Z",
        },
      ],
      carregando: false,
      erro: null,
      recarregar: mockRecarregar,
    });
  });

  it("exibe escala clínica correta (/5 para Humor e /10 para Energia) e exporta apenas os itens filtrados no PDF", () => {
    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>
    );

    expect(screen.getByText("8/10")).toBeInTheDocument();
    expect(screen.getByText("4/5")).toBeInTheDocument();

    const campoBusca = screen.getByLabelText("Busca");
    fireEvent.change(campoBusca, { target: { value: "Lucas" } });

    fireEvent.click(screen.getByRole("button", { name: /Exportar PDF/i }));

    expect(mockExportarHistoricoPdf).toHaveBeenCalledTimes(1);
    const [itensExportados, escopo] = mockExportarHistoricoPdf.mock.calls[0];
    expect(itensExportados).toHaveLength(1);
    expect(itensExportados[0].patientName).toBe("Lucas Silva");
    expect(escopo).toContain("1 registro(s) conforme filtros aplicados");
  });

  it("exibe banner acessível de erro e permite recarregar quando há falha no Firestore", () => {
    mockUseDadosHistorico.mockReturnValue({
      itensHistorico: [],
      pacientes: [],
      logsAtividade: [],
      carregando: false,
      erro: "Não foi possível carregar o histórico clínico. Tente novamente.",
      recarregar: mockRecarregar,
    });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar o histórico clínico."
    );
    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/i }));
    expect(mockRecarregar).toHaveBeenCalledTimes(1);
  });
});
