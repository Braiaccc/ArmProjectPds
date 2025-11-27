import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios"; // ✅ Usando Axios

interface Material {
  _id: string;
  nome: string;
  categoria: string;
  valorDiario: number;
  codSerie: string;
  observacoes: string;
  status: "disponivel" | "alugado" | "manutencao";
}

interface FormData {
  nome: string;
  categoria: string;
  valorDiario: string;
  codSerie: string;
  observacoes: string;
  status: "disponivel" | "alugado" | "manutencao";
}

export const CadastroMateriais: React.FC = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    categoria: "",
    valorDiario: "0",
    codSerie: "",
    observacoes: "",
    status: "disponivel",
  });

  const fetchMateriais = async () => {
    try {
      setLoading(true);
      // ✅ Substituído fetch por axios.get
      const response = await axios.get("/materiais");
      setMateriais(response.data);
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar os materiais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateriais();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast({
        title: "Campo Obrigatório",
        description: "O nome do material é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    const materialPayload = {
      ...formData,
      valorDiario: Number(formData.valorDiario) || 0,
    };

    try {
      if (editingMaterial) {
        // ✅ Axios PUT
        await axios.put(`/materiais/${editingMaterial._id}`, materialPayload);
        
        setMateriais(materiais.map(m => m._id === editingMaterial._id ? { ...editingMaterial, ...materialPayload } : m));
        toast({
          title: "Material Alterado!",
          description: `Material ${formData.nome} atualizado com sucesso!`,
        });
      } else {
        // ✅ Axios POST
        await axios.post("/materiais", materialPayload);
        
        fetchMateriais(); // Recarrega para pegar o ID gerado
        toast({
          title: "Sucesso!",
          description: `Material ${formData.nome} criado com sucesso!`,
        });
      }

      resetForm();
    } catch (error) {
      console.error("Falha ao salvar o material:", error);
      toast({
        title: "Erro",
        description: `Não foi possível ${editingMaterial ? "atualizar" : "salvar"} o material.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este material?")) {
      return;
    }
    try {
      // ✅ Axios DELETE
      await axios.delete(`/materiais/${id}`);

      toast({
        title: "Excluído!",
        description: "Material excluído com sucesso.",
      });

      fetchMateriais();
    } catch (error) {
      console.error("Falha ao excluir o material:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o material.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      nome: material.nome,
      categoria: material.categoria,
      valorDiario: material.valorDiario.toString(),
      codSerie: material.codSerie,
      observacoes: material.observacoes,
      status: material.status,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingMaterial(null);
    setFormData({
      nome: "",
      categoria: "",
      valorDiario: "0",
      codSerie: "",
      observacoes: "",
      status: "disponivel",
    });
    setShowForm(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disponivel":
        return <Badge className="bg-green-500 hover:bg-green-500 text-white">Disponível</Badge>;
      case "alugado":
        return <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white">Alugado</Badge>;
      case "manutencao":
        return <Badge className="bg-red-500 hover:bg-red-500 text-white">Manutenção</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredMateriais = materiais.filter((item) => {
    const matchesSearch =
      item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codSerie?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Carregando materiais...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Cadastro de Materiais</h2>
          <p className="text-muted-foreground">
            Gerencie o catálogo de materiais disponíveis
          </p>
        </div>
        <Button
          onClick={() => {
            if (showForm && editingMaterial) {
              resetForm();
            } else {
              setShowForm(!showForm);
            }
          }}
          className="flex items-center gap-2"
        >
          {showForm && editingMaterial ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm && editingMaterial ? "Cancelar Edição" : "Novo Material"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingMaterial ? "Editar Material" : "Adicionar Novo Material"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Material *</Label>
                  <Input
                    id="nome"
                    placeholder="Digite o nome do material"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    placeholder="Ex: Ferramentas, Construção"
                    value={formData.categoria}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <Label htmlFor="codSerie">Código/Série</Label>
                  <Input
                    id="codSerie"
                    placeholder="Código interno (opcional)"
                    value={formData.codSerie}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Descrição detalhada do material"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                />
              </div> */}

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingMaterial ? "Salvar Alterações" : "Salvar Material"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Materiais Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <Input
              placeholder="Buscar por material ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-auto flex-1 rounded-lg"
            />
          </div>
        </CardContent>
        <CardContent>
          <div className="space-y-4">
            {filteredMateriais.length > 0 ? (
              filteredMateriais.map((material) => (
                <div
                  key={material._id}
                  className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{material.nome}</h3>
                      {getStatusBadge(material.status)}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(material)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-100"
                        onClick={() => handleDelete(material._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Categoria:</p>
                      <p>{material.categoria}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valor Diário:</p>
                      <p className="font-medium">
                        R$ {material.valorDiario.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Código/Série:</p>
                      <p>{material.codSerie}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Nenhum material encontrado.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};