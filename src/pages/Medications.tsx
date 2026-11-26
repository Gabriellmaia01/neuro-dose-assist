import { MainLayout } from "@/components/layout/MainLayout";
import { InteractionAlertPanel } from "@/components/alerts/InteractionAlert";
import { MedicationCard } from "@/components/medications/MedicationCard";
import {
  MedicationDeleteDialog,
  MedicationDetailsDialog,
  MedicationFormDialog,
} from "@/components/medications/MedicationDialogs";
import {
  MedicationFilterPanel,
  MedicationStats,
} from "@/components/medications/MedicationFilters";
import { Button } from "@/components/ui/button";
import { useMedications } from "@/hooks/useMedications";
import { BookOpen, Loader2, Pill, Plus } from "lucide-react";

export default function Medications() {
  const medicationState = useMedications();
  const {
    searchTerm,
    setSearchTerm,
    isDialogOpen,
    setIsDialogOpen,
    medications,
    loading,
    saving,
    importingFormulary,
    missingStandardMedications,
    handleImportStandardFormulary,
    editingId,
    viewingMedication,
    setViewingMedication,
    isDeleteOpen,
    setIsDeleteOpen,
    medicationToDelete,
    isFilterOpen,
    setIsFilterOpen,
    selectedClasses,
    setSelectedClasses,
    formData,
    setFormData,
    interactionAlerts,
    handleDismissAlert,
    toggleClass,
    filteredMedications,
    resetForm,
    handleEdit,
    handleView,
    handleDelete,
    confirmDelete,
    handleSaveMedication,
  } = medicationState;

  const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });
  const totalMedications = medications.length;
  const filteredTotal = filteredMedications.length;
  const uniqueClasses = new Set(medications.map((medication) => medication.therapeuticClass)).size;
  const hasActiveFilters = !!searchTerm || selectedClasses.length > 0;

  return (
    <MainLayout>
      <div className="space-y-8 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--nd-primary)] flex items-center justify-center shadow-md">
              <Pill className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                Medicamentos
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Gerencie catálogo terapêutico, dosagens seguras e classes
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {missingStandardMedications.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleImportStandardFormulary}
                disabled={importingFormulary || loading}
                className="h-11"
              >
                {importingFormulary ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Importando bulário…
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" aria-hidden="true" />
                    Importar Bulário Padrão ({missingStandardMedications.length})
                  </>
                )}
              </Button>
            )}

            <MedicationFormDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              editingId={editingId}
              formData={formData}
              setFormData={setFormData}
              saving={saving}
              onReset={resetForm}
              onSave={handleSaveMedication}
            />
          </div>
        </div>

        <MedicationDetailsDialog
          medication={viewingMedication}
          onClose={() => setViewingMedication(null)}
          onEdit={(medication) => {
            setViewingMedication(null);
            handleEdit(medication);
          }}
        />

        <MedicationDeleteDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          medication={medicationToDelete}
          onConfirm={confirmDelete}
        />

        {interactionAlerts.length > 0 && (
          <InteractionAlertPanel
            alerts={interactionAlerts}
            onDismiss={handleDismissAlert}
            title="Matriz de Interações do Formulário Cadastrado"
          />
        )}

        <MedicationFilterPanel
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isFilterOpen={isFilterOpen}
          onFilterOpenChange={setIsFilterOpen}
          selectedClasses={selectedClasses}
          onToggleClass={toggleClass}
          onClearClasses={() => setSelectedClasses([])}
          hasActiveFilters={hasActiveFilters}
          onClearAll={() => {
            setSearchTerm("");
            setSelectedClasses([]);
          }}
        />

        <MedicationStats
          totalMedications={totalMedications}
          filteredTotal={filteredTotal}
          uniqueClasses={uniqueClasses}
          interactionCount={interactionAlerts.length}
        />

        {loading ? (
          <div className="nd-card p-12 flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
            <span className="text-muted-foreground font-medium">Carregando medicamentos…</span>
          </div>
        ) : filteredMedications.length === 0 ? (
          <div className="nd-card p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Pill className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="font-display font-semibold text-lg">
              {hasActiveFilters ? "Nenhum resultado para os filtros" : "Nenhum medicamento cadastrado"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasActiveFilters
                ? "Tente ajustar a busca ou remover filtros."
                : "Cadastre o primeiro medicamento ou importe o bulário neuropsiquiátrico padrão."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {!hasActiveFilters && missingStandardMedications.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImportStandardFormulary}
                  disabled={importingFormulary}
                  className="h-11"
                >
                  {importingFormulary ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      Importando bulário…
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" aria-hidden="true" />
                      Importar Bulário Padrão ({missingStandardMedications.length})
                    </>
                  )}
                </Button>
              )}
              <Button variant="default" onClick={() => setIsDialogOpen(true)} className="h-11">
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                Cadastrar Medicamento
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                dateFormatter={dateFormatter}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
