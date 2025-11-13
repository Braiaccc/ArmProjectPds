import { Home, Plus, List, Package, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home }, 
    { id: 'novoAluguel', label: 'Novo aluguel', icon: Package }, 
    { id: 'historico', label: 'Historico', icon: History }, 
    { id: 'materiais', label: 'CadastroMateriais', icon: Plus }, 
  ];

  return (
    <nav className="bg-white border-b border-border px-6 py-2">
      <div className="flex gap-2 overflow-x-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap",
                activeTab === item.id ? "bg-primary text-primary-foreground" : ""
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
};