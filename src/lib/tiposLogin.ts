/**
 * Tipos compartilhados da página de Login.
 * Centraliza as interfaces de props para os subcomponentes.
 */

/**
 * Props do formulário de login (email/senha).
 */
export interface PropriedadesFormularioLogin {
  email: string;
  senha: string;
  carregando: boolean;
  aoMudarEmail: (valor: string) => void;
  aoMudarSenha: (valor: string) => void;
  aoEnviar: (e: React.FormEvent) => void;
}

/**
 * Props do formulário de cadastro (email/senha).
 */
export interface PropriedadesFormularioCadastro {
  email: string;
  senha: string;
  carregando: boolean;
  aoMudarEmail: (valor: string) => void;
  aoMudarSenha: (valor: string) => void;
  aoEnviar: (e: React.FormEvent) => void;
}

/**
 * Props do botão de login com Google.
 */
export interface PropriedadesBotaoGoogle {
  carregando: boolean;
  aoClicar: () => void;
}

/**
 * Retorno do hook useAutenticacaoLogin.
 */
export interface RetornoAutenticacaoLogin {
  email: string;
  senha: string;
  carregando: boolean;
  setEmail: (valor: string) => void;
  setSenha: (valor: string) => void;
  handleEntrar: (e: React.FormEvent) => Promise<void>;
  handleCriarConta: (e: React.FormEvent) => Promise<void>;
  handleEntrarComGoogle: () => Promise<void>;
}
