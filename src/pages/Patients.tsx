import { MainLayout } from "@/components/layout/MainLayout";
import { PatientDirectory } from "@/components/patients/PatientDirectory";
import { PatientFormDialog } from "@/components/patients/PatientFormDialog";
import { PatientViewDialog } from "@/components/patients/PatientViewDialog";
import { usePatients } from "@/hooks/usePatients";
import { User } from "lucide-react";

export default function Patients() {
    const patients = usePatients();

    const handleEditFromView = () => {
        patients.setIsViewDialogOpen(false);
        if (patients.viewingPatient) {
            patients.handleEditClick(patients.viewingPatient);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-8 pb-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center shadow-md">
                            <User className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                                Pacientes
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                                Gerencie cadastro, perfil e histórico clínico
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <PatientFormDialog
                            open={patients.isDialogOpen}
                            onOpenChange={patients.setIsDialogOpen}
                            onReset={patients.resetForm}
                            editingPatient={patients.editingPatient}
                            formData={patients.formData}
                            setFormData={patients.setFormData}
                            photoFile={patients.photoFile}
                            photoPreview={patients.photoPreview}
                            onPhotoChange={patients.handlePhotoChange}
                            saving={patients.saving}
                            onSave={patients.handleSavePatient}
                        />
                    </div>

                    <PatientViewDialog
                        open={patients.isViewDialogOpen}
                        onOpenChange={patients.setIsViewDialogOpen}
                        patient={patients.viewingPatient}
                        onEdit={handleEditFromView}
                    />
                </div>

                <PatientDirectory
                    patients={patients.patients}
                    filteredPatients={patients.filteredPatients}
                    loading={patients.loading}
                    searchTerm={patients.searchTerm}
                    onSearchChange={patients.setSearchTerm}
                    onView={patients.handleViewClick}
                    onEdit={patients.handleEditClick}
                    onDelete={patients.handleDeletePatient}
                />
            </div>
        </MainLayout>
    );
}
