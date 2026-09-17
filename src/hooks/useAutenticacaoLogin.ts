import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { type RetornoAutenticacaoLogin } from "@/lib/tiposLogin";

/**
 * Hook que encapsula toda a lógica de autenticação da página de login.
 * Responsabilidade única: gerenciar estado do formulário e handlers de auth.
 *
 * Princípios SOLID aplicados:
 * - SRP: apenas lógica de autenticação, sem renderização
 * - DIP: depende da abstração useAuth(), não de implementações concretas do Firebase
 */
export function useAutenticacaoLogin(): RetornoAutenticacaoLogin {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleEntrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      await signIn(email, senha);
      navigate("/");
    } catch (error) {
      // Erro já tratado no contexto
    } finally {
      setCarregando(false);
    }
  };

  const handleCriarConta = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      await signUp(email, senha);
      navigate("/");
    } catch (error) {
      // Erro já tratado no contexto
    } finally {
      setCarregando(false);
    }
  };

  const handleEntrarComGoogle = async () => {
    setCarregando(true);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (error) {
      // Erro já tratado no contexto
    } finally {
      setCarregando(false);
    }
  };

  return {
    email,
    senha,
    carregando,
    setEmail,
    setSenha,
    handleEntrar,
    handleCriarConta,
    handleEntrarComGoogle,
  };
}
