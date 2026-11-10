import { Pill } from "lucide-react";
import type { Medication } from "@/lib/medications";

export function ReportMedicationList({ medications }: { medications: Medication[] }) {
    return (
        <div className="mt-8 pt-8 border-t-2 border-border">
            <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Medicamentos Ativos
            </h4>
            <div className="space-y-2">
                {medications.length > 0 ? medications.map((medication) => (
                    <div key={medication.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Pill className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <span className="font-medium text-sm">{medication.name}</span>
                                <p className="text-xs text-muted-foreground">{medication.brandName}</p>
                            </div>
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-lg">
                            {medication.minDose}-{medication.maxDose}{medication.unit}
                        </span>
                    </div>
                )) : (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                        <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-medium">Nenhum medicamento cadastrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
