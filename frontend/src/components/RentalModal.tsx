import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export const RentalModal = ({ open, onClose, rental, onSave, onDelete }: any) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // ✅ Estado para guardar como o aluguel estava ANTES de editar
  const [initialStatus, setInitialStatus] = useState(""); 
  
  const { toast } = useToast();

  // ✅ CORREÇÃO CRÍTICA:
  // Só atualiza o initialStatus quando o modal ABRE (open muda para true).
  // Removemos 'rental' das dependências para ele não atualizar enquanto você edita.
  useEffect(() => {
    if (open && rental) {
        setInitialStatus(rental.status || "ativo");
    }
  }, [open]); 

  if (!rental) return null;

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

  const toDateInput = (dateStr: string) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const m = String(dateStr).match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleChange = (field: string, value: any) => {
    onSave({ ...rental, [field]: value });
  };

  const updateRental = async () => {
    try {
      setLoading(true);
      setError("");

      const rentalId = rental._id || rental.id;
      const rentalToUpdate = { ...rental };
      
      // Limpeza de campos técnicos
      delete rentalToUpdate._id;
      delete rentalToUpdate.id;

      // 1. Atualiza os dados do aluguel primeiro
      await axios.put(`/rentals/${rentalId}`, rentalToUpdate);

      // ✅ LÓGICA DE DEVOLUÇÃO AO ESTOQUE
      // Verifica se mudou para "concluido" E se antes NÃO estava "concluido"
      if (rental.status === "concluido" && initialStatus !== "concluido") {
        
        // Busca estoque atualizado para não errar a conta
        const responseMat = await axios.get("/materiais");
        const allMaterials = responseMat.data;

        const materialsToReturn = Array.isArray(rental.materiais) ? rental.materiais : [];
        
        // Cria uma lista de promessas para atualizar cada material
        const updatePromises = materialsToReturn.map((nomeMat: string) => {
            // Acha o material pelo nome
            const matEncontrado = allMaterials.find((m: any) => m.nome === nomeMat);
            
            if (matEncontrado) {
                // Devolve +1 ao estoque
                const novaQtd = (matEncontrado.quantidade || 0) + 1;
                
                // Chama a API de materiais para salvar o novo estoque
                return axios.put(`/materiais/${matEncontrado._id}`, {
                    ...matEncontrado,
                    quantidade: novaQtd
                });
            }
        });

        // Aguarda todas as atualizações de estoque terminarem
        await Promise.all(updatePromises);
        
        toast({ 
            title: "Estoque atualizado!", 
            description: `${materialsToReturn.length} itens devolvidos ao estoque.`,
            className: "bg-green-100 border-green-500 text-green-900"
        });
      }

      toast({
        title: "Aluguel Alterado!",
        description: "As alterações foram salvas com sucesso.",
      });

      onSave(rental);
      setTimeout(() => onClose(), 500);

    } catch (err: any) {
      setError(err.message || "Erro ao salvar alterações");
      console.error("Erro ao atualizar:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRental = async () => {
    if (!confirm("Tem certeza que deseja excluir este aluguel?")) return;

    try {
      setLoading(true);
      setError("");
      const rentalId = rental._id || rental.id;
      await axios.delete(`/rentals/${rentalId}`);
      toast({ title: "Aluguel excluído", description: "Removido com sucesso." });
      if (onDelete) onDelete(rentalId);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao excluir");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Aluguel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div><Label htmlFor="id">ID</Label><Input id="id" value={rental.id || rental._id || ""} disabled className="bg-muted" /></div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label>Cliente</Label><Input value={rental.cliente || ""} onChange={(e) => handleChange("cliente", e.target.value)} /></div>
            <div><Label>Telefone</Label><Input value={rental.telefone || ""} onChange={(e) => handleChange("telefone", formatPhoneNumber(e.target.value))} maxLength={15} /></div>
          </div>

          <div><Label>Valor</Label><Input value={rental.valor || ""} type="number" onChange={(e) => handleChange("valor", Number(e.target.value))} /></div>
          
          {/* Materiais são apenas leitura na edição para evitar conflitos complexos de estoque */}
          <div><Label>Materiais</Label><Input value={Array.isArray(rental.materiais) ? rental.materiais.join(", ") : rental.materiais || ""} disabled className="bg-muted" /></div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Data Retirada</Label><Input type="date" value={toDateInput(rental.dataRetirada)} onChange={(e) => handleChange("dataRetirada", e.target.value)} /></div>
            <div className="space-y-1"><Label>Hora Retirada</Label><Input type="time" value={rental.horarioRetirada || ""} onChange={(e) => handleChange("horarioRetirada", e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Data Devolução</Label><Input type="date" value={toDateInput(rental.dataDevolucao)} onChange={(e) => handleChange("dataDevolucao", e.target.value)} /></div>
            <div className="space-y-1"><Label>Hora Devolução</Label><Input type="time" value={rental.horarioDevolucao || ""} onChange={(e) => handleChange("horarioDevolucao", e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label>Status</Label>
                <Select value={rental.status || "ativo"} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="ativo">Em Andamento</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Pagamento</Label>
                <Select value={rental.pagamento || "pendente"} onValueChange={(value) => handleChange("pagamento", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                </SelectContent>
                </Select>
            </div>
          </div>

          <div><Label>Observações</Label><Textarea value={rental.observacoes || ""} onChange={(e) => handleChange("observacoes", e.target.value)} /></div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">{error}</div>}

        <div className="flex justify-between items-center pt-4 mt-2 border-t">
          <Button variant="destructive" onClick={deleteRental} disabled={loading} className="bg-red-600 hover:bg-red-700">Excluir</Button>
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline">Cancelar</Button>
            <Button onClick={updateRental} disabled={loading} className="bg-blue-500 hover:bg-blue-600">{loading ? "Salvando..." : "Salvar"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};