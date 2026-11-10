import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAutenticacaoLogin } from "@/hooks/useAutenticacaoLogin";
import { LadoHeroLogin } from "@/components/login/LadoHeroLogin";
import { LogoMobileLogin } from "@/components/login/LogoMobileLogin";
import { FormularioLogin } from "@/components/login/FormularioLogin";
import { FormularioCadastro } from "@/components/login/FormularioCadastro";
import { BotaoGoogle } from "@/components/login/BotaoGoogle";

/**
 * Página de Login (Autenticação).
 * Componente fino de composição — delega estado e lógica para useAutenticacaoLogin
 * e delega renderização visual para os subcomponentes em src/components/login/.
 *
 * Princípios SOLID aplicados:
 * - SRP: Apenas compõe a página e os subcomponentes (não gerencia estado ou lógica complexa)
 * - OCP/ISP: Subcomponentes podem evoluir isoladamente
 */
export default function Login() {
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
    <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Lado esquerdo - 3D Scene e Features */}
      <LadoHeroLogin />

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <LogoMobileLogin />

          <Card className="border-0 bg-slate-900/50 backdrop-blur-xl shadow-2xl shadow-black/20">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo</h2>
                <p className="text-slate-400 text-sm">
                  Entre com sua conta para acessar o sistema
                </p>
              </div>

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-800/50 p-1 rounded-xl">
                  <TabsTrigger
                    value="login"
                    className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all"
                  >
                    Criar Conta
                  </TabsTrigger>
                </TabsList>

                {/* Tab de Login */}
                <TabsContent value="login" className="space-y-4 mt-0">
                  <FormularioLogin
                    email={email}
                    senha={senha}
                    carregando={carregando}
                    aoMudarEmail={setEmail}
                    aoMudarSenha={setSenha}
                    aoEnviar={handleEntrar}
                  />
                </TabsContent>

                {/* Tab de Criar Conta */}
                <TabsContent value="signup" className="space-y-4 mt-0">
                  <FormularioCadastro
                    email={email}
                    senha={senha}
                    carregando={carregando}
                    aoMudarEmail={setEmail}
                    aoMudarSenha={setSenha}
                    aoEnviar={handleCriarConta}
                  />
                </TabsContent>
              </Tabs>

              {/* Divisor */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900/50 px-3 text-slate-500">
                    Ou continue com
                  </span>
                </div>
              </div>

              {/* Botão Google */}
              <BotaoGoogle
                carregando={carregando}
                aoClicar={handleEntrarComGoogle}
              />
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Ao continuar, você concorda com nossos{" "}
            <button className="text-teal-400 hover:text-teal-300 underline-offset-4 hover:underline">
              termos de serviço
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
