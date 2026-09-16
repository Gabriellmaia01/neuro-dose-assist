import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ItemHistorico } from "./tiposHistorico";

/**
 * Exportação do histórico em PDF.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas geração de PDF
 *  - Inversão de Dependência (D): recebe dados prontos, não busca do Firebase
 */

export function exportarHistoricoPdf(itens: ItemHistorico[]): void {
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(18);
  doc.text("NeuroDose Assist - Histórico", 14, 22);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 30);

  // Preparar dados da tabela
  const dadosTabela = itens.map((item) => {
    const dataStr = format(new Date(item.timestamp), "dd/MM/yyyy HH:mm");
    const humor = item.subjectiveState?.mood ?? "-";
    const energia = item.subjectiveState?.energy ?? "-";
    const sono = item.subjectiveState?.sleep ?? "-";
    const subjetivo = `Humor: ${humor}/5 | Energia: ${energia}/5 | Sono: ${sono}/5`;
    const rec = item.analysis?.recommendation ?? "-";
    const eficacia = item.analysis?.efficacyPrediction ?? "-";
    const analise = `Recomendação: ${rec}\nEficácia prevista: ${eficacia}%`;
    const detalhes =
      item.subjectiveState?.effects || "Sem efeitos colaterais relatados";

    return [
      dataStr,
      item.patientName,
      item.medicationName,
      `${item.doseAmount}mg`,
      `${subjetivo}\n${detalhes}\n\n${analise}`,
    ];
  });

  autoTable(doc, {
    head: [["Data/Hora", "Paciente", "Medicamento", "Dose", "Detalhes e Análise"]],
    body: dadosTabela,
    startY: 35,
    headStyles: { fillColor: [63, 81, 181] },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      4: { cellWidth: 80 },
    },
  });

  // Salvar
  doc.save(`neurodose-historico-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
