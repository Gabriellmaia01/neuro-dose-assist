import { EfficacyRing } from "@/components/dashboard/EfficacyRing";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Patient } from "@/lib/patients";
import { Edit, Eye, Filter, Loader2, MoreHorizontal, Search, Trash2, User } from "lucide-react";

const activeStatus = {
    label: "Ativo",
    className: "bg-success/10 text-success border-success/20",
};

export function PatientDirectory({
    patients,
    filteredPatients,
    loading,
    searchTerm,
    onSearchChange,
    onView,
    onEdit,
    onDelete,
}: {
    patients: Patient[];
    filteredPatients: Patient[];
    loading: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onView: (patient: Patient) => void;
    onEdit: (patient: Patient) => void;
    onDelete: (patientId: string) => void;
}) {
    return (
        <>
            <div className="nd-card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-4 h-4 text-[var(--nd-icon)]" strokeWidth={1.5} aria-hidden="true" />
                    <h2 className="text-[15px] font-semibold text-[var(--nd-text)]">Busca e Filtros</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                    <div className="lg:col-span-8 space-y-2">
                        <Label htmlFor="patient-search" className="text-sm font-semibold">Busca</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                            <Input
                                id="patient-search"
                                name="patientSearch"
                                autoComplete="off"
                                placeholder="Buscar por nome do paciente…"
                                value={searchTerm}
                                onChange={(event) => onSearchChange(event.target.value)}
                                className="pl-10 h-11"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-4 flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="h-11"
                            onClick={() => onSearchChange("")}
                            disabled={!searchTerm}
                        >
                            Limpar
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="nd-card p-5">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">Pacientes cadastrados</p>
                        <User className="w-4 h-4 text-[var(--nd-icon)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <p className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--nd-text)] mt-2 nd-tabular">{patients.length}</p>
                </div>
                <div className="nd-card p-5">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-medium text-[var(--nd-text-secondary)]">Exibindo na lista</p>
                        <Search className="w-4 h-4 text-[var(--nd-icon)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <p className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--nd-text)] mt-2 nd-tabular">{filteredPatients.length}</p>
                </div>
            </div>

            {loading ? (
                <div className="nd-card p-12 flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
                    <span className="text-muted-foreground font-medium">Carregando pacientes…</span>
                </div>
            ) : (
                <div className="nd-card p-5 sm:p-6">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-2">Paciente</TableHead>
                                <TableHead>Condição</TableHead>
                                <TableHead>Medicamentos</TableHead>
                                <TableHead>Última Visita</TableHead>
                                <TableHead>Eficácia</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px] pr-2"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPatients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Nenhum paciente encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPatients.map((patient) => (
                                    <TableRow key={patient.id} className="cursor-pointer">
                                        <TableCell className="pl-2" onClick={() => onView(patient)}>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                                        {patient.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{patient.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {patient.age} anos • {patient.gender}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell onClick={() => onView(patient)}>{patient.condition}</TableCell>
                                        <TableCell onClick={() => onView(patient)}>
                                            {patient.currentMedications ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {patient.currentMedications.split(",").map((medication, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {medication.trim()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="nd-tabular">
                                            {patient.createdAt
                                                ? new Date(patient.createdAt).toLocaleDateString("pt-BR")
                                                : "—"}
                                        </TableCell>
                                        <TableCell>
                                            <EfficacyRing value={85} size="sm" showLabel={false} />
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={activeStatus.className}>
                                                {activeStatus.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="pr-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" aria-label={`Ações para ${patient.name}`}>
                                                        <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onView(patient)}>
                                                        <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
                                                        Ver Perfil
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onEdit(patient)}>
                                                        <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => patient.id && onDelete(patient.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </>
    );
}
