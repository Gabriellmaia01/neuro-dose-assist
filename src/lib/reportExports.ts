import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import type { DoseRecord } from "@/lib/doses";
import type { Medication } from "@/lib/medications";
import type { Patient } from "@/lib/patients";

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
    lowMoodCount: number;
}

function getPatientName(data: ReportExportData) {
    return data.selectedPatient !== "all"
        ? data.patients.find((patient) => patient.id === data.selectedPatient)?.name || "Desconhecido"
        : "Todos os Pacientes";
}

export function generateReportPDF(data: ReportExportData) {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("NeuroDose - Análise de Eficácia", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 28);
    doc.text(`Paciente: ${getPatientName(data)}`, 14, 33);
    doc.text(`Tipo de Relatório: ${data.reportTitle}`, 14, 38);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 45, 196, 45);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Resumo de Eficácia", 14, 55);

    doc.setFontSize(10);
    doc.text(`Total de Doses: ${data.totalDoses}`, 14, 62);
    doc.text(`Eficácia Média Geral: ${data.avgEfficacy}%`, 14, 67);
    doc.text(`Registros com Humor Baixo: ${data.lowMoodCount}`, 14, 72);

    if (data.startDate && data.endDate) {
        doc.text(`Período: ${format(data.startDate, "dd/MM/yyyy")} a ${format(data.endDate, "dd/MM/yyyy")}`, 14, 77);
    }

    const tableData = data.filteredDoses.map((dose) => {
        const efficacy = dose?.analysis?.efficacyPrediction ||
            ((dose?.subjectiveState?.energy || 0) * 10) || 0;
        const medicationName = data.medications.find((medication) => medication.id === dose.medicationId)?.name || "Desconhecido";

        return [
            format(new Date(dose.timestamp), "dd/MM/yyyy HH:mm"),
            medicationName,
            `${dose.doseAmount}mg`,
            `${efficacy}%`,
            dose.subjectiveState?.mood ? dose.subjectiveState.mood.toString() : "-",
            dose.subjectiveState?.energy ? dose.subjectiveState.energy.toString() : "-",
        ];
    });

    autoTable(doc, {
        startY: 85,
        head: [["Data/Hora", "Medicamento", "Dose", "Eficácia", "Humor", "Energia"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [63, 81, 181], textColor: 255 },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 245, 255] },
    });

    const pageCount = (
        doc.internal as typeof doc.internal & { getNumberOfPages: () => number }
    ).getNumberOfPages();
    for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("NeuroDose Assist - Relatório Gerado Automaticamente", 14, doc.internal.pageSize.height - 10);
        doc.text(`Página ${page} de ${pageCount}`, 196, doc.internal.pageSize.height - 10, { align: "right" });
    }

    doc.save(`neurodose_eficacia_${data.selectedPatient !== "all" ? data.selectedPatient : "geral"}_${format(new Date(), "yyyyMMdd")}.pdf`);
}

export function generateReportCSV(data: ReportExportData) {
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "RELATÓRIO DE PACIENTE\n";
    csvContent += `Paciente: ${getPatientName(data)}\n`;
    csvContent += `Gerado em: ${new Date().toLocaleString("pt-BR")}\n`;
    csvContent += `Total de Doses: ${data.totalDoses}\n`;
    csvContent += `Eficácia Média: ${data.avgEfficacy}%\n\n`;

    csvContent += "MEDICAMENTOS CADASTRADOS\n";
    csvContent += "Nome,Nome Comercial,Princípio Ativo,Classe,Dose Mín,Dose Máx\n";
    data.medications.forEach((medication) => {
        csvContent += `"${medication.name}","${medication.brandName}","${medication.activeIngredient}","${medication.therapeuticClass}",${medication.minDose},${medication.maxDose}\n`;
    });
    csvContent += "\n";

    csvContent += "HISTÓRICO DE DOSES\n";
    csvContent += "Data/Hora,Paciente,Medicamento,Dose,Indicação,Energia,Humor,Eficácia Estimada\n";
    data.filteredDoses.forEach((dose) => {
        const patientName = data.patients.find((patient) => patient.id === dose.patientId)?.name || "N/A";
        const medicationName = data.medications.find((medication) => medication.id === dose.medicationId)?.name || "Desconhecido";
        const dateString = new Date(dose.timestamp).toLocaleString("pt-BR");
        const efficacy = dose.analysis?.efficacyPrediction || "N/A";

        csvContent += `"${dateString}","${patientName}","${medicationName}","${dose.doseAmount}","${dose.indication}",${dose.subjectiveState?.energy},${dose.subjectiveState?.mood},${efficacy}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_${data.selectedPatient === "all" ? "geral" : data.selectedPatient}_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
