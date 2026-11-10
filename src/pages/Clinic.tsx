import { MainLayout } from "@/components/layout/MainLayout";
import {
    ClinicHeader,
    ClinicLoadingIndicator,
    NoClinicState,
    PendingClinicInvite,
} from "@/components/clinic/ClinicOverview";
import { ExistingClinicSection } from "@/components/clinic/ClinicTeam";
import {
    useAcoesClinica,
    useConviteUrl,
    useDadosClinica,
    useFormulariosClinica,
} from "@/hooks/useClinicManagement";

export default function ClinicPage() {
    const dados = useDadosClinica();
    const conviteUrl = useConviteUrl(dados.user);
    const formularios = useFormulariosClinica();
    const acoes = useAcoesClinica(dados, conviteUrl);

    const aoClicarCriar = async () => {
        await acoes.criarClinica(formularios.nomeClinica);
        formularios.resetarFormularioCriacao();
    };

    const aoClicarEnviarConvite = async () => {
        if (!dados.clinica?.id) return;
        await acoes.enviarConvite(
            dados.clinica.id,
            dados.clinica.name,
            formularios.emailConvite,
            formularios.funcaoConvite
        );
        formularios.resetarFormularioConvite();
    };

    const aoRemoverMembro = (uid: string) => {
        if (!dados.clinica?.id) return;
        acoes.removerMembro(dados.clinica.id, uid);
    };

    return (
        <MainLayout>
            <div className="space-y-8 pb-8">
                <ClinicHeader />
                {dados.carregando || conviteUrl.carregandoConvite ? (
                    <ClinicLoadingIndicator />
                ) : (
                    <>
                        {conviteUrl.convitePendente && (
                            <PendingClinicInvite
                                invite={conviteUrl.convitePendente}
                                saving={dados.salvando}
                                onAccept={acoes.aceitarConviteUrl}
                                onDecline={acoes.recusarConviteUrl}
                            />
                        )}
                        {!dados.clinica && !conviteUrl.convitePendente && (
                            <NoClinicState
                                dialogOpen={formularios.dialogoCriacaoAberto}
                                onDialogChange={formularios.setDialogoCriacaoAberto}
                                clinicName={formularios.nomeClinica}
                                onClinicNameChange={formularios.setNomeClinica}
                                saving={dados.salvando}
                                onCreate={aoClicarCriar}
                            />
                        )}
                        {dados.clinica && (
                            <ExistingClinicSection
                                clinic={dados.clinica}
                                isOwner={dados.ehProprietario}
                                forms={formularios}
                                onSendInvite={aoClicarEnviarConvite}
                                onRemoveMember={aoRemoverMembro}
                            />
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}
