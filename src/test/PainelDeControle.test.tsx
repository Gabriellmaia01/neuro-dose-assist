import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PainelDeControle from "@/pages/Index";
import { useDadosPainel } from "@/hooks/useDadosPainel";

vi.mock("@/hooks/useDadosPainel", () => ({
  useDadosPainel: vi.fn(),
}));

vi.mock("@/components/layout/MainLayout", () => ({
  MainLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/dashboard/EfficacyChart", () => ({
  EfficacyChart: ({
    data,
  }: {
    data: Array<{ date: string; efficacy: number; dose: number }>;
  }) => <div data-testid="efficacy-chart">{JSON.stringify(data)}</div>,
}));

describe("PainelDeControle", () => {
  beforeEach(() => {
    vi.mocked(useDadosPainel).mockReturnValue({
      carregando: false,
      estatisticas: {
        pacientesAtivos: 8,
        pacientesAtivosNovos: 2,
        tendenciaPacientes: 25,
        dosesUltimos7Dias: 12,
        tendenciaDoses: 10,
        eficaciaMedia: 75,
        tendenciaEficacia: 5,
        inferenciasIA: 4,
        tendenciaIA: 0,
      },
      dadosGrafico: [{ data: "09/11", eficacia: 75, dose: 20 }],
      pacientesRecentes: [
        {
          id: "patient-1",
          name: "Paciente Teste",
          age: 40,
          lastDose: "Hoje",
          medication: "Medicamento Teste",
          efficacy: 75,
        },
      ],
      ultimaDose: null,
      alertas: [
        {
          id: "alert-1",
          type: "warning",
          title: "Alerta de teste",
          description: "Descrição do alerta",
          time: "Agora",
        },
      ],
      consultas: [],
    });
  });

  it("exibe os dados principais e atalhos do fluxo do dashboard", () => {
    render(
      <MemoryRouter>
        <PainelDeControle />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /Painel de Controle/ })
    ).toBeInTheDocument();
    expect(screen.getByText("Paciente Teste")).toBeInTheDocument();
    expect(screen.getByText("Alerta de teste")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma consulta agendada")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma dose registrada")).toBeInTheDocument();
    expect(screen.getByTestId("efficacy-chart")).toHaveTextContent(
      '[{"date":"09/11","efficacy":75,"dose":20}]'
    );
    expect(screen.getByRole("link", { name: /Registrar Dose/ })).toHaveAttribute(
      "href",
      "/dose"
    );
    expect(screen.getByRole("link", { name: /Histórico/ })).toHaveAttribute(
      "href",
      "/history"
    );
    expect(screen.getByRole("link", { name: /Relatório/ })).toHaveAttribute(
      "href",
      "/reports"
    );
  });
});
