import { useState } from "react";
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

export const NovoAluguel = () => {
  const { toast } = useToast();
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [dataRetirada, setDataRetirada] = useState("");
  const [dataDevolucao, setDataDevolucao] = useState("");
  const [valor, setValor] = useState(0);
  const [pagamento, setPagamento] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const materiaisDisponiveis = [
    "Betoneira",
    "Andaime",
    "Furadeira",
    "Martelete",
    "Compressor",
    "Pistola de Pintura",
    "Serra Circular",
    "Esmerilhadeira",
    "Parafusadeira",
    "Nivel a Laser",
  ];

  const addMaterial = (material) => {
    if (!selectedMaterials.includes(material)) {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  const removeMaterial = (material) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m !== material));
  };

  const handleSave = async () => {
    // 1. Coleta os dados do formulário
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
      status: pagamento,
    };

    try {
      // 2. Faz a requisição POST para API
      const response = await fetch("http://localhost:5000/api/rentals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novo),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar o aluguel.");
      }

      const data = await response.json();

      // 3. Exibe a notificação de sucesso
      toast({
        title: "Aluguel criado com sucesso!",
        description: `Cliente: ${data.rental.cliente}`,
      });

      // 4. Limpa o formulário
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
            <Label>Materiais</Label>
            <div className="flex flex-wrap gap-2">
              {materiaisDisponiveis.map((material) => (
                <Badge
                  key={material}
                  variant={
                    selectedMaterials.includes(material)
                      ? "default"
                      : "secondary"
                  }
                  className="cursor-pointer transition-colors hover:bg-indigo-500 hover:text-white"
                  onClick={() => addMaterial(material)}
                >
                  {material}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedMaterials.map((material) => (
                <Badge
                  key={material}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                  onClick={() => removeMaterial(material)}
                >
                  {material} <X className="h-3 w-3" />
                </Badge>
              ))}
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
