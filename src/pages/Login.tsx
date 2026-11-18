import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useAutenticacaoLogin } from "@/hooks/useAutenticacaoLogin";
import { LadoHeroLogin } from "@/components/login/LadoHeroLogin";
import { LogoMobileLogin } from "@/components/login/LogoMobileLogin";
import { FormularioLogin } from "@/components/login/FormularioLogin";
import { FormularioCadastro } from "@/components/login/FormularioCadastro";
import { BotaoGoogle } from "@/components/login/BotaoGoogle";
import { Lock, Shield, CheckCircle2 } from "lucide-react";

/**
 * Página de Login e Apresentação Clínica.
 * Redesenhada com padrões Awwwards & Minimalismo Clínico Suíço:
 * - Tipografia de alto contraste com micro-rótulos técnicos
 * - Indicador de abas fluido animado via Framer Motion layoutId
 * - Acabamento fosco cirúrgico em vidro acrílico (Frosted Glass)
 * - Microinterações táteis e total preservação dos contratos de autenticação
 */
export default function Login() {
  const [abaAtiva, setAbaAtiva] = useState<"login" | "signup">("login");
  const {
    email,
    senha,
    carregando,
    setEmail,
    setSenha,
    handleEntrar,
    handleCriarConta,
    handleEntrarComGoogle,
  } = useAutenticacaoLogin();

  return (
    <div className="min-h-screen flex overflow-hidden bg-slate-950 text-slate-100 relative selection:bg-teal-500/30 selection:text-teal-200">
      {/* Grade Suíça Global com Linhas Finas */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Lado Esquerdo - Hero 3D e Apresentação Tecnológica */}
      <LadoHeroLogin />

      {/* Lado Direito - Portal de Acesso Clínico */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative z-20 overflow-y-auto">
        {/* Barra Técnica Superior Direita */}
        <div className="hidden sm:flex items-center justify-between font-mono text-[10px] text-slate-500 tracking-widest pb-4">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>SECURE ENCLAVE ACTIVE</span>
          </span>
          <span>AUTENTICAÇÃO v2.4</span>
        </div>

        {/* Bloco Central do Formulário */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          {/* Logo exibido em telas móveis */}
          <LogoMobileLogin />

          {/* Card de Autenticação Estilo Vidro Clínico */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="border border-slate-800/80 bg-slate-900/50 backdrop-blur-2xl shadow-2xl shadow-black/40 rounded-2xl overflow-hidden relative">
              {/* Borda superior iluminada cirúrgica */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />

              <CardContent className="p-7 sm:p-9 space-y-6">
                {/* Cabeçalho do Card */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-slate-400 text-[10px] font-mono tracking-widest uppercase">
                    <Lock className="w-3 h-3 text-teal-400" />
                    <span>Portal de Prescrição Médica</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    {abaAtiva === "login" ? "Identificação Clínica" : "Criar Credencial"}
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm font-normal">
                    {abaAtiva === "login"
                      ? "Acesse o sistema de decisão e farmacocinética neural."
                      : "Registre sua credencial para acessar a plataforma."}
                  </p>
                </div>

                {/* Seletor de Abas Fluido com Framer Motion layoutId */}
                <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800/90 rounded-xl relative">
                  <button
                    type="button"
                    onClick={() => setAbaAtiva("login")}
                    className={`relative z-10 py-2.5 text-xs font-mono tracking-wider uppercase transition-colors duration-200 text-center ${
                      abaAtiva === "login"
                        ? "text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {abaAtiva === "login" && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-slate-800/90 border border-slate-700/80 rounded-lg shadow-sm"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">Entrar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAbaAtiva("signup")}
                    className={`relative z-10 py-2.5 text-xs font-mono tracking-wider uppercase transition-colors duration-200 text-center ${
                      abaAtiva === "signup"
                        ? "text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {abaAtiva === "signup" && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-slate-800/90 border border-slate-700/80 rounded-lg shadow-sm"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">Novo Cadastro</span>
                  </button>
                </div>

                {/* Conteúdo das Abas com AnimatePresence */}
                <div className="min-h-[220px]">
                  <AnimatePresence mode="wait">
                    {abaAtiva === "login" ? (
                      <motion.div
                        key="tab-login"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormularioLogin
                          email={email}
                          senha={senha}
                          carregando={carregando}
                          aoMudarEmail={setEmail}
                          aoMudarSenha={setSenha}
                          aoEnviar={handleEntrar}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="tab-signup"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FormularioCadastro
                          email={email}
                          senha={senha}
                          carregando={carregando}
                          aoMudarEmail={setEmail}
                          aoMudarSenha={setSenha}
                          aoEnviar={handleCriarConta}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Divisor com Marcador Suíço */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono">
                    <span className="bg-slate-900 px-3 text-slate-500">
                      OU AUTENTICAÇÃO FEDERADA
                    </span>
                  </div>
                </div>

                {/* Botão Google */}
                <BotaoGoogle
                  carregando={carregando}
                  aoClicar={handleEntrarComGoogle}
                />

                {/* Garantia de Segurança e Privacidade Médica */}
                <div className="pt-2 flex items-center justify-center gap-2 font-mono text-[11px] text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Ambiente em conformidade CFM & LGPD</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Rodapé Clínico Inferior */}
        <div className="pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[10px] text-slate-600">
          <span>NEURO-DOSE ASSIST • CLÍNICA DE ALTA PRECISÃO</span>
          <span>© {new Date().getFullYear()} TODOS OS DIREITOS RESERVADOS</span>
        </div>
      </div>
    </div>
  );
}
