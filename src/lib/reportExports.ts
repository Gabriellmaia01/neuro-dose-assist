import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import type { DoseRecord } from "@/lib/doses";
import type { Medication } from "@/lib/medications";
import type { Patient } from "@/lib/patients";
import type { ReportRecommendationItem } from "@/hooks/useReports";

export interface ReportExportData {
    selectedPatient: string;
    reportTitle: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    patients: Patient[];
    medications: Medication[];
    filteredDoses: DoseRecord[];
    totalDoses: number;
    avgEfficacy: number;
    avgMood?: number;
    avgEnergy?: number;
    lowMoodCount: number;
    includeRecommendations?: boolean;
    recommendations?: ReportRecommendationItem[];
}

function getPatientName(data: ReportExportData) {
    return data.selectedPatient !== "all"
        ? data.patients.find((patient) => patient.id === data.selectedPatient)?.name || "Desconhecido"
        : "Todos os Pacientes";
}

function formatPeriodLabel(startDate?: Date, endDate?: Date): string {
    if (startDate && endDate) {
        const [from, to] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
        return `${format(from, "dd/MM/yyyy")} a ${format(to, "dd/MM/yyyy")}`;
    }
    if (startDate) return `A partir de ${format(startDate, "dd/MM/yyyy")}`;
    if (endDate) return `Até ${format(endDate, "dd/MM/yyyy")}`;
    return "Todo o histórico disponível";
}

/**
 * Escapa valores CSV (RFC 4180) e neutraliza CSV Formula Injection (=, +, -, @, tab, CR).
 */
export function escapeCsvCell(value: unknown): string {
    const raw = value === null || value === undefined ? "" : String(value);
    const neutralized = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
    const escaped = neutralized.replace(/"/g, '""');
    return `"${escaped}"`;
}

export function generateReportPDF(data: ReportExportData) {
    const doc = new jsPDF();
    const medicationMap = new Map(
        data.medications
            .filter((med): med is Medication & { id: string } => Boolean(med.id))
            .map((med) => [med.id, med.name])
    );

    doc.setFontSize(18);
    doc.setTextColor(15, 30, 46);
    doc.text("NeuroDose Assist — Relatório Clínico", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(84, 102, 118);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 29);
    doc.text(`Paciente: ${getPatientName(data)}`, 14, 34);
    doc.text(`Período: ${formatPeriodLabel(data.startDate, data.endDate)}`, 14, 39);

    doc.setDrawColor(218, 226, 232);
    doc.line(14, 44, 196, 44);

    doc.setFontSize(12);
    doc.setTextColor(15, 30, 46);
    doc.text("Resumo Executivo", 14, 53);

    doc.setFontSize(10);
    doc.text(`Doses analisadas: ${data.totalDoses}`, 14, 60);
    doc.text(`Eficácia média geral: ${data.avgEfficacy}%`, 14, 65);
    doc.text(
        `Humor médio (1–5): ${typeof data.avgMood === "number" && data.avgMood > 0 ? `${data.avgMood}/5` : "—"} | Energia média (0–10): ${typeof data.avgEnergy === "number" ? `${data.avgEnergy}/10` : "—"}`,
        14,
        70
    );
    doc.text(`Alertas de humor (≤ 2/5): ${data.lowMoodCount}`, 14, 75);

    let cursorY = 82;

    if (data.includeRecommendations && data.recommendations && data.recommendations.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(27, 73, 101);
        doc.text("Notas e Recomendações Clínicas", 14, cursorY);
        cursorY += 6;
        doc.setFontSize(9);
        doc.setTextColor(55, 71, 86);
        data.recommendations.forEach((rec) => {
            const lines = doc.splitTextToSize(`• ${rec.title}: ${rec.description}`, 182);
            doc.text(lines, 14, cursorY);
            cursorY += lines.length * 4.5 + 2;
        });
        cursorY += 3;
    }

    const tableData = data.filteredDoses.map((dose) => {
        const efficacy =
            typeof dose?.analysis?.efficacyPrediction === "number"
                ? dose.analysis.efficacyPrediction
                : (dose?.subjectiveState?.energy || 0) * 10;
        const medicationName = medicationMap.get(dose.medicationId) || "Desconhecido";

        return [
            format(new Date(dose.timestamp), "dd/MM/yyyy HH:mm"),
            medicationName,
            `${dose.doseAmount} mg`,
            `${efficacy}%`,
            typeof dose.subjectiveState?.mood === "number" ? `${dose.subjectiveState.mood}/5` : "—",
            typeof dose.subjectiveState?.energy === "number" ? `${dose.subjectiveState.energy}/10` : "—",
        ];
    });

    autoTable(doc, {
        startY: cursorY,
        head: [["Data/Hora", "Medicamento", "Dose", "Eficácia", "Humor (1–5)", "Energia (0–10)"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [27, 73, 101], textColor: 255 },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [244, 246, 248] },
    });

    const pageCount = (
        doc.internal as typeof doc.internal & { getNumberOfPages: () => number }
    ).getNumberOfPages();
    for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);
        doc.setFontSize(8);
        doc.setTextColor(120, 134, 148);
        doc.text("NeuroDose Assist — Relatório Clínico", 14, doc.internal.pageSize.height - 10);
        doc.text(`Página ${page} de ${pageCount}`, 196, doc.internal.pageSize.height - 10, { align: "right" });
    }

    doc.save(`neurodose_relatorio_${data.selectedPatient !== "all" ? data.selectedPatient : "geral"}_${format(new Date(), "yyyyMMdd")}.pdf`);
}

