import { describe, it, expect, vi, beforeEach } from "vitest";
import { FirebaseAuthService } from "@/services/firebase/authService";
import * as firebaseAuth from "firebase/auth";

vi.mock("firebase/auth", () => {
  return {
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    updatePassword: vi.fn(),
    reauthenticateWithCredential: vi.fn(),
    EmailAuthProvider: {
      credential: vi.fn().mockReturnValue({ providerId: "password" }),
    },
  };
});

vi.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: null,
  },
  googleProvider: {},
}));

describe("Serviço de Autenticação (FirebaseAuthService)", () => {
  let service: FirebaseAuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FirebaseAuthService();
  });

  describe("signInWithEmail", () => {
    it("deve mapear corretamente o usuário do Firebase para AuthUser no login", async () => {
      const mockFirebaseUser = {
        uid: "uid-123",
        email: "medico@clinica.com",
        displayName: "Dr. João",
        photoURL: "https://foto.com/perfil.jpg",
      };

      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValueOnce({
        user: mockFirebaseUser as any,
      } as any);

      const user = await service.signInWithEmail("medico@clinica.com", "senhaForte123");

      expect(user).toEqual({
        uid: "uid-123",
        email: "medico@clinica.com",
        displayName: "Dr. João",
        photoURL: "https://foto.com/perfil.jpg",
      });
      expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });

    it("deve propagar o erro de credenciais inválidas", async () => {
      const erroAuth = new Error("auth/wrong-password");
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce(erroAuth);

      await expect(
        service.signInWithEmail("medico@clinica.com", "senhaIncorreta")
      ).rejects.toThrow("auth/wrong-password");
    });
  });

  describe("signUpWithEmail", () => {
    it("deve mapear o AuthUser após cadastro com sucesso", async () => {
      const mockNovoUser = {
        uid: "uid-novo",
        email: "novo@clinica.com",
        displayName: null,
        photoURL: null,
      };

      vi.mocked(firebaseAuth.createUserWithEmailAndPassword).mockResolvedValueOnce({
        user: mockNovoUser as any,
      } as any);

      const user = await service.signUpWithEmail("novo@clinica.com", "senha123");

      expect(user.uid).toBe("uid-novo");
      expect(user.email).toBe("novo@clinica.com");
      expect(user.displayName).toBeNull();
    });
  });

  describe("signOut", () => {
    it("deve chamar signOut do Firebase SDK", async () => {
      vi.mocked(firebaseAuth.signOut).mockResolvedValueOnce();
      await service.signOut();
      expect(firebaseAuth.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe("updatePassword", () => {
    it("deve lançar erro se não houver usuário autenticado", async () => {
      await expect(service.updatePassword("senhaAtual", "senhaNova")).rejects.toThrow(
        "Usuário não autenticado"
      );
    });
  });
});

