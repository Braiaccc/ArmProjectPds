import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Calendar } from "lucide-react";

export const Historico = ({ rentalAdded }) => {
  const [alugueis, setAlugueis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [loading, setLoading] = useState(true);

  // UseEffect para buscar os dados da API quando o componente for montado ou quando um novo aluguel for adicionado
  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/rentals");
        if (!response.ok) {
          throw new Error('Falha ao buscar os aluguéis.');
        }
        const data = await response.json();
        setAlugueis(data);
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, [rentalAdded]); // Adicionado rentalAdded como dependência

  const filteredHistorico = alugueis.filter(item => {
    const matchesSearch = item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item._id && item._id.toLowerCase().includes(searchTerm.toLowerCase())); // MongoDB usa _id
    const matchesStatus = statusFilter === "todos" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValor = filteredHistorico.reduce((sum, item) => sum + item.valor, 0);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card className="rounded-xl shadow-lg">
        <CardHeader className="bg-gray-50/50 rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <Calendar className="h-6 w-6 text-indigo-600" />
            Histórico de Aluguéis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <Input
              placeholder="Buscar por cliente ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-auto flex-1 rounded-lg"
            />
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            {filteredHistorico.length > 0 ? (
              filteredHistorico.map((item) => (
                <div key={item._id} className="p-4 border border-gray-200 rounded-lg shadow-sm transition-transform transform hover:scale-[1.01] hover:shadow-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg">{item.cliente}</span>
                    <Badge variant="outline" className="text-gray-600">{`ID: ${item._id}`}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <p>Materiais: <span className="font-medium">{item.materiais.join(", ")}</span></p>
                    <p>Período: <span className="font-medium">{item.dataRetirada} - {item.dataDevolucao}</span></p>
                    <p>Valor: <span className="font-medium text-green-600">R$ {item.valor.toFixed(2)}</span></p>
                    <p>Status: <span className={`font-medium ${item.status === "concluido" ? "text-green-500" : "text-yellow-500"}`}>{item.status}</span></p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700">
                      <Eye className="h-4 w-4 mr-1" /> Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Nenhum aluguel encontrado.</p>
            )}
          </div>
        </CardContent>
        <CardContent className="bg-gray-50/50 rounded-b-xl py-4 px-6 mt-6">
          <p className="font-bold text-lg text-gray-800">
            Valor Total: <span className="text-green-600">R$ {totalValor.toFixed(2)}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