export function buildReportCSVString(data: ReportExportData): string {
    const patientMap = new Map(
        data.patients
            .filter((patient): patient is Patient & { id: string } => Boolean(patient.id))
            .map((patient) => [patient.id, patient.name])
    );
    const medicationMap = new Map(
        data.medications
            .filter((med): med is Medication & { id: string } => Boolean(med.id))
            .map((med) => [med.id, med.name])
    );

    const rows: string[] = [];
    rows.push(escapeCsvCell("RELATÓRIO CLÍNICO NEURODOSE ASSIST"));
    rows.push([escapeCsvCell("Paciente"), escapeCsvCell(getPatientName(data))].join(","));
    rows.push([escapeCsvCell("Período"), escapeCsvCell(formatPeriodLabel(data.startDate, data.endDate))].join(","));
    rows.push([escapeCsvCell("Gerado em"), escapeCsvCell(new Date().toLocaleString("pt-BR"))].join(","));
    rows.push([escapeCsvCell("Doses analisadas"), escapeCsvCell(data.totalDoses)].join(","));
    rows.push([escapeCsvCell("Eficácia média"), escapeCsvCell(`${data.avgEfficacy}%`)].join(","));
    rows.push([escapeCsvCell("Alertas de humor (<= 2/5)"), escapeCsvCell(data.lowMoodCount)].join(","));
    rows.push("");

    rows.push(escapeCsvCell("MEDICAMENTOS NO RECORTE"));
    rows.push(["Nome", "Nome Comercial", "Princípio Ativo", "Classe", "Dose Mín", "Dose Máx"].map(escapeCsvCell).join(","));
    data.medications.forEach((medication) => {
        rows.push(
            [
                medication.name,
                medication.brandName,
                medication.activeIngredient,
                medication.therapeuticClass,
                medication.minDose,
                medication.maxDose,
            ]
                .map(escapeCsvCell)
                .join(",")
        );
    });
    rows.push("");

    rows.push(escapeCsvCell("HISTÓRICO DE DOSES"));
    rows.push(
        ["Data/Hora", "Paciente", "Medicamento", "Dose", "Indicação", "Energia (0-10)", "Humor (1-5)", "Eficácia Estimada"]
            .map(escapeCsvCell)
            .join(",")
    );
    data.filteredDoses.forEach((dose) => {
        const patientName = patientMap.get(dose.patientId) || "N/A";
        const medicationName = medicationMap.get(dose.medicationId) || "Desconhecido";
        const dateString = new Date(dose.timestamp).toLocaleString("pt-BR");
        const efficacy =
            typeof dose.analysis?.efficacyPrediction === "number"
                ? `${dose.analysis.efficacyPrediction}%`
                : "N/A";

        rows.push(
            [
                dateString,
                patientName,
                medicationName,
                dose.doseAmount,
                dose.indication || "",
                dose.subjectiveState?.energy ?? "",
                dose.subjectiveState?.mood ?? "",
                efficacy,
            ]
                .map(escapeCsvCell)
                .join(",")
        );
    });

    return `\uFEFF${rows.join("\r\n")}`;
}

export function generateReportCSV(data: ReportExportData) {
    const csvContent = buildReportCSVString(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
        "download",
        `relatorio_${data.selectedPatient === "all" ? "geral" : data.selectedPatient}_${format(new Date(), "yyyyMMdd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
