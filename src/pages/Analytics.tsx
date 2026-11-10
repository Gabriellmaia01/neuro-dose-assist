import { useState, useEffect, useMemo, ReactNode } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AdherenceChart,
    TrendAnalysis,
    RiskIndicators,
    PatientInsights,
    PredictiveCard
} from "@/components/analytics";
import {
    aggregateMetrics,
    calculateTrendData,
    identifyRiskPatterns,
    getPatientInsights,
    generatePredictiveInsights,
    type AnalyticsMetrics,
    type TrendDataPoint,
    type RiskAlert,
    type PatientAnalytics,
    type PredictiveInsights as TipoInsightsPreditivos
} from "@/lib/analytics";
import { getDoses, DoseRecord } from "@/lib/doses";
import { getPatients, Patient } from "@/lib/patients";
import { getMedications, Medication } from "@/lib/medications";
import {
    LineChart,
    Brain,
    Users,
    Activity,
    Pill,
    TrendingUp,
    TrendingDown,
    Minus,
    Loader2,
    RefreshCw,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";


// =============================================================================
// INTERFACES — Segregação de Interface (I do SOLID)
// Cada interface representa um contrato enxuto e específico.
// =============================================================================

/** Dados brutos carregados do backend */
interface DadosBrutos {
    doses: DoseRecord[];
    pacientes: Patient[];
    medicamentos: Medication[];
}

/** Estado de carregamento da página */
interface EstadoCarregamento {
    carregando: boolean;
    atualizando: boolean;
}

/** Opções de filtro selecionadas pelo usuário */
interface OpcoesFiltro {
    pacienteSelecionado: string;
    periodoEmDias: string;
}

/** Resultado completo das métricas calculadas */
interface MetricasCalculadas {
    metricas: AnalyticsMetrics;
    dadosTendencia: TrendDataPoint[];
    alertasRisco: RiskAlert[];
    analiticoPacientes: PatientAnalytics[];
    insightsPreditivos: TipoInsightsPreditivos;
}

/** Props de um card de estatística individual */
interface PropsCartaoEstatistica {
    rotulo: string;
    valor: ReactNode;
    icone: ReactNode;
    corBorda: string;
}


// =============================================================================
// HOOKS CUSTOMIZADOS — Inversão de Dependência (D do SOLID)
// A página depende de abstrações (hooks) e não de implementações concretas.
// =============================================================================

/**
 * Hook: useDadosAnaliticos
 * Responsabilidade Única (S): carregar e armazenar dados brutos do backend.
 */
function useDadosAnaliticos(): DadosBrutos & EstadoCarregamento & { recarregar: () => void } {
    const { user } = useAuth();
    const { effectiveUserId } = useClinic();

    const [doses, setDoses] = useState<DoseRecord[]>([]);
    const [pacientes, setPacientes] = useState<Patient[]>([]);
    const [medicamentos, setMedicamentos] = useState<Medication[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);

    const carregarDados = async (mostrarAtualizacao = false) => {
        if (!user || !effectiveUserId) return;

        if (mostrarAtualizacao) setAtualizando(true);
        else setCarregando(true);

        try {
            const [dadosDoses, dadosPacientes, dadosMedicamentos] = await Promise.all([
                getDoses(effectiveUserId),
                getPatients(effectiveUserId),
                getMedications(effectiveUserId)
            ]);

            setDoses(dadosDoses || []);
            setPacientes(dadosPacientes || []);
            setMedicamentos(dadosMedicamentos || []);
        } catch (erro) {
            console.error("Erro ao carregar dados de analytics:", erro);
        } finally {
            setCarregando(false);
            setAtualizando(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, [user, effectiveUserId]);

    const recarregar = () => carregarDados(true);

    return { doses, pacientes, medicamentos, carregando, atualizando, recarregar };
}

/**
 * Hook: useFiltros
 * Responsabilidade Única (S): gerenciar o estado dos filtros da página.
 */
function useFiltros(): OpcoesFiltro & {
    setPacienteSelecionado: (valor: string) => void;
    setPeriodoEmDias: (valor: string) => void;
} {
    const [pacienteSelecionado, setPacienteSelecionado] = useState<string>("all");
    const [periodoEmDias, setPeriodoEmDias] = useState<string>("30");

    return { pacienteSelecionado, setPacienteSelecionado, periodoEmDias, setPeriodoEmDias };
}

/**
 * Hook: useMetricasCalculadas
 * Responsabilidade Única (S): derivar todas as métricas analíticas a partir dos dados brutos e filtros.
 */
function useMetricasCalculadas(
    dados: DadosBrutos,
    filtros: OpcoesFiltro
): MetricasCalculadas {
    const { doses, pacientes, medicamentos } = dados;
    const { pacienteSelecionado, periodoEmDias } = filtros;

    const dosesFiltradas = useMemo(() => {
        if (pacienteSelecionado === "all") return doses;
        return doses.filter(d => d.patientId === pacienteSelecionado);
    }, [doses, pacienteSelecionado]);

    const metricas = useMemo(
        () => aggregateMetrics(dosesFiltradas, pacientes),
        [dosesFiltradas, pacientes]
    );

    const dadosTendencia = useMemo(
        () => calculateTrendData(dosesFiltradas, parseInt(periodoEmDias)),
        [dosesFiltradas, periodoEmDias]
    );

    const alertasRisco = useMemo(
        () => identifyRiskPatterns(dosesFiltradas, pacientes),
        [dosesFiltradas, pacientes]
    );

    const analiticoPacientes = useMemo(() => {
        const pacientesComDoses = new Set(doses.map(d => d.patientId));
        return pacientes
            .filter(p => p.id && pacientesComDoses.has(p.id))
            .map(p => getPatientInsights(p.id!, p.name, doses));
    }, [doses, pacientes]);

    const insightsPreditivos = useMemo(
        () => generatePredictiveInsights(
            pacienteSelecionado === "all" ? null : pacienteSelecionado,
            dosesFiltradas,
            medicamentos
        ),
        [dosesFiltradas, medicamentos, pacienteSelecionado]
    );

    return { metricas, dadosTendencia, alertasRisco, analiticoPacientes, insightsPreditivos };
}


// =============================================================================
// COMPONENTES PUROS — Responsabilidade Única (S) + Aberto/Fechado (O)
// Cada componente renderiza UMA parte da UI e é extensível via props.
// =============================================================================

/** Indicador de carregamento exibido enquanto os dados são buscados */
function IndicadorCarregamento() {
    return (
        <MainLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium">Carregando analytics...</p>
            </div>
        </MainLayout>
    );
}

/** Cabeçalho da página com título e descrição */
function Cabecalho() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neuro-gradient flex items-center justify-center shadow-lg">
                <LineChart className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                    Analytics Avançado
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Insights preditivos e análise inteligente do tratamento
                </p>
            </div>
        </div>
    );
}

/** Painel de filtros: seletor de paciente, período e botão de atualizar */
function PainelFiltros({
    pacientes,
    filtros,
    atualizando,
    aoSelecionarPaciente,
    aoSelecionarPeriodo,
    aoRecarregar,
}: {
    pacientes: Patient[];
    filtros: OpcoesFiltro;
    atualizando: boolean;
    aoSelecionarPaciente: (valor: string) => void;
    aoSelecionarPeriodo: (valor: string) => void;
    aoRecarregar: () => void;
}) {
    return (
        <div className="flex items-center gap-3">
            <Select value={filtros.pacienteSelecionado} onValueChange={aoSelecionarPaciente}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Paciente" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos pacientes</SelectItem>
                    {pacientes.map(p => (
                        <SelectItem key={p.id} value={p.id || ""}>
                            {p.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={filtros.periodoEmDias} onValueChange={aoSelecionarPeriodo}>
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
            </Select>

            <Button
                variant="outline"
                size="icon"
                onClick={aoRecarregar}
                disabled={atualizando}
            >
                <RefreshCw className={cn("w-4 h-4", atualizando && "animate-spin")} />
            </Button>
        </div>
    );
}

/** Card individual de estatística rápida */
function CartaoEstatistica({ rotulo, valor, icone, corBorda }: PropsCartaoEstatistica) {
    return (
        <div className={cn("glass-card rounded-xl p-4 border-l-4", corBorda)}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {rotulo}
                    </p>
                    <div className="mt-1">{valor}</div>
                </div>
                {icone}
            </div>
        </div>
    );
}

/** Resolve o ícone e texto de tendência a partir da direção */
function obterConteudoTendencia(direcao: "up" | "down" | "stable") {
    const mapa = {
        up: {
            icone: <TrendingUp className="w-4 h-4 text-success" />,
            texto: "Alta",
            corTexto: "text-success",
        },
        down: {
            icone: <TrendingDown className="w-4 h-4 text-destructive" />,
            texto: "Queda",
            corTexto: "text-destructive",
        },
        stable: {
            icone: <Minus className="w-4 h-4 text-muted-foreground" />,
            texto: "Estável",
            corTexto: "text-muted-foreground",
        },
    };
    return mapa[direcao];
}

/** Resolve a cor do texto com base em um valor e limiares */
function obterCorPorLimiar(valor: number, limiarAlto: number, limiarMedio: number): string {
    if (valor >= limiarAlto) return "text-success";
    if (valor >= limiarMedio) return "text-warning";
    return "text-destructive";
}

/** Grade com os 6 cards de estatísticas rápidas */
function GradeEstatisticas({ metricas }: { metricas: AnalyticsMetrics }) {
    const tendencia = obterConteudoTendencia(metricas.trendDirection);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <CartaoEstatistica
                rotulo="Total Doses"
                valor={<p className="text-2xl font-display font-bold">{metricas.totalDoses}</p>}
                icone={<Pill className="w-8 h-8 text-primary/60" />}
                corBorda="border-l-primary"
            />

            <CartaoEstatistica
                rotulo="Pacientes"
                valor={<p className="text-2xl font-display font-bold">{metricas.totalPatients}</p>}
                icone={<Users className="w-8 h-8 text-info/60" />}
                corBorda="border-l-info"
            />

            <CartaoEstatistica
                rotulo="Eficácia"
                valor={
                    <p className={cn(
                        "text-2xl font-display font-bold",
                        obterCorPorLimiar(metricas.avgEfficacy, 70, 50)
                    )}>
                        {metricas.avgEfficacy}%
                    </p>
                }
                icone={<Activity className="w-8 h-8 text-success/60" />}
                corBorda="border-l-success"
            />

            <CartaoEstatistica
                rotulo="Adesão"
                valor={
                    <p className={cn(
                        "text-2xl font-display font-bold",
                        obterCorPorLimiar(metricas.adherenceRate, 80, 60)
                    )}>
                        {metricas.adherenceRate}%
                    </p>
                }
                icone={<Brain className="w-8 h-8 text-purple-500/60" />}
                corBorda="border-l-purple-500"
            />

            <CartaoEstatistica
                rotulo="Alertas"
                valor={
                    <p className={cn(
                        "text-2xl font-display font-bold",
                        metricas.riskAlerts > 0 ? "text-warning" : "text-success"
                    )}>
                        {metricas.riskAlerts}
                    </p>
                }
                icone={<Sparkles className="w-8 h-8 text-warning/60" />}
                corBorda="border-l-warning"
            />

            <CartaoEstatistica
                rotulo="Tendência"
                valor={
                    <div className="flex items-center gap-2">
                        {tendencia.icone}
                        <span className={cn("text-lg font-display font-bold", tendencia.corTexto)}>
                            {tendencia.texto}
                        </span>
                    </div>
                }
                icone={null}
                corBorda="border-l-accent"
            />
        </div>
    );
}

/** Painel lateral com anel de adesão e indicadores de risco */
function PainelAdesao({
    metricas,
    periodoEmDias,
    alertasRisco,
}: {
    metricas: AnalyticsMetrics;
    periodoEmDias: string;
    alertasRisco: RiskAlert[];
}) {
    return (
        <div className="space-y-6">
            {/* Anel de Adesão */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-lg">Taxa de Adesão</h3>
                </div>
                <div className="flex justify-center py-4">
                    <AdherenceChart
                        value={metricas.adherenceRate}
                        size="lg"
                        trend={metricas.trendDirection}
                    />
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                    Baseado nos últimos {periodoEmDias} dias
                </p>
            </div>

            {/* Indicadores de Risco */}
            <RiskIndicators alerts={alertasRisco} maxVisible={4} />
        </div>
    );
}

/** Grade principal com gráficos (coluna esquerda) e métricas/IA (coluna direita) */
function GradeAnaliticos({
    dadosTendencia,
    analiticoPacientes,
    metricas,
    periodoEmDias,
    alertasRisco,
}: {
    dadosTendencia: TrendDataPoint[];
    analiticoPacientes: PatientAnalytics[];
    metricas: AnalyticsMetrics;
    periodoEmDias: string;
    alertasRisco: RiskAlert[];
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda — Gráficos */}
            <div className="lg:col-span-2 space-y-6">
                <TrendAnalysis data={dadosTendencia} height={280} />
                <PatientInsights analytics={analiticoPacientes} />
            </div>

            {/* Coluna Direita — Métricas e IA */}
            <PainelAdesao
                metricas={metricas}
                periodoEmDias={periodoEmDias}
                alertasRisco={alertasRisco}
            />
        </div>
    );
}


// =============================================================================
// COMPONENTE PRINCIPAL — Composição via Inversão de Dependência (D do SOLID)
// A página é apenas uma composição de hooks e componentes especializados.
// =============================================================================

export default function Analytics() {
    const dados = useDadosAnaliticos();
    const filtros = useFiltros();
    const calculadas = useMetricasCalculadas(dados, filtros);

    if (dados.carregando) {
        return <IndicadorCarregamento />;
    }

    return (
        <MainLayout>
            <div className="space-y-8 pb-8">
                {/* Cabeçalho + Filtros */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <Cabecalho />
                    <PainelFiltros
                        pacientes={dados.pacientes}
                        filtros={filtros}
                        atualizando={dados.atualizando}
                        aoSelecionarPaciente={filtros.setPacienteSelecionado}
                        aoSelecionarPeriodo={filtros.setPeriodoEmDias}
                        aoRecarregar={dados.recarregar}
                    />
                </div>

                {/* Estatísticas Rápidas */}
                <GradeEstatisticas metricas={calculadas.metricas} />

                {/* Grade Analítica Principal */}
                <GradeAnaliticos
                    dadosTendencia={calculadas.dadosTendencia}
                    analiticoPacientes={calculadas.analiticoPacientes}
                    metricas={calculadas.metricas}
                    periodoEmDias={filtros.periodoEmDias}
                    alertasRisco={calculadas.alertasRisco}
                />

                {/* Card Preditivo — Largura Total */}
                <PredictiveCard insights={calculadas.insightsPreditivos} />
            </div>
        </MainLayout>
    );
}
