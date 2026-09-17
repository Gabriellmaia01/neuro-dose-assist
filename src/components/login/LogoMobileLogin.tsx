import { Brain } from "lucide-react";

/**
 * Logo exibido no topo do formulário em dispositivos móveis.
 * Responsabilidade única: renderizar o logotipo adaptado para telas menores.
 */
export function LogoMobileLogin() {
  return (
    <div className="lg:hidden text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-violet-500 mb-4 shadow-lg shadow-teal-500/25">
        <Brain className="w-9 h-9 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-white">NeuroDose Assist</h1>
      <p className="text-slate-400 text-sm">Sistema de decisão clínica</p>
    </div>
  );
}
