import { useState, useEffect, useMemo } from "react";
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
import { useNotification } from "@/context/NotificationContext";

export const NovoAluguel = ({ onSave }: { onSave: () => void }) => {
  const { toast } = useToast();
  const { addNotification } = useNotification();

  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  
  const [dataRetirada, setDataRetirada] = useState("");
  const [horarioRetirada, setHorarioRetirada] = useState("");
  
  const [dataDevolucao, setDataDevolucao] = useState("");
  const [horarioDevolucao, setHorarioDevolucao] = useState("");

  const [valor, setValor] = useState(""); 
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
    quantidade?: number;
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
        
        const disponiveis = data.filter((m: Material) => 
            m.status === 'disponivel' && (m.quantidade === undefined || m.quantidade > 0)
        );
        
        setMateriaisDisponiveis(disponiveis);
      } catch (error) {
        console.error("Erro ao carregar materiais:", error);
        toast({ title: "Erro", description: "Falha ao carregar estoque.", variant: "destructive" });
      } finally {
        setLoadingMateriais(false);
      }
    };

    fetchMateriais();
  }, [toast]);

  const materiaisPorCategoria = useMemo(() => {
    const grupos: Record<string, Material[]> = {};
    materiaisDisponiveis.forEach(mat => {
        const cat = mat.categoria || "Sem Categoria";
        if (!grupos[cat]) grupos[cat] = [];
        grupos[cat].push(mat);
    });
    return grupos;
  }, [materiaisDisponiveis]);

  const addMaterial = (materialNome: string) => {
    if (!selectedMaterials.includes(materialNome)) {
      setSelectedMaterials([...selectedMaterials, materialNome]);
    }
  };

  const removeMaterial = (materialNome: string) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m !== materialNome));
  };

  const handleSave = async () => {
    // ✅ CORREÇÃO: Status fixo "ativo" (Em Andamento) na criação
    const statusInicial = "ativo"; 

    const novo = {
      cliente, telefone, endereco,
      dataRetirada, horarioRetirada, 
      dataDevolucao, horarioDevolucao,
      materiais: selectedMaterials,
      valor: valor ? Number(valor) : 0, 
      pagamento, observacoes,
      status: statusInicial, // Sempre começa como ativo
    };

    try {
      const response = await axios.post("/rentals", novo);

      // ✅ ATUALIZAÇÃO DE ESTOQUE
      // Como o status inicial é sempre "ativo", SEMPRE desconta do estoque aqui.
      selectedMaterials.forEach(async (nomeMat) => {
          const matOriginal = materiaisDisponiveis.find(m => m.nome === nomeMat);
          if (matOriginal && matOriginal.quantidade && matOriginal.quantidade > 0) {
              await axios.put(`/materiais/${matOriginal._id}`, {
                  ...matOriginal,
                  quantidade: matOriginal.quantidade - 1
              });
          }
      });

      toast({ title: "Aluguel criado!", description: `Cliente: ${response.data.rental.cliente}` });

      const msg = `Aluguel ${cliente} criado. Retirada: ${dataRetirada} ${horarioRetirada}.`;
      addNotification("Novo Aluguel", msg);

      onSave();

      setCliente(""); setTelefone(""); setEndereco("");
      setDataRetirada(""); setHorarioRetirada("");
      setDataDevolucao(""); setHorarioDevolucao("");
      setValor(""); 
      setPagamento(""); setObservacoes("");
      setSelectedMaterials([]);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
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
              <Label htmlFor="cliente">Nome do Cliente *</Label>
              <Input id="cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={telefone} onChange={(e) => setTelefone(formatPhoneNumber(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2"><Label>Data Retirada</Label><Input type="date" value={dataRetirada} onChange={(e) => setDataRetirada(e.target.value)} /></div>
              <div className="space-y-2"><Label>Hora Retirada</Label><Input type="time" value={horarioRetirada} onChange={(e) => setHorarioRetirada(e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2"><Label>Data Devolução</Label><Input type="date" value={dataDevolucao} onChange={(e) => setDataDevolucao(e.target.value)} /></div>
              <div className="space-y-2"><Label>Hora Devolução</Label><Input type="time" value={horarioDevolucao} onChange={(e) => setHorarioDevolucao(e.target.value)} /></div>
            </div>
          </div>

        <div className="space-y-2">
            <Label>Materiais Disponíveis</Label> 
            <div className="flex flex-col gap-4 p-4 border rounded-md min-h-[40px] bg-gray-50/20">
              {loadingMateriais ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : (
                Object.keys(materiaisPorCategoria).length > 0 ? (
                    Object.keys(materiaisPorCategoria).map(categoria => (
                        <div key={categoria} className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-300 pb-1">
                                {categoria}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {materiaisPorCategoria[categoria].map((material) => (
                                    <Badge
                                        key={material._id} 
                                        variant={selectedMaterials.includes(material.nome) ? "default" : "secondary"}
                                        className="cursor-pointer transition-colors hover:bg-indigo-500 hover:text-white"
                                        onClick={() => addMaterial(material.nome)} 
                                    >
                                        {material.nome}
                                        <span className="ml-2 text-[10px] opacity-60 bg-black/10 px-1 rounded-full">{material.quantidade}</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">Nenhum material disponível (Estoque Esgotado).</p>
                )
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
                value={valor} 
                onChange={(e) => setValor(e.target.value)} 
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Pagamento</Label>
              <Select value={pagamento} onValueChange={setPagamento}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2"><Label>Observações</Label><Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} /></div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline">Cancelar</Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700"><Save className="mr-2 h-4 w-4"/> Salvar Aluguel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};