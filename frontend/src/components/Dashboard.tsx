import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, Eye, Calendar } from "lucide-react";

export const Dashboard = () => {
  const dashboardStats = [
    {
      title: "Aluguéis Ativos",
      value: "24",
      icon: Calendar,
      color: "info",
    },
    {
      title: "Em Atraso",
      value: "3",
      icon: AlertTriangle,
      color: "destructive",
    },
    {
      title: "Em Dia",
      value: "21",
      icon: CheckCircle,
      color: "success",
    },
    {
      title: "Pagamentos Pendentes",
      value: "7",
      icon: Clock,
      color: "warning",
    },
  ];

  const recentRentals = [
    {
      id: "ALG-001",
      cliente: "Construção ABC Ltda",
      materiais: ["Betoneira", "Andaime"],
      dataRetirada: "2024-08-01",
      dataDevolucao: "2024-08-05",
      status: "ativo",
      pagamento: "pago",
    },
    {
      id: "ALG-002", 
      cliente: "Obras Silva & Cia",
      materiais: ["Furadeira", "Martelete"],
      dataRetirada: "2024-07-30",
      dataDevolucao: "2024-08-03",
      status: "atrasado",
      pagamento: "pendente",
    },
    {
      id: "ALG-003",
      cliente: "Reformas JK",
      materiais: ["Compressor", "Pistola"],
      dataRetirada: "2024-08-02",
      dataDevolucao: "2024-08-06",
      status: "ativo",
      pagamento: "pago",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge variant="secondary" className="bg-info/10 text-info">Em Andamento</Badge>;
      case "atrasado":
        return <Badge variant="destructive">Atrasado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (pagamento: string) => {
    switch (pagamento) {
      case "pago":
        return <Badge className="bg-success text-success-foreground">Pago</Badge>;
      case "pendente":
        return <Badge className="bg-warning text-warning-foreground">Pendente</Badge>;
      default:
        return <Badge variant="outline">{pagamento}</Badge>;
    }
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
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
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
                  <p className="text-sm text-muted-foreground mb-1">{rental.cliente}</p>
                  <p className="text-sm">
                    Materiais: {rental.materiais.join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Retirada: {new Date(rental.dataRetirada).toLocaleDateString()} | 
                    Devolução: {new Date(rental.dataDevolucao).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};