import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Patient } from "@/lib/patients";
import { Edit, User } from "lucide-react";

export function PatientViewDialog({
    open,
    onOpenChange,
    patient,
    onEdit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: Patient | null;
    onEdit: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-2">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={patient?.photoURL} alt={patient?.name || "Paciente"} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                {patient?.name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="text-xl font-display">{patient?.name}</DialogTitle>
                            <DialogDescription className="text-base text-foreground/80">
                                {patient?.age} anos • {patient?.gender}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {patient && (
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Condição</Label>
                                <p className="font-medium">{patient.condition}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Status</Label>
                                <Badge variant="outline" className="bg-success/5 text-success border-success/20">
                                    Ativo
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Medicamentos Atuais</Label>
                            {patient.currentMedications ? (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {patient.currentMedications.split(",").map((medication, index) => (
                                        <Badge key={index} variant="secondary">{medication.trim()}</Badge>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-muted-foreground">-</p>}
                        </div>

                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Histórico Clínico</Label>
                            <div className="p-3 bg-muted/30 rounded-lg text-sm leading-relaxed">
                                {patient.clinicalHistory || "Sem histórico registrado."}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Alergias / Sensibilidades</Label>
                            <p className="text-sm">{patient.allergies || "Nenhuma registrada."}</p>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11">Fechar</Button>
                    <Button variant="neuro" onClick={onEdit}>
                        <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                        Editar Perfil
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
