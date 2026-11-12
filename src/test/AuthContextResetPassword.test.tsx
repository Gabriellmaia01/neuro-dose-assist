import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const { sendPasswordReset, toast } = vi.hoisted(() => ({
  sendPasswordReset: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/services", () => ({
  authService: {
    sendPasswordReset,
    onAuthStateChanged: vi.fn(() => () => {}),
  },
}));

vi.mock("@/hooks/use-toast", () => ({ toast }));

import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe("AuthContext.resetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envia o email e mostra mensagem neutra de sucesso", async () => {
    sendPasswordReset.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.resetPassword("medico@clinica.com");
    });

    expect(sendPasswordReset).toHaveBeenCalledWith("medico@clinica.com");
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Verifique seu email" })
    );
  });

  it.each([
    ["auth/invalid-email", "Email inválido."],
    ["auth/too-many-requests", "Muitas tentativas. Aguarde alguns minutos e tente novamente."],
    ["auth/network-request-failed", "Erro de rede. Verifique sua conexão com a internet."],
    ["auth/qualquer-outro", "Não foi possível enviar o email de recuperação. Tente novamente."],
  ])("traduz o erro %s e relança para o chamador", async (code, mensagem) => {
    sendPasswordReset.mockRejectedValueOnce({ code });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await expect(result.current.resetPassword("x@y.com")).rejects.toEqual({ code });
    });

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: mensagem, variant: "destructive" })
    );
  });
});
