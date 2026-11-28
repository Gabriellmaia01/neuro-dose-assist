import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { toast } from "@/hooks/use-toast";
import {
    deleteNote,
    getPatientNotes,
    saveNote,
    type PatientNote,
} from "@/lib/notes";
import type { Patient } from "@/lib/patients";
import { Edit, FileText, Loader2, Plus, Trash2 } from "lucide-react";

type NoteCategory = PatientNote["category"];

const NOTE_CATEGORIES: NoteCategory[] = [
    "Evolução",
    "Anamnese",
    "Exame",
    "Prescrição",
    "Outro",
];

const noteDateFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
});

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
    const { user } = useAuth();
    const { effectiveUserId } = useClinic();
    const workspaceId = effectiveUserId || user?.uid;

    const [activeTab, setActiveTab] = useState<"profile" | "notes">("profile");
    const [notes, setNotes] = useState<PatientNote[]>([]);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [savingNote, setSavingNote] = useState(false);
    const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [noteTitle, setNoteTitle] = useState("");
    const [noteCategory, setNoteCategory] = useState<NoteCategory>("Evolução");
    const [noteContent, setNoteContent] = useState("");

    const resetNoteForm = () => {
        setEditingNoteId(null);
        setNoteTitle("");
        setNoteCategory("Evolução");
        setNoteContent("");
        setIsNoteFormOpen(false);
    };

    const loadPatientNotes = async () => {
        if (!workspaceId || !patient?.id) return;
        try {
            setLoadingNotes(true);
            const data = await getPatientNotes(workspaceId, patient.id);
            setNotes(data);
        } catch (error) {
            console.error("Erro ao carregar notas clínicas:", error);
            setNotes([]);
        } finally {
            setLoadingNotes(false);
        }
    };

    useEffect(() => {
        if (open && patient?.id) {
            setActiveTab("profile");
            resetNoteForm();
            loadPatientNotes();
        } else if (!open) {
            setNotes([]);
            resetNoteForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, patient?.id, workspaceId]);

    const handleStartNewNote = () => {
        setEditingNoteId(null);
        setNoteTitle("");
        setNoteCategory("Evolução");
        setNoteContent("");
        setIsNoteFormOpen(true);
    };

    const handleEditNote = (note: PatientNote) => {
        setEditingNoteId(note.id || null);
        setNoteTitle(note.title || "");
        setNoteCategory(note.category || "Evolução");
        setNoteContent(note.content || "");
        setIsNoteFormOpen(true);
    };

    const handleSaveNote = async () => {
        if (!workspaceId || !patient?.id) return;
        if (!noteTitle.trim() || !noteContent.trim()) {
            toast({
                title: "Campos obrigatórios",
                description: "Informe um título e o conteúdo da nota clínica.",
                variant: "destructive",
            });
            return;
        }

        try {
            setSavingNote(true);
            await saveNote(
                {
                    ...(editingNoteId ? { id: editingNoteId } : {}),
                    patientId: patient.id,
                    title: noteTitle.trim(),
                    category: noteCategory,
                    content: noteContent.trim(),
                },
                workspaceId
            );
            toast({
                title: editingNoteId ? "Nota atualizada!" : "Nota registrada!",
                description: "Evolução clínica salva no prontuário do paciente.",
            });
            resetNoteForm();
            await loadPatientNotes();
        } catch (error) {
            console.error("Erro ao salvar nota clínica:", error);
            toast({
                title: "Erro ao salvar nota",
                description: "Não foi possível salvar a nota clínica.",
                variant: "destructive",
            });
        } finally {
            setSavingNote(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!workspaceId) return;
        if (!confirm("Tem certeza que deseja excluir esta nota clínica?")) return;

        try {
            await deleteNote(noteId, workspaceId);
            toast({
                title: "Nota excluída",
                description: "A nota clínica foi removida do prontuário.",
            });
            setNotes((prev) => prev.filter((item) => item.id !== noteId));
        } catch (error) {
            console.error("Erro ao excluir nota clínica:", error);
            toast({
                title: "Erro ao excluir nota",
                description: "Não foi possível remover a nota clínica.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-2">
                        <Avatar className="w-16 h-16">
                            <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                {patient?.name?.charAt(0).toUpperCase()}
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
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) => setActiveTab(value as "profile" | "notes")}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="profile">Perfil Clínico</TabsTrigger>
                            <TabsTrigger value="notes">
                                Evoluções / Notas ({notes.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="grid gap-6 py-4">
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
                        </TabsContent>

                        <TabsContent value="notes" className="space-y-4 py-4">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm text-muted-foreground">
                                    Registro cronológico de evoluções, anamnese e condutas clínicas.
                                </p>
                                {!isNoteFormOpen && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleStartNewNote}
                                        className="shrink-0"
                                    >
                                        <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
                                        Nova Nota
                                    </Button>
                                )}
                            </div>

                            {isNoteFormOpen && (
                                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="sm:col-span-2 space-y-1.5">
                                            <Label htmlFor="note-title">Título *</Label>
                                            <Input
                                                id="note-title"
                                                placeholder="Ex.: Retorno 30 dias — titulação"
                                                value={noteTitle}
                                                onChange={(e) => setNoteTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="note-category">Categoria</Label>
                                            <Select
                                                value={noteCategory}
                                                onValueChange={(value) => setNoteCategory(value as NoteCategory)}
                                            >
                                                <SelectTrigger id="note-category">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {NOTE_CATEGORIES.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="note-content">Evolução / Observações *</Label>
                                        <Textarea
                                            id="note-content"
                                            rows={3}
                                            placeholder="Descreva evolução clínica, resposta terapêutica, efeitos adversos ou plano..."
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={resetNoteForm}
                                            disabled={savingNote}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleSaveNote}
                                            disabled={savingNote}
                                        >
                                            {savingNote ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />
                                                    Salvando…
                                                </>
                                            ) : editingNoteId ? (
                                                "Atualizar Nota"
                                            ) : (
                                                "Salvar Nota"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {loadingNotes ? (
                                <div className="flex items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                    Carregando notas clínicas…
                                </div>
                            ) : notes.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                                    <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" aria-hidden="true" />
                                    <p className="text-sm font-medium">Nenhuma nota clínica registrada</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Clique em &ldquo;Nova Nota&rdquo; para adicionar a primeira evolução do prontuário.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notes.map((note) => (
                                        <article
                                            key={note.id}
                                            className="rounded-xl border border-border bg-card p-4 space-y-2"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="font-medium text-sm">{note.title || "Sem título"}</h4>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {note.category || "Evolução"}
                                                        </Badge>
                                                    </div>
                                                    {note.createdAt && (
                                                        <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                                                            {noteDateFormatter.format(new Date(note.createdAt))}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        aria-label={`Editar nota ${note.title}`}
                                                        onClick={() => handleEditNote(note)}
                                                    >
                                                        <Edit className="w-3.5 h-3.5" aria-hidden="true" />
                                                    </Button>
                                                    {note.id && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            aria-label={`Excluir nota ${note.title}`}
                                                            onClick={() => handleDeleteNote(note.id!)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                                {note.content}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11">Fechar</Button>
                    <Button variant="default" onClick={onEdit}>
                        <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                        Editar Perfil
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
