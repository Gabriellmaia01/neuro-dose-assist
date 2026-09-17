import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar as CalendarIcon, Filter } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { Patient } from "@/lib/patients";

/**
 * Painel de filtros do histórico.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas UI de filtragem
 *  - Segregação de Interfaces (I): recebe apenas estado e callbacks de filtros
 */

interface PropriedadesFiltros {
  termoBusca: string;
  onTermoBuscaChange: (valor: string) => void;
  data: Date | undefined;
  onDataChange: (valor: Date | undefined) => void;
  pacienteIdSelecionado: string;
  onPacienteChange: (valor: string) => void;
  pacientes: Patient[];
  onLimpar: () => void;
  temFiltrosAtivos: boolean;
}

export function FiltrosHistorico({
  termoBusca,
  onTermoBuscaChange,
  data,
  onDataChange,
  pacienteIdSelecionado,
  onPacienteChange,
  pacientes,
  onLimpar,
  temFiltrosAtivos,
}: PropriedadesFiltros) {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Filter className="w-4 h-4 text-primary" />
        </div>
        <h2 className="font-display font-semibold text-lg">Filtros</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        {/* Busca */}
        <div className="lg:col-span-5 space-y-2">
          <Label htmlFor="history-search" className="text-sm font-semibold">
            Busca
          </Label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="history-search"
              name="historySearch"
              autoComplete="off"
              placeholder="Buscar por paciente, medicamento ou recomendação…"
              value={termoBusca}
              onChange={(e) => onTermoBuscaChange(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        {/* Paciente */}
        <div className="lg:col-span-3 space-y-2">
          <Label className="text-sm font-semibold">Paciente</Label>
          <Select value={pacienteIdSelecionado} onValueChange={onPacienteChange}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Selecionar paciente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {pacientes.map((p) => (
                <SelectItem key={p.id} value={p.id || ""}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data */}
        <div className="lg:col-span-3 space-y-2">
          <Label className="text-sm font-semibold">Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start h-11">
                <CalendarIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                {data
                  ? new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                    }).format(data)
                  : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data}
                onSelect={onDataChange}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Limpar */}
        <div className="lg:col-span-1 flex gap-2">
          <Button
            variant="ghost"
            className="w-full h-11"
            onClick={onLimpar}
            disabled={!temFiltrosAtivos}
          >
            Limpar
          </Button>
        </div>
      </div>
    </div>
  );
}
