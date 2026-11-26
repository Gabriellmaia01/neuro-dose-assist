import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AppointmentCalendar } from "@/components/appointments/AppointmentCalendar";
import { AppointmentDayPanel } from "@/components/appointments/AppointmentDayPanel";
import { ExistingClinicSection } from "@/components/clinic/ClinicTeam";
import { Header } from "@/components/layout/Header";
import { gerarDiasCalendario } from "@/lib/appointmentCalendar";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      displayName: "Dra. Maria Fernanda Albuquerque Vasconcelos",
      email: "maria@clinica.med.br",
      photoURL: null,
    },
    logout: vi.fn(),
  }),
}));

describe("Hardening de acessibilidade e controles interativos", () => {
  it("expõe aria-label nos controles de navegação do calendário e aria-pressed no dia selecionado", () => {
    const month = new Date(2026, 10, 1);
    const onPrev = vi.fn();
    const onNext = vi.fn();

    render(
      <AppointmentCalendar
        dataAtual={month}
        diasCalendario={gerarDiasCalendario(month)}
        dataSelecionada="2026-11-09"
        consultas={[]}
        aoSelecionarDia={vi.fn()}
        aoIrAnterior={onPrev}
        aoIrProximo={onNext}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Mês anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Próximo mês" }));
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "9" })).toHaveAttribute("aria-pressed", "true");
  });

  it("expõe aria-label no menu de ações da consulta no painel diário", () => {
    render(
      <AppointmentDayPanel
        dataSelecionada="2026-11-09"
        consultas={[
          {
            id: "apt-1",
            userId: "u1",
            patientId: "p1",
            patientName: "Carlos Eduardo",
            date: "2026-11-09",
            time: "14:00",
            duration: 30,
            type: "Consulta",
            status: "Agendada",
          },
        ]}
        ehDataPassada={false}
        aoClicarAgendar={vi.fn()}
        aoMudarStatus={vi.fn()}
        aoEditar={vi.fn()}
        aoExcluir={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Ações para consulta de Carlos Eduardo" })
    ).toBeInTheDocument();
  });

  it("Header abre popover real de notificações e reage ao estado offline", () => {
    render(
      <MemoryRouter initialEntries={["/analytics"]}>
        <Header />
      </MemoryRouter>
    );

    const bell = screen.getByRole("button", { name: "Notificações clínicas" });
    fireEvent.click(bell);
    expect(screen.getByText("Alertas no Dashboard")).toBeInTheDocument();

    fireEvent(window, new Event("offline"));
    expect(screen.getByText("Sem conexão")).toBeInTheDocument();

    fireEvent(window, new Event("online"));
    expect(screen.getByText("Conectado")).toBeInTheDocument();
  });

  it("ClinicTeam expõe aria-label descritivo no botão de remover membro", () => {
    const onRemove = vi.fn();
    render(
      <ExistingClinicSection
        clinic={{
          id: "clinic-1",
          name: "Clínica Neuro",
          ownerId: "owner-1",
          createdAt: "2026-01-01",
          members: [
            { uid: "owner-1", email: "dra@clinica.med.br", name: "Dra. Ana", role: "owner", joinedAt: "2026-01-01" },
            { uid: "member-2", email: "joao@clinica.med.br", name: "Dr. João", role: "member", joinedAt: "2026-01-02" },
          ],
        }}
        isOwner
        forms={{
          dialogoCriarAberto: false,
          setDialogoCriarAberto: vi.fn(),
          nomeNovaClinica: "",
          setNomeNovaClinica: vi.fn(),
          dialogoConviteAberto: false,
          setDialogoConviteAberto: vi.fn(),
          emailConvite: "",
          setEmailConvite: vi.fn(),
          funcaoConvite: "member",
          setFuncaoConvite: vi.fn(),
        }}
        onSendInvite={vi.fn()}
        onRemoveMember={onRemove}
      />
    );

    const removeBtn = screen.getByRole("button", { name: "Remover Dr. João da clínica" });
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledWith("member-2");
  });
});
