import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, Eye, Calendar } from "lucide-react";
import { RentalModal } from "./RentalModal";

import { useEffect, useState } from "react";

export const Dashboard = () => {
  const [stats, setStats] = useState({
    active: 0,
    late: 0,
    onTime: 0,
    pendingPayment: 0,
  });

  const [recentRentals, setRecentRentals] = useState([]);

  useEffect(() => {
    // 1) Busca estatísticas do Dashboard
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/rentals/stats/dashboard"
        );
        const result = await response.json();
        setStats(result);
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      }
    };

    // 2) Busca aluguéis recentes
    const fetchRecentRentals = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/rentals/recent"
        );
        const result = await response.json();
        setRecentRentals(result);
      } catch (error) {
        console.error("Erro ao buscar aluguéis recentes:", error);
      }
    };

    fetchDashboardStats();
    fetchRecentRentals();
  }, []);

  const dashboardStats = [
    // foi retirado status "Ativos" e "Atrasados" do dashboard conforme solicitado

    { title: "Em Dia", value: stats.onTime, icon: CheckCircle },
    { title: "Pagamentos Pendentes", value: stats.pendingPayment, icon: Clock },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return (
          <Badge variant="secondary" className="bg-info/10 text-info">
            Em Andamento
          </Badge>
        );
      case "atrasado":
        return <Badge variant="destructive">Atrasado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (pagamento: string) => {
    switch (pagamento) {
      case "pago":
        return (
          <Badge className="bg-success text-success-foreground">Pago</Badge>
        );
      case "pendente":
        return (
          <Badge className="bg-warning text-warning-foreground">Pendente</Badge>
        );
      case "parcial":
        return <Badge className="bg-info text-info-foreground">Parcial</Badge>;
      default:
        return <Badge variant="outline">{pagamento}</Badge>;
    }
  };

  const [selectedRental, setSelectedRental] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEditRental = (rental) => {
    setSelectedRental(rental);
    setModalOpen(true);
  };

  const handleSaveRental = (updatedRental) => {
    setSelectedRental(updatedRental);
    // Atualizar a lista sem recarregar
    setRecentRentals(recentRentals.map(r => r._id === updatedRental._id ? updatedRental : r));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
    let d;
    if (m) {
      const yyyy = Number(m[1]);
      const mm = Number(m[2]);
      const dd = Number(m[3]);
      d = new Date(yyyy, mm - 1, dd);
    } else {
      d = new Date(dateStr);
    }
    if (!d || isNaN(d.getTime())) return String(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Cards de status */}
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

      {/* Alugueis recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Aluguéis Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentRentals.map((rental) => (
              <div
                key={rental.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{rental.id}</span>
                    {getStatusBadge(rental.status)}
                    {getPaymentBadge(rental.pagamento)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {rental.cliente}
                  </p>
                  <p className="text-sm">
                    Materiais: {rental.materiais.join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Retirada: {formatDate(rental.dataRetirada)} |
                    Devolução: {formatDate(rental.dataDevolucao)}
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
            ))}
          </div>
        </CardContent>
      </Card>

      <RentalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        rental={selectedRental}
        onSave={handleSaveRental}
      />
    </div>
  );
};
