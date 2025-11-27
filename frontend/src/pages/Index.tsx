import { useState } from "react";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { NovoAluguel } from "@/components/NovoAluguel";
import { Historico } from "@/components/Historico";
import { CadastroMateriais } from "@/components/CadastroMateriais";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [rentalAdded, setRentalAdded] = useState(0);

  const handleSave = () => {

    setRentalAdded(prev => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "novoAluguel":
        return <NovoAluguel onSave={handleSave} />;
      case "historico":
        return <Historico rentalAdded={rentalAdded} />;
      case "materiais":
        return <CadastroMateriais />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
