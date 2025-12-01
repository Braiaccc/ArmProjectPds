import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, Eye, Calendar } from "lucide-react";
import { RentalModal } from "./RentalModal";
import { useEffect, useState } from "react";
import axios from "axios";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    active: 0,
    late: 0,
    onTime: 0,
    pendingPayment: 0,
  });

  const [recentRentals, setRecentRentals] = useState<any[]>([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get("/rentals/stats/dashboard");
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      }
    };

    const fetchRecentRentals = async () => {
      try {
        const response = await axios.get("/rentals/recent");
        if (Array.isArray(response.data)) {
            setRecentRentals(response.data);
        } else {
            setRecentRentals([]);
        }
      } catch (error) {
        console.error("Erro ao buscar aluguéis recentes:", error);
        setRecentRentals([]);
      }
    };

    fetchDashboardStats();
    fetchRecentRentals();
  }, []);

  const dashboardStats = [
    { title: "Em Dia", value: stats.onTime, icon: CheckCircle },
    { title: "Pagamentos Pendentes", value: stats.pendingPayment, icon: Clock },
    { title: "Ativos", value: stats.active, icon: Calendar }, 
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Em Andamento</Badge>;
      case "atrasado":
        return <Badge variant="destructive">Atrasado</Badge>;
      case "concluido":
        return <Badge className="bg-gray-500">Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (pagamento: string) => {
    switch (pagamento) {
      case "pago":
        return <Badge className="bg-green-500 hover:bg-green-600">Pago</Badge>;
      case "pendente":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendente</Badge>;
      case "parcial":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Parcial</Badge>;
      default:
        return <Badge variant="outline">{pagamento}</Badge>;
    }
  };

  const handleEditRental = (rental: any) => {
    setSelectedRental(rental);
    setModalOpen(true);
  };

  const handleSaveRental = (updatedRental: any) => {
    setSelectedRental(updatedRental);
    setRecentRentals(prev => prev.map(r => r._id === updatedRental._id ? updatedRental : r));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aluguéis Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(recentRentals) && recentRentals.length > 0 ? (
              recentRentals.map((rental) => (
                <div
                  key={rental._id || rental.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(rental.status)}
                      {getPaymentBadge(rental.pagamento)}
                    </div>
                    <p className="font-semibold text-lg">
                      {rental.cliente} 
                      {rental.telefone && <span className="text-sm font-normal text-muted-foreground ml-2">({rental.telefone})</span>}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      Materiais: {Array.isArray(rental.materiais) ? rental.materiais.join(", ") : rental.materiais}
                    </p>
                    
                    {rental.observacoes && (
                        <p className="text-xs text-gray-600 mb-1 italic">
                            Obs: {rental.observacoes}
                        </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                     
                      Retirada: {formatDate(rental.dataRetirada)} {rental.horarioRetirada ? `às ${rental.horarioRetirada}` : ''} |
                      Devolução: {formatDate(rental.dataDevolucao)} {rental.horarioDevolucao ? `às ${rental.horarioDevolucao}` : ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRental(rental)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                    {recentRentals === null ? "Carregando..." : "Nenhum aluguel recente encontrado."}
                </p>
            )}
          </div>
        </CardContent>
      </Card>

      <RentalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        rental={selectedRental}
        onSave={handleSaveRental}
        onDelete={(id: string) => setRecentRentals(prev => prev.filter(r => r._id !== id))}
      />
    </div>
  );
};