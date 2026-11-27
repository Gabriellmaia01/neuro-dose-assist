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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <header className="min-w-0">
                        <h1 className="font-display text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--nd-text)] text-balance">
                            Pacientes
                        </h1>
                        <p className="text-[14px] text-[var(--nd-text-secondary)] mt-1.5">
                            Cadastro, perfil clínico e acompanhamento terapêutico.
                        </p>
                    </header>

                    <div className="flex items-center gap-2">
                        <PatientFormDialog
                            open={patients.isDialogOpen}
                            onOpenChange={patients.setIsDialogOpen}
                            onReset={patients.resetForm}
                            editingPatient={patients.editingPatient}
                            formData={patients.formData}
                            setFormData={patients.setFormData}
                            catalogMedications={patients.catalogMedications}
                            activePatientInteractions={patients.activePatientInteractions}
                            onToggleMedication={patients.toggleActiveMedication}
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
