import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export const NovoAluguel = ({ onSave }: { onSave: () => void }) => {
  const { toast } = useToast();
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  
  // ✅ Novos estados para data e HORÁRIO
  const [dataRetirada, setDataRetirada] = useState("");
  const [horarioRetirada, setHorarioRetirada] = useState("");
  
  const [dataDevolucao, setDataDevolucao] = useState("");
  const [horarioDevolucao, setHorarioDevolucao] = useState("");

  const [valor, setValor] = useState(0);
  const [pagamento, setPagamento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [materiaisDisponiveis, setMateriaisDisponiveis] = useState<Material[]>([]);
  const [loadingMateriais, setLoadingMateriais] = useState<boolean>(true);

  interface Material {
    _id: string;
    nome: string;
    categoria: string;
    valorDiario: number;
    codSerie: string;
    observacoes: string;
    status: "disponivel" | "alugado" | "manutencao";
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 11);
    let formatted = limited;
    if (limited.length > 2) {
      formatted = `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    }
    if (limited.length > 7) {
      formatted = `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
    return formatted;
  };

  useEffect(() => {
    const fetchMateriais = async () => {
      try {
        setLoadingMateriais(true);
        const response = await axios.get("/materiais");
        
        const data = Array.isArray(response.data) ? response.data : [];
        const disponiveis = data.filter((m: Material) => m.status === 'disponivel');
        setMateriaisDisponiveis(disponiveis);
      } catch (error) {
        console.error("Erro ao carregar materiais:", error);
        toast({
          title: "Erro ao carregar materiais",
          description: "Não foi possível carregar a lista de materiais disponíveis.",
          variant: "destructive",
        });
      } finally {
        setLoadingMateriais(false);
      }
    };

    fetchMateriais();
  }, [toast]);

  const addMaterial = (materialNome: string) => {
    if (!selectedMaterials.includes(materialNome)) {
      setSelectedMaterials([...selectedMaterials, materialNome]);
    }
  };

  const removeMaterial = (materialNome: string) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m !== materialNome));
  };

  const handleSave = async () => {
    const novo = {
      cliente,
      telefone,
      endereco,
      dataRetirada,
      horarioRetirada, // ✅ Enviando horário
      dataDevolucao,
      horarioDevolucao, // ✅ Enviando horário
      materiais: selectedMaterials,
      valor: Number(valor),
      pagamento,
      observacoes,
      status: pagamento === "pago" ? "concluido" : "ativo",
    };

    try {
      const response = await axios.post("/rentals", novo);

      toast({
        title: "Aluguel criado com sucesso!",
        description: `Cliente: ${response.data.rental.cliente}`,
      });

      onSave();

      // Limpa os campos
      setCliente("");
      setTelefone("");
      setEndereco("");
      setDataRetirada("");
      setHorarioRetirada("");
      setDataDevolucao("");
      setHorarioDevolucao("");
      setValor(0);
      setPagamento("");
      setObservacoes("");
      setSelectedMaterials([]);
    } catch (error) {
      console.error("Falha ao salvar o aluguel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o aluguel. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="rounded-xl shadow-lg">
        <CardHeader className="bg-gray-50/50 rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <Plus className="h-6 w-6 text-indigo-600" />
            Novo Aluguel
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cliente">
                Nome do Cliente <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(formatPhoneNumber(e.target.value))}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </div>

            {/* ✅ BLOCO DE DATA E HORÁRIO DE RETIRADA */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="dataRetirada">Data Retirada</Label>
                <Input
                  id="dataRetirada"
                  type="date"
                  value={dataRetirada}
                  onChange={(e) => setDataRetirada(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horarioRetirada">Hora Retirada</Label>
                <Input
                  id="horarioRetirada"
                  type="time"
                  value={horarioRetirada}
                  onChange={(e) => setHorarioRetirada(e.target.value)}
                />
              </div>
            </div>

            {/* ✅ BLOCO DE DATA E HORÁRIO DE DEVOLUÇÃO */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="dataDevolucao">Data Devolução</Label>
                <Input
                  id="dataDevolucao"
                  type="date"
                  value={dataDevolucao}
                  onChange={(e) => setDataDevolucao(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horarioDevolucao">Hora Devolução</Label>
                <Input
                  id="horarioDevolucao"
                  type="time"
                  value={horarioDevolucao}
                  onChange={(e) => setHorarioDevolucao(e.target.value)}
                />
              </div>
            </div>
          </div>

        <div className="space-y-2">
            <Label>Materiais Disponíveis</Label> 
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
              {loadingMateriais ? (
                <p className="text-sm text-muted-foreground">Carregando materiais...</p>
              ) : (
                materiaisDisponiveis.map((material) => (
                  <Badge
                    key={material._id} 
                    variant={
                      selectedMaterials.includes(material.nome)
                        ? "default"
                        : "secondary"
                    }
                    className="cursor-pointer transition-colors hover:bg-indigo-500 hover:text-white"
                    onClick={() => addMaterial(material.nome)} 
                  >
                    {material.nome}
                  </Badge>
                ))
              )}
              
              {!loadingMateriais && materiaisDisponiveis.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum material disponível encontrado.</p>
              )}
            </div>

            <Label>Materiais Selecionados</Label>
            <div className="flex flex-wrap gap-2 pt-2 min-h-[40px]">
              {selectedMaterials.length === 0 ? (
                 <p className="text-sm text-muted-foreground">Nenhum material selecionado.</p>
              ) : (
                selectedMaterials.map((materialNome) => (
                  <Badge
                    key={materialNome}
                    className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                    onClick={() => removeMaterial(materialNome)}
                  >
                    {materialNome} <X className="h-3 w-3" />
                  </Badge>
                ))
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                value={valor === 0 ? "" : valor}
                onChange={(e) => {
                  const val = e.target.value;
                  setValor(val === "" ? 0 : Number(val));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pagamento">Pagamento</Label>
              <Select value={pagamento} onValueChange={setPagamento}>
                <SelectTrigger id="pagamento">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" className="rounded-lg">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              Salvar Aluguel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};