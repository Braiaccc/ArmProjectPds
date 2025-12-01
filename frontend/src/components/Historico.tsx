import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Calendar, FilterX, DollarSign } from "lucide-react"; 
import { RentalModal } from "./RentalModal";
import axios from "axios";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const Historico = ({ rentalAdded }: { rentalAdded: number }) => {
  const [alugueis, setAlugueis] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [monthFilter, setMonthFilter] = useState("todos");
  const [yearFilter, setYearFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchRentals = async () => {
    try {
      const response = await axios.get("/rentals");

      const sortedData = response.data.sort((a: any, b: any) => {
        const dateA = new Date(a.dataRetirada).getTime();
        const dateB = new Date(b.dataRetirada).getTime();
        return dateB - dateA;
      });

      setAlugueis(sortedData);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableYears = useMemo(() => {
    const years = new Set(alugueis.map(item => new Date(item.dataRetirada).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [alugueis]);

  const handleEditRental = (rental: any) => {
    setSelectedRental(rental);
    setModalOpen(true);
  };

  const handleSaveRental = (updatedRental: any) => {
    if (!updatedRental || !updatedRental._id) return;

    setSelectedRental(updatedRental);
    setAlugueis(prevAlugueis => {
        const newList = prevAlugueis.map(r => r._id === updatedRental._id ? updatedRental : r);
        return newList.sort((a: any, b: any) => {
            const dateA = new Date(a.dataRetirada).getTime();
            const dateB = new Date(b.dataRetirada).getTime();
            return dateB - dateA;
        });
    });
  };

  const handleDeleteRental = (deletedId: string) => {
    setAlugueis(prev => prev.filter(item => item._id !== deletedId));
    setModalOpen(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
        return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR');
  };

  const getPaymentBadge = (pagamento: string) => {
    switch (pagamento) {
      case "pago":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Pago</Badge>;
      case "pendente":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Pendente</Badge>;
      case "parcial":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Parcial</Badge>;
      default:
        return <Badge variant="outline">{pagamento}</Badge>;
    }
  };

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

  useEffect(() => {
    fetchRentals();
  }, [rentalAdded]);

  const filteredHistorico = alugueis.filter(item => {
    const matchesSearch = item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item._id && item._id.toLowerCase().includes(searchTerm.toLowerCase())); 
    
    const matchesPayment = statusFilter === "todos" || item.pagamento === statusFilter;

    const d = new Date(item.dataRetirada);
    const itemYear = d.getFullYear().toString();
    const itemMonth = d.getMonth().toString(); 

    const matchesYear = yearFilter === "todos" || itemYear === yearFilter;
    const matchesMonth = monthFilter === "todos" || itemMonth === monthFilter;

    return matchesSearch && matchesPayment && matchesYear && matchesMonth;
  });

  const totalValorGeral = filteredHistorico.reduce((sum, item) => sum + item.valor, 0);

  const groupedRentals = useMemo(() => {
    const groups: any[] = [];
    
    filteredHistorico.forEach(rental => {
      const [ano, mes] = rental.dataRetirada.split('-'); 
      const monthIndex = parseInt(mes) - 1;
      
      const monthName = MESES[monthIndex] || MESES[0];
      const year = parseInt(ano);
      const groupTitle = `${monthName} ${year}`;

      let lastGroup = groups[groups.length - 1];
      
      if (!lastGroup || lastGroup.title !== groupTitle) {
        lastGroup = {
          title: groupTitle,
          rentals: [],
          subtotal: 0
        };
        groups.push(lastGroup);
      }

      lastGroup.rentals.push(rental);
      lastGroup.subtotal += rental.valor;
    });

    return groups;
  }, [filteredHistorico]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("todos");
    setMonthFilter("todos");
    setYearFilter("todos");
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <Card className="rounded-xl shadow-lg border-0 ring-1 ring-gray-200">
        <CardHeader className="bg-gray-50/50 rounded-t-xl border-b pb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
              <Calendar className="h-6 w-6 text-indigo-600" />
              Histórico de Aluguéis
            </CardTitle>
            
            {(searchTerm || statusFilter !== "todos" || monthFilter !== "todos" || yearFilter !== "todos") && (
               <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                 <FilterX className="w-4 h-4 mr-2"/> Limpar Filtros
               </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg bg-white"
            />
            
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Meses</SelectItem>
                {MESES.map((mes, index) => (
                  <SelectItem key={index} value={String(index)}>{mes}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Anos</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Financeiro" /> 
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Pagamentos</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-6 bg-gray-50/30 min-h-[400px]">
          <div className="space-y-8">
            {groupedRentals.length > 0 ? (
              groupedRentals.map((group, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2 mt-2">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      {group.title}
                    </h3>
                    <span className="text-sm font-medium text-gray-500">
                      Subtotal: <span className="text-green-600 font-bold">R$ {group.subtotal.toFixed(2)}</span>
                    </span>
                  </div>

                  <div className="grid gap-3">
                    {group.rentals.map((item: any) => (
                      <div key={item._id || item.id} className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all hover:border-indigo-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-lg">{item.cliente}</span>
                            {item.telefone && <span className="text-sm text-gray-500">({item.telefone})</span>}
                            {getStatusBadge(item.status)}
                            {getPaymentBadge(item.pagamento)}
                          </div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Materiais:</span> {Array.isArray(item.materiais) ? item.materiais.join(", ") : item.materiais}
                          </p>

                         {item.observacoes && (
                        <p className="text-xs text-gray-600 mb-1 italic">
                            Obs: {item.observacoes}
                        </p>
                    )}
                        </div>

                        <div className="flex flex-col md:items-end gap-1 text-sm">
                            <div className="text-gray-600 bg-gray-50 px-2 py-1 rounded text-xs md:text-sm">
                                {formatDate(item.dataRetirada)} {item.horarioRetirada ? `às ${item.horarioRetirada}` : ''} até {formatDate(item.dataDevolucao)} {item.horarioDevolucao ? `às ${item.horarioDevolucao}` : ''}
                            </div>
                            <div className="font-bold text-lg text-green-600">
                                R$ {item.valor.toFixed(2)}
                            </div>
                            <Button size="sm" variant="ghost" className="h-8 text-indigo-600 hover:text-indigo-700 p-0 justify-start md:justify-end" onClick={() => handleEditRental(item)}>
                              <Eye className="h-4 w-4 mr-1" /> Detalhes
                            </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <DollarSign className="h-12 w-12 mb-2 opacity-20" />
                <p>Nenhum aluguel encontrado com os filtros atuais.</p>
              </div>
            )}
          </div>
        </CardContent>

        <CardContent className="bg-white border-t rounded-b-xl py-6 px-8">
          <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Total acumulado na visualização:</span>
              <span className="text-2xl font-bold text-green-600">R$ {totalValorGeral.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <RentalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        rental={selectedRental}
        onSave={handleSaveRental}
        onDelete={handleDeleteRental} 
      />
    </div>
  );
};