import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppointmentCalendar } from "@/components/appointments/AppointmentCalendar";
import { AppointmentDayPanel } from "@/components/appointments/AppointmentDayPanel";
import { gerarDiasCalendario } from "@/lib/appointmentCalendar";

describe("appointment calendar components", () => {
    it("renders the selected month and notifies when a day is selected", () => {
        const month = new Date(2026, 10, 1);
        const onSelectDay = vi.fn();

        render(
            <AppointmentCalendar
                dataAtual={month}
                diasCalendario={gerarDiasCalendario(month)}
                dataSelecionada={null}
                consultas={[]}
                aoSelecionarDia={onSelectDay}
                aoIrAnterior={vi.fn()}
                aoIrProximo={vi.fn()}
            />
        );

        expect(screen.getByText("Novembro 2026")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "9" }));
        expect(onSelectDay).toHaveBeenCalledWith(9);
    });

    it("shows the empty selection and prevents booking in the past", () => {
        const { rerender } = render(
            <AppointmentDayPanel
                dataSelecionada={null}
                consultas={[]}
                ehDataPassada={false}
                aoClicarAgendar={vi.fn()}
                aoMudarStatus={vi.fn()}
                aoEditar={vi.fn()}
                aoExcluir={vi.fn()}
            />
        );
        expect(screen.getByText("Clique em um dia para ver as consultas")).toBeInTheDocument();

        rerender(
            <AppointmentDayPanel
                dataSelecionada="2020-01-01"
                consultas={[]}
                ehDataPassada
                aoClicarAgendar={vi.fn()}
                aoMudarStatus={vi.fn()}
                aoEditar={vi.fn()}
                aoExcluir={vi.fn()}
            />
        );
        expect(screen.getByText("Nenhuma consulta neste dia")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Agendar consulta" })).not.toBeInTheDocument();
    });
});
