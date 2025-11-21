import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Adicionei 'onDelete' nas propriedades recebidas
export const RentalModal = ({ open, onClose, rental, onSave, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  if (!rental) return null;

  // Normalize a date string into YYYY-MM-DD for <input type="date" />
  const toDateInput = (dateStr) => {
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

  const handleChange = (field, value) => {
    onSave({ ...rental, [field]: value });
  };

  const updateRental = async () => {
    try {
      setLoading(true);
      setError("");

      const rentalId = rental._id || rental.id;

      // Cria uma cópia e remove IDs para envio
      const rentalToUpdate = { ...rental };
      delete rentalToUpdate._id;
      delete rentalToUpdate.id;

      const response = await fetch(
        `http://localhost:5000/api/rentals/${rentalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rentalToUpdate),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar aluguel");
      }

      toast({
        title: "Aluguel Alterado!",
        description: "As alterações foram salvas com sucesso.",
      });

      // Atualiza o estado no pai
      onSave(rental);

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
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

      const response = await fetch(
        `http://localhost:5000/api/rentals/${rentalId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir aluguel");
      }

      toast({
        title: "Aluguel excluído",
        description: "O aluguel foi removido com sucesso.",
      });

      // --- CORREÇÃO AQUI ---
      // Em vez de onSave(null), chamamos onDelete passando o ID
      if (onDelete) {
        onDelete(rentalId);
      }

      // Fecha o modal imediatamente
      onClose();
      
    } catch (err) {
      setError(err.message || "Erro ao excluir");
      console.error("Erro ao excluir:", err);
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
          <div>
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              value={rental.id || rental._id || ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="cliente">Cliente</Label>
            <Input
              id="cliente"
              value={rental.cliente || ""}
              onChange={(e) => handleChange("cliente", e.target.value)}
              placeholder="Nome do cliente"
            />
          </div>

          <div>
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              value={rental.valor || ""}
              type="number"
              onChange={(e) => handleChange("valor", Number(e.target.value))}
              placeholder="Valor"
            />
          </div>

          <div>
            <Label htmlFor="materiais">Materiais</Label>
            <Input
              id="materiais"
              value={
                Array.isArray(rental.materiais)
                  ? rental.materiais.join(", ")
                  : rental.materiais || ""
              }
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="dataRetirada">Data de Retirada</Label>
            <Input
              id="dataRetirada"
              type="date"
              value={toDateInput(rental.dataRetirada)}
              onChange={(e) => handleChange("dataRetirada", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="dataDevolucao">Data de Devolução</Label>
            <Input
              id="dataDevolucao"
              type="date"
              value={toDateInput(rental.dataDevolucao)}
              onChange={(e) => handleChange("dataDevolucao", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={rental.status || "ativo"}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Em Andamento</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pagamento">Status de Pagamento</Label>
            <Select
              value={rental.pagamento || "pendente"}
              onValueChange={(value) => handleChange("pagamento", value)}
            >
              <SelectTrigger id="pagamento">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 mt-2 border-t">
          <Button
            variant="destructive"
            onClick={deleteRental}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            Excluir
          </Button>

          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline">
              Cancelar
            </Button>

            <Button
              onClick={updateRental}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};