import { afterEach, describe, expect, it, vi } from "vitest";
import {
    formatarDataISO,
    gerarDiasCalendario,
    horarioParaMinutos,
    validarDataHoraFutura,
    verificarConflitoHorario,
    verificarSeEhHoje,
    verificarSeEhPassado,
} from "@/lib/appointmentCalendar";

describe("appointment calendar helpers", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("formats calendar dates and generates the month grid", () => {
        const month = new Date(2026, 10, 1);
        expect(formatarDataISO(month, 9)).toBe("2026-11-09");
        expect(gerarDiasCalendario(month)).toEqual([
            ...Array.from({ length: 30 }, (_, index) => index + 1),
        ]);
    });

    it("identifies today and past days by calendar date", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 10, 9, 12));
        const month = new Date(2026, 10, 1);

        expect(verificarSeEhHoje(month, 9)).toBe(true);
        expect(verificarSeEhPassado(month, 8)).toBe(true);
        expect(verificarSeEhPassado(month, 9)).toBe(false);
    });

    it("converts times and detects only overlapping active appointments", () => {
        expect(horarioParaMinutos("09:30")).toBe(570);
        const appointments = [
            {
                id: "active",
                patientId: "patient-1",
                patientName: "Paciente",
                date: "2026-11-10",
                time: "09:00",
                duration: 30,
                type: "Consulta" as const,
                status: "Agendada" as const,
            },
            {
                id: "cancelled",
                patientId: "patient-2",
                patientName: "Paciente 2",
                date: "2026-11-10",
                time: "10:00",
                duration: 30,
                type: "Consulta" as const,
                status: "Cancelada" as const,
            },
        ];

        expect(verificarConflitoHorario(appointments, "2026-11-10", "09:15", 30)?.id)
            .toBe("active");
        expect(verificarConflitoHorario(appointments, "2026-11-10", "09:30", 30))
            .toBeNull();
        expect(verificarConflitoHorario(appointments, "2026-11-10", "10:00", 30))
            .toBeNull();
    });

    it("ignores the appointment being edited and rejects past appointment times", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 10, 9, 12));
        const appointment = {
            id: "editing",
            patientId: "patient-1",
            patientName: "Paciente",
            date: "2026-11-09",
            time: "13:00",
            duration: 30,
            type: "Consulta" as const,
            status: "Agendada" as const,
        };

        expect(verificarConflitoHorario([appointment], "2026-11-09", "13:00", 30, "editing"))
            .toBeNull();
        expect(validarDataHoraFutura("2026-11-09", "11:59")).toBe(false);
        expect(validarDataHoraFutura("2026-11-09", "13:00")).toBe(true);
    });
});
