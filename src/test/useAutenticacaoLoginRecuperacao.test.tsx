import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

const { resetPassword } = vi.hoisted(() => ({ resetPassword: vi.fn() }));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
    resetPassword,
  }),
}));

import { useAutenticacaoLogin } from "@/hooks/useAutenticacaoLogin";

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;
const evento = { preventDefault: vi.fn() } as unknown as React.FormEvent;

describe("useAutenticacaoLogin: recuperação de senha", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("abre o diálogo reaproveitando o email já digitado no login", () => {
    const { result } = renderHook(() => useAutenticacaoLogin(), { wrapper });

    act(() => result.current.setEmail("medico@clinica.com"));
    act(() => result.current.recuperacaoSenha.abrir());

    expect(result.current.recuperacaoSenha.aberto).toBe(true);
    expect(result.current.recuperacaoSenha.email).toBe("medico@clinica.com");
  });

  it("fecha o diálogo depois de enviar com sucesso", async () => {
    resetPassword.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useAutenticacaoLogin(), { wrapper });

    act(() => result.current.recuperacaoSenha.setEmail("medico@clinica.com"));
    act(() => result.current.recuperacaoSenha.abrir());
    act(() => result.current.recuperacaoSenha.setEmail("outro@clinica.com"));
    await act(async () => {
      await result.current.recuperacaoSenha.enviar(evento);
    });

    expect(resetPassword).toHaveBeenCalledWith("outro@clinica.com");
    expect(result.current.recuperacaoSenha.aberto).toBe(false);
    expect(result.current.recuperacaoSenha.enviando).toBe(false);
  });

  it("mantém o diálogo aberto quando o envio falha", async () => {
    resetPassword.mockRejectedValueOnce({ code: "auth/invalid-email" });
    const { result } = renderHook(() => useAutenticacaoLogin(), { wrapper });

    act(() => result.current.recuperacaoSenha.abrir());
    act(() => result.current.recuperacaoSenha.setEmail("invalido"));
    await act(async () => {
      await result.current.recuperacaoSenha.enviar(evento);
    });

    expect(result.current.recuperacaoSenha.aberto).toBe(true);
    expect(result.current.recuperacaoSenha.enviando).toBe(false);
  });
});
