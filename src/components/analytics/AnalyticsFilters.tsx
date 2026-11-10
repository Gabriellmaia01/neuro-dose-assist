import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Patient } from "@/lib/patients";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnalyticsFilters({
    patients,
    selectedPatient,
    onPatientChange,
    periodInDays,
    onPeriodChange,
    refreshing,
    onReload,
}: {
    patients: Patient[];
    selectedPatient: string;
    onPatientChange: (value: string) => void;
    periodInDays: string;
    onPeriodChange: (value: string) => void;
    refreshing: boolean;
    onReload: () => void;
}) {
    return (
        <div className="flex items-center gap-3">
            <Select value={selectedPatient} onValueChange={onPatientChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Paciente" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos pacientes</SelectItem>
                    {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id || ""}>
                            {patient.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={periodInDays} onValueChange={onPeriodChange}>
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
            </Select>

            <Button
                variant="outline"
                size="icon"
                onClick={onReload}
                disabled={refreshing}
            >
                <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </Button>
        </div>
    );
}
