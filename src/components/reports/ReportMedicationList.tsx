import type { Medication } from "@/lib/medications";

export function ReportMedicationList({ medications }: { medications: Medication[] }) {
    return (
        <section className="pt-6">
            <h3 className="text-[15px] font-semibold text-[var(--nd-text)] mb-3">
                Medicamentos no Recorte
            </h3>
            {medications.length > 0 ? (
                <ul className="divide-y divide-[var(--nd-border)]">
                    {medications.map((medication) => (
                        <li
                            key={medication.id}
                            className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                        >
                            <div className="min-w-0">
                                <p className="text-[14px] font-semibold text-[var(--nd-text)]">
                                    {medication.name}
                                </p>
                                {(medication.brandName || medication.therapeuticClass) && (
                                    <p className="text-[12px] text-[var(--nd-text-secondary)]">
                                        {[medication.brandName, medication.therapeuticClass]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </p>
                                )}
                            </div>
                            <span className="text-[13px] font-medium text-[var(--nd-text)] nd-tabular shrink-0">
                                {medication.minDose}–{medication.maxDose} {medication.unit}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-[13px] text-[var(--nd-text-secondary)] py-4">
                    Nenhum medicamento associado às doses do recorte selecionado.
                </p>
            )}
        </section>
    );
}
