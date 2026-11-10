import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormularioLogin } from "@/components/login/FormularioLogin";

describe("FormularioLogin", () => {
  it("encaminha alterações de email e senha para os handlers", () => {
    const aoMudarEmail = vi.fn();
    const aoMudarSenha = vi.fn();

    render(
      <FormularioLogin
        email=""
        senha=""
        carregando={false}
        aoMudarEmail={aoMudarEmail}
        aoMudarSenha={aoMudarSenha}
        aoEnviar={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "pessoa@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "senha-segura" },
    });

    expect(aoMudarEmail).toHaveBeenCalledWith("pessoa@example.com");
    expect(aoMudarSenha).toHaveBeenCalledWith("senha-segura");
  });

  it("envia o formulário e desabilita o envio enquanto carrega", () => {
    const aoEnviar = vi.fn();
    const { rerender } = render(
      <FormularioLogin
        email="pessoa@example.com"
        senha="senha-segura"
        carregando={false}
        aoMudarEmail={vi.fn()}
        aoMudarSenha={vi.fn()}
        aoEnviar={aoEnviar}
      />
    );

    fireEvent.submit(screen.getByRole("button", { name: "Entrar" }).closest("form")!);
    expect(aoEnviar).toHaveBeenCalledTimes(1);

    rerender(
      <FormularioLogin
        email="pessoa@example.com"
        senha="senha-segura"
        carregando
        aoMudarEmail={vi.fn()}
        aoMudarSenha={vi.fn()}
        aoEnviar={aoEnviar}
      />
    );

    expect(screen.getByRole("button", { name: "Entrando..." })).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Senha")).toBeDisabled();
  });
});
