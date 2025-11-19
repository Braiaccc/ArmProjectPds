import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

export const RentalModal = ({ open, onClose, rental, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  if (!rental) return null;

  // Normalize a date string into YYYY-MM-DD for <input type="date" />
  const toDateInput = (dateStr) => {
    if (!dateStr) return "";
    // If already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Try to extract from ISO-like strings
    const m = String(dateStr).match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    // Fallback: try Date and build local date components
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
      
      // Remove os IDs antes de enviar
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

      // Mostrar notificação de sucesso
      toast({
        title: "Aluguel Alterado!",
        description: "As alterações foram salvas com sucesso.",
      });

      // Atualizar o estado imediatamente
      onSave(rental);

      // Fechar o modal
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar alterações");
      console.error("Erro ao atualizar:", err);
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
              value={Array.isArray(rental.materiais) ? rental.materiais.join(", ") : rental.materiais || ""}
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

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
          <Button 
            onClick={updateRental} 
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


