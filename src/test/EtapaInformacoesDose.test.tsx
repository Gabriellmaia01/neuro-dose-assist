import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EtapaInformacoesDose } from "@/components/dose/EtapaInformacoesDose";
import type { Medication } from "@/lib/medications";

const medicamento: Medication = {
  id: "med-1",
  name: "Medicamento Teste",
  brandName: "Marca Teste",
  activeIngredient: "Princípio ativo",
  therapeuticClass: "Classe terapêutica",
  form: "Comprimido",
  minDose: 10,
  maxDose: 50,
  unit: "mg",
};

describe("EtapaInformacoesDose", () => {
  it("sanitiza a dose digitada e mostra aviso quando excede o limite", () => {
    const onQuantidadeDoseChange = vi.fn();

    const { rerender } = render(
      <EtapaInformacoesDose
        pacientes={[]}
        medicamentos={[medicamento]}
        carregandoDados={false}
        pacienteIdSelecionado=""
        onPacienteChange={vi.fn()}
        medicamentoIdSelecionado={medicamento.id!}
        onMedicamentoChange={vi.fn()}
        quantidadeDose=""
        onQuantidadeDoseChange={onQuantidadeDoseChange}
        formaAdministracao=""
        onFormaAdministracaoChange={vi.fn()}
        horarioDose=""
        onHorarioDoseChange={vi.fn()}
        indicacao=""
        onIndicacaoChange={vi.fn()}
        doseAcimaLimite={false}
        doseAbaixoLimite={false}
        medicamentoSelecionado={medicamento}
      />
    );

    fireEvent.change(screen.getByLabelText("Dose (mg)"), {
      target: { value: "12.345" },
    });
    expect(onQuantidadeDoseChange).toHaveBeenCalledWith("12.34");

    rerender(
      <EtapaInformacoesDose
        pacientes={[]}
        medicamentos={[medicamento]}
        carregandoDados={false}
        pacienteIdSelecionado=""
        onPacienteChange={vi.fn()}
        medicamentoIdSelecionado={medicamento.id!}
        onMedicamentoChange={vi.fn()}
        quantidadeDose="60"
        onQuantidadeDoseChange={onQuantidadeDoseChange}
        formaAdministracao=""
        onFormaAdministracaoChange={vi.fn()}
        horarioDose=""
        onHorarioDoseChange={vi.fn()}
        indicacao=""
        onIndicacaoChange={vi.fn()}
        doseAcimaLimite
        doseAbaixoLimite={false}
        medicamentoSelecionado={medicamento}
      />
    );

    expect(
      screen.getByText(/Dose excede o limite máximo de 50 mg para Medicamento Teste/)
    ).toBeInTheDocument();
  });
});
