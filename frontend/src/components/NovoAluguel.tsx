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

export const NovoAluguel = ({ onSave }) => {
  const { toast } = useToast();
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [dataRetirada, setDataRetirada] = useState("");
  const [dataDevolucao, setDataDevolucao] = useState("");
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

// Adicione este useEffect após a declaração dos seus estados
  useEffect(() => {
    // Função assíncrona para buscar os materiais no backend
    const fetchMateriais = async () => {
      try {
        setLoadingMateriais(true);
        const response = await fetch("http://localhost:5000/api/materiais");

        if (!response.ok) {
          throw new Error("Falha ao buscar os materiais.");
        }

        const data: Material[] = await response.json();

        // Filtra apenas os materiais que estão 'disponíveis'
        const disponiveis = data.filter(m => m.status === 'disponivel');
        
        setMateriaisDisponiveis(disponiveis);
      } catch (error) {
        console.error("Erro ao carregar materiais:", error);
        toast({
          title: "Erro ao carregar materiais",
          description: "Não foi possível carregar a lista de materiais disponíveis.",
          variant: "destructive",
        });
      } finally {
        // Garante que o loading seja desativado mesmo em caso de erro
        setLoadingMateriais(false);
      }
    };

    fetchMateriais();
    // A dependência [toast] garante que o hook tem acesso ao toast atualizado
  }, [toast]);

 // A função está correta, apenas garantindo o tipo
  const addMaterial = (materialNome: string) => {
    if (!selectedMaterials.includes(materialNome)) {
      setSelectedMaterials([...selectedMaterials, materialNome]);
    }
  };

  // A função removeMaterial também está correta
  const removeMaterial = (materialNome: string) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m !== materialNome));
  };

  const handleSave = async () => {
    const novo = {
      cliente,
      telefone,
      endereco,
      dataRetirada,
      dataDevolucao,
      materiais: selectedMaterials,
      valor: Number(valor),
      pagamento,
      observacoes,
      status: pagamento === "pago" ? "concluido" : "pendente",
    };

    try {
      const response = await fetch("http://localhost:5000/api/rentals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novo),
      });

      if (!response.ok) {
        // Log para obter o status da resposta e o texto do status
        console.error(
          `Falha ao salvar o aluguel: ${response.status} ${response.statusText}`
        );
        throw new Error("Erro ao salvar o aluguel.");
      }

      const data = await response.json();

      toast({
        title: "Aluguel criado com sucesso!",
        description: `Cliente: ${data.rental.cliente}`,
      });

      console.log("Chamando a função onSave no componente NovoAluguel.");
      onSave();

      setCliente("");
      setTelefone("");
      setEndereco("");
      setDataRetirada("");
      setDataDevolucao("");
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
                onChange={(e) => setTelefone(e.target.value)}
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
            <div className="space-y-2">
              <Label htmlFor="dataRetirada">Data de Retirada</Label>
              <Input
                id="dataRetirada"
                type="date"
                value={dataRetirada}
                onChange={(e) => setDataRetirada(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataDevolucao">Data de Devolução</Label>
              <Input
                id="dataDevolucao"
                type="date"
                value={dataDevolucao}
                onChange={(e) => setDataDevolucao(e.target.value)}
              />
            </div>
          </div>
        <div className="space-y-2">
            <Label>Materiais Disponíveis</Label> 
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
              {/* Adiciona feedback de loading */}
              {loadingMateriais ? (
                <p className="text-sm text-muted-foreground">Carregando materiais...</p>
              ) : (
                /* Itera sobre o estado materiaisDisponiveis (que são objetos) */
                materiaisDisponiveis.map((material) => (
                  <Badge
                    /* Usa o _id como chave única para o React */
                    key={material._id} 
                    variant={
                      /* Verifica se o NOME do material está na lista de selecionados */
                      selectedMaterials.includes(material.nome)
                        ? "default"
                        : "secondary"
                    }
                    className="cursor-pointer transition-colors hover:bg-indigo-500 hover:text-white"
                    /* Ao clicar, adiciona o NOME do material */
                    onClick={() => addMaterial(material.nome)} 
                  >
                    {/* Exibe o NOME do material */
                    material.nome}
                  </Badge>
                ))
              )}
              
              {/* Feedback caso não haja materiais disponíveis */}
              {!loadingMateriais && materiaisDisponiveis.length === 0 && (
                 <p className="text-sm text-muted-foreground">Nenhum material disponível encontrado.</p>
              )}
            </div>

            {/* A lógica de renderização dos materiais SELECIONADOS já está correta */}
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
                  setValor(val === "" ? "" : Number(val));
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
