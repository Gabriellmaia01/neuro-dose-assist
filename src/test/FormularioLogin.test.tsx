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

    fireEvent.change(screen.getByLabelText("E-mail clínico"), {
      target: { value: "pessoa@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Chave de acesso"), {
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

    fireEvent.submit(
      screen.getByRole("button", { name: "Acessar painel clínico" }).closest("form")!
    );
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

    expect(
      screen.getByRole("button", { name: "Acessando painel clínico" })
    ).toBeDisabled();
    expect(screen.getByLabelText("E-mail clínico")).toBeDisabled();
    expect(screen.getByLabelText("Chave de acesso")).toBeDisabled();
  });

  it("aciona aoEsqueceuSenha ao clicar em \"Recuperar chave\"", () => {
    const aoEsqueceuSenha = vi.fn();

    render(
      <FormularioLogin
        email=""
        senha=""
        carregando={false}
        aoMudarEmail={vi.fn()}
        aoMudarSenha={vi.fn()}
        aoEnviar={vi.fn()}
        aoEsqueceuSenha={aoEsqueceuSenha}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Recuperar chave" }));

    expect(aoEsqueceuSenha).toHaveBeenCalledTimes(1);
  });
});
