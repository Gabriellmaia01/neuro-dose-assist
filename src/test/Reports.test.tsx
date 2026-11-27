import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Reports from "@/pages/Reports";
import {
  buildReportCSVString,
  buildReportRecommendations,
  escapeCsvCell,
} from "@/lib/reportExports";

const mockUseReports = vi.fn();
const mockGenerateReportPDF = vi.fn();
const mockGenerateReportCSV = vi.fn();
const mockRecarregar = vi.fn();

vi.mock("@/components/layout/MainLayout", () => ({
  MainLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/dashboard/EfficacyChart", () => ({
  EfficacyChart: () => <div data-testid="efficacy-chart-mock" />,
}));

vi.mock("@/hooks/useReports", () => ({
  useReports: () => mockUseReports(),
}));

vi.mock("@/lib/reportExports", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/reportExports")>();
  return {
    ...actual,
    generateReportPDF: (...args: unknown[]) => mockGenerateReportPDF(...args),
    generateReportCSV: (...args: unknown[]) => mockGenerateReportCSV(...args),
  };
});

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

describe("Página de Relatórios e Regras Clínicas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseReports.mockReturnValue({
      startDate: undefined,
      setStartDate: vi.fn(),
      endDate: undefined,
      setEndDate: vi.fn(),
      periodoInvalido: false,
      selectedPatient: "p-1",
      setSelectedPatient: vi.fn(),
      selectedReport: "complete",
      setSelectedReport: vi.fn(),
      includeCharts: true,
      setIncludeCharts: vi.fn(),
      includeRecommendations: true,
      setIncludeRecommendations: vi.fn(),
      isGenerating: false,
      setIsGenerating: vi.fn(),
      doses: [],
      medications: [],
      filteredMedications: [
        {
          id: "m-1",
          name: "Ritalina",
          brandName: "Metilfenidato",
          activeIngredient: "Cloridrato de metilfenidato",
          therapeuticClass: "Estimulante",
          minDose: 5,
          maxDose: 20,
          unit: "mg",
        },
      ],
      patients: [{ id: "p-1", name: "Lucas Silva" }],
      loading: false,
      erro: null,
      recarregar: mockRecarregar,
      filteredDoses: [
        {
          id: "d-1",
          patientId: "p-1",
          medicationId: "m-1",
          doseAmount: "10",
          time: "08:00",
          indication: "TDAH",
          subjectiveState: { mood: 4, energy: 8, sleep: 7, effects: "" },
          analysis: {
            recommendation: "Manter",
            riskAssessment: [],
            efficacyPrediction: 82,
            postDoseInsights: [],
          },
          timestamp: "2026-11-09T11:00:00.000Z",
          createdAt: "2026-11-09T11:00:00.000Z",
        },
      ],
      totalDoses: 1,
      avgEfficacy: 82,
      chartData: [{ date: "09/11", efficacy: 82, dose: 10 }],
      uniqueMedications: 1,
      avgMood: 4,
      avgEnergy: 8,
      lowMoodCount: 0,
      recommendations: buildReportRecommendations({
        totalDoses: 1,
        avgEfficacy: 82,
        avgMood: 4,
        lowMoodCount: 0,
      }),
    });
  });

  it("não dispara falso alerta de humor na escala 1–5 quando o humor médio é bom (4/5)", () => {
    const recsBom = buildReportRecommendations({
      totalDoses: 5,
      avgEfficacy: 80,
      avgMood: 4,
      lowMoodCount: 0,
    });
    expect(recsBom.some((r) => r.id === "low-mood")).toBe(false);

    const recsBaixo = buildReportRecommendations({
      totalDoses: 5,
      avgEfficacy: 80,
      avgMood: 2,
      lowMoodCount: 2,
    });
    expect(recsBaixo.some((r) => r.id === "low-mood")).toBe(true);
  });

  it("gera CSV com BOM UTF-8, escape RFC 4180 e proteção contra CSV Formula Injection", () => {
    expect(escapeCsvCell("=CMD|' /C calc'!A0")).toBe("\"'=CMD|' /C calc'!A0\"");
    expect(escapeCsvCell('Paciente "A"')).toBe('"Paciente ""A"""');

    const csv = buildReportCSVString({
      selectedPatient: "p-1",
      reportTitle: "Relatório Clínico",
      startDate: undefined,
      endDate: undefined,
      patients: [{ id: "p-1", name: "=Lucas Silva" } as never],
      medications: [],
      filteredDoses: [],
      totalDoses: 0,
      avgEfficacy: 0,
      lowMoodCount: 0,
    });

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("\"'=Lucas Silva\"");
  });

  it("exibe escalas clínicas corretas (Humor /5 e Energia /10) e envia recomendações na exportação PDF", () => {
    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    );

    expect(screen.getByText("Humor médio (1–5)")).toBeInTheDocument();
    expect(screen.getByText("4/5")).toBeInTheDocument();
    expect(screen.getByText("8/10")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Exportar PDF/i }));
    expect(mockGenerateReportPDF).toHaveBeenCalledTimes(1);
    const payload = mockGenerateReportPDF.mock.calls[0][0];
    expect(payload.includeRecommendations).toBe(true);
    expect(payload.recommendations).toHaveLength(1);
    expect(payload.medications).toHaveLength(1);
  });

  it("exibe banner acessível de erro e permite tentar novamente quando falha o carregamento", () => {
    mockUseReports.mockReturnValue({
      ...mockUseReports(),
      erro: "Não foi possível carregar os dados clínicos para o relatório. Tente novamente.",
      totalDoses: 0,
      filteredDoses: [],
    });

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar os dados clínicos para o relatório."
    );
    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/i }));
    expect(mockRecarregar).toHaveBeenCalledTimes(1);
  });
});
