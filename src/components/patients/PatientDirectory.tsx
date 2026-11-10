import { EfficacyRing } from "@/components/dashboard/EfficacyRing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
            <div className="glass-card rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Filter className="w-4 h-4 text-primary" aria-hidden="true" />
                    </div>
                    <h2 className="font-display font-semibold text-lg">Busca e Filtros</h2>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-4 border-l-4 border-l-primary">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</p>
                            <p className="text-2xl font-display font-bold mt-1 tabular-nums">{patients.length}</p>
                        </div>
                        <User className="w-8 h-8 text-primary/60" aria-hidden="true" />
                    </div>
                </div>
                <div className="glass-card rounded-xl p-4 border-l-4 border-l-success">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exibindo</p>
                            <p className="text-2xl font-display font-bold mt-1 tabular-nums">{filteredPatients.length}</p>
                        </div>
                        <Search className="w-8 h-8 text-success/60" aria-hidden="true" />
                    </div>
                </div>
                <div className="glass-card rounded-xl p-4 border-l-4 border-l-info">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Perfis</p>
                            <p className="text-2xl font-display font-bold mt-1 tabular-nums">{patients.length}</p>
                        </div>
                        <Eye className="w-8 h-8 text-info/60" aria-hidden="true" />
                    </div>
                </div>
                <div className="glass-card rounded-xl p-4 border-l-4 border-l-warning">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ações</p>
                            <p className="text-2xl font-display font-bold mt-1 tabular-nums">—</p>
                        </div>
                        <Edit className="w-8 h-8 text-warning/60" aria-hidden="true" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="glass-card rounded-2xl p-12 flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
                    <span className="text-muted-foreground font-medium">Carregando pacientes…</span>
                </div>
            ) : (
                <div className="glass-card rounded-2xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Paciente</TableHead>
                                <TableHead>Condição</TableHead>
                                <TableHead>Medicamentos</TableHead>
                                <TableHead>Última Visita</TableHead>
                                <TableHead>Eficácia</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
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
                                        <TableCell onClick={() => onView(patient)}>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={patient.photoURL} alt={patient.name} />
                                                    <AvatarFallback className="bg-neuro-gradient">
                                                        <User className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
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
                                        <TableCell>
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
                                        <TableCell>
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
