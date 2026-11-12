import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DialogoRecuperarSenha } from "@/components/login/DialogoRecuperarSenha";

function renderizar(props: Partial<React.ComponentProps<typeof DialogoRecuperarSenha>> = {}) {
  const padrao = {
    aberto: true,
    email: "",
    enviando: false,
    aoMudarAberto: vi.fn(),
    aoMudarEmail: vi.fn(),
    aoEnviar: vi.fn((e: React.FormEvent) => e.preventDefault()),
  };
  const final = { ...padrao, ...props };
  render(<DialogoRecuperarSenha {...final} />);
  return final;
}

describe("DialogoRecuperarSenha", () => {
  it("não renderiza o conteúdo quando está fechado", () => {
    renderizar({ aberto: false });
    expect(screen.queryByText("Recuperar senha")).not.toBeInTheDocument();
  });

  it("encaminha o email digitado para o handler", () => {
    const { aoMudarEmail } = renderizar();
    fireEvent.change(screen.getByLabelText("Email da conta"), {
      target: { value: "medico@clinica.com" },
    });
    expect(aoMudarEmail).toHaveBeenCalledWith("medico@clinica.com");
  });

  it("mantém o botão de envio desabilitado enquanto o email está vazio", () => {
    renderizar({ email: "   " });
    expect(screen.getByRole("button", { name: "Enviar link" })).toBeDisabled();
  });

  it("envia o formulário quando há email", () => {
    const { aoEnviar } = renderizar({ email: "medico@clinica.com" });
    fireEvent.submit(screen.getByRole("button", { name: "Enviar link" }).closest("form")!);
    expect(aoEnviar).toHaveBeenCalledTimes(1);
  });

  it("desabilita campo e botões enquanto envia", () => {
    renderizar({ email: "medico@clinica.com", enviando: true });
    expect(screen.getByRole("button", { name: "Enviando..." })).toBeDisabled();
    expect(screen.getByLabelText("Email da conta")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });

  it("fecha o diálogo ao clicar em Cancelar", () => {
    const { aoMudarAberto } = renderizar();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(aoMudarAberto).toHaveBeenCalledWith(false);
  });
});
