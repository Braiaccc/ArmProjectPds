import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Package, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Material {
  _id: string;
  nome: string;
  categoria: string;
  codSerie: string;
  observacoes: string;
  status: "disponivel" | "alugado" | "manutencao";
  quantidade: number;
}

interface FormData {
  nome: string;
  categoria: string;
  novaCategoria: string;
  codSerie: string;
  observacoes: string;
  status: "disponivel" | "alugado" | "manutencao";
  quantidade: string; // ✅ Alterado para string para evitar bug do "0" preso
}

export const CadastroMateriais: React.FC = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [materiais, setMateriais] = useState<Material[]>([]);
  
  const [categoriasExistentes, setCategoriasExistentes] = useState<string[]>([]);
  const [usarNovaCategoria, setUsarNovaCategoria] = useState(false);

  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  
  // ✅ Inicializa quantidade como string vazia (campo limpo)
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    categoria: "",
    novaCategoria: "",
    codSerie: "",
    observacoes: "",
    status: "disponivel",
    quantidade: "", 
  });

  const fetchMateriais = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/materiais");
      setMateriais(response.data);

      const cats = Array.from(new Set(response.data.map((m: Material) => m.categoria))).filter(Boolean) as string[];
      setCategoriasExistentes(cats);
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
      toast({ title: "Erro", description: "Falha ao carregar.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateriais();
  }, []);

  // ✅ Função genérica funciona para tudo agora
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    const categoriaFinal = usarNovaCategoria ? formData.novaCategoria : formData.categoria;

    if (!formData.nome.trim()) {
      toast({ title: "Erro", description: "Nome obrigatório.", variant: "destructive" });
      return;
    }
    if (!categoriaFinal || !categoriaFinal.trim()) {
        toast({ title: "Erro", description: "Categoria obrigatória.", variant: "destructive" });
        return;
    }

    const materialPayload = {
      ...formData,
      categoria: categoriaFinal,
      // ✅ Converte para número ao salvar (vazio vira 0)
      quantidade: formData.quantidade ? Number(formData.quantidade) : 0,
    };
    delete (materialPayload as any).novaCategoria;

    try {
      if (editingMaterial) {
        await axios.put(`/materiais/${editingMaterial._id}`, materialPayload);
        toast({ title: "Sucesso", description: "Material atualizado!" });
      } else {
        await axios.post("/materiais", materialPayload);
        toast({ title: "Sucesso", description: "Material criado!" });
      }
      
      fetchMateriais();
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir material?")) return;
    try {
      await axios.delete(`/materiais/${id}`);
      fetchMateriais();
      toast({ title: "Excluído", description: "Material removido." });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      nome: material.nome,
      categoria: material.categoria,
      novaCategoria: "",
      codSerie: material.codSerie,
      observacoes: material.observacoes,
      status: material.status,
      // ✅ Converte número para string ao editar
      quantidade: material.quantidade !== undefined ? material.quantidade.toString() : "0",
    });
    setUsarNovaCategoria(false);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingMaterial(null);
    setFormData({
      nome: "",
      categoria: "",
      novaCategoria: "",
      codSerie: "",
      observacoes: "",
      status: "disponivel",
      quantidade: "", // Reseta para vazio
    });
    setUsarNovaCategoria(false);
    setShowForm(false);
  };

  const filteredMateriais = materiais.filter((item) => {
    return item.nome?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disponivel": return <Badge className="bg-green-500 hover:bg-green-600">Disponível</Badge>;
      case "alugado": return <Badge className="bg-yellow-500 hover:bg-yellow-600">Alugado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <div className="p-6 text-center">Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Cadastro de Materiais</h2>
          <p className="text-muted-foreground">Gerencie o estoque e categorias</p>
        </div>
        <Button onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
          {showForm ? <X className="mr-2 h-4 w-4"/> : <Plus className="mr-2 h-4 w-4"/>}
          {showForm ? "Cancelar" : "Novo Material"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingMaterial ? "Editar" : "Novo"} Material</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Material *</Label>
                  <Input id="nome" value={formData.nome} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  {usarNovaCategoria ? (
                      <div className="flex gap-2">
                          <Input id="novaCategoria" placeholder="Nova categoria..." value={formData.novaCategoria} onChange={handleInputChange} autoFocus />
                          <Button type="button" variant="ghost" onClick={() => setUsarNovaCategoria(false)}>Cancelar</Button>
                      </div>
                  ) : (
                      <div className="flex gap-2">
                          <Select value={formData.categoria} onValueChange={(val) => setFormData(prev => ({...prev, categoria: val}))}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {categoriasExistentes.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="outline" onClick={() => setUsarNovaCategoria(true)}><Plus className="h-4 w-4"/></Button>
                      </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade em Estoque</Label>
                  <Input 
                    type="number" 
                    id="quantidade" 
                    // ✅ Agora usa handleInputChange normal, tratando como string
                    value={formData.quantidade} 
                    onChange={handleInputChange} 
                    min="0" 
                    placeholder="0"
                  />
                </div>
                {/* Removido Valor Diário daqui visualmente no form também, se não for usar, ou mantendo oculto */}
              <div className="space-y-2"><Label>Código/Série</Label><Input id="codSerie" value={formData.codSerie} onChange={handleInputChange} /></div>
              </div>

              <div className="space-y-2"><Label>Observações</Label><Textarea id="observacoes" value={formData.observacoes} onChange={handleInputChange} /></div>

              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button type="submit"><Save className="mr-2 h-4 w-4"/> Salvar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
            <div className="p-4 border-b">
                <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="divide-y">
                {filteredMateriais.map(item => (
                    <div key={item._id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                        <div>
                            <div className="font-semibold text-lg">{item.nome}</div>
                            <div className="text-sm text-gray-500 flex gap-2 items-center mt-1">
                                <Badge variant="outline">{item.categoria}</Badge>
                                {/* Exibe quantidade */}
                                <Badge className={item.quantidade > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                    Estoque: {item.quantidade}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(item._id)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
};