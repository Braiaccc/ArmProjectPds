import { createContext, useContext, useState, ReactNode } from "react";

type Aluguel = {
  id: string;
  cliente: string;
  materiais: string[];
  dataRetirada: string;
  dataDevolucao: string;
  dataRealDevolucao?: string;
  status: string;
  pagamento: string;
  valor: number;
  diasAtraso: number;
};

type AluguelContextType = {
  alugueis: Aluguel[];
  adicionarAluguel: (novo: Aluguel) => void;
};

const AluguelContext = createContext<AluguelContextType | undefined>(undefined);

export const AluguelProvider = ({ children }: { children: ReactNode }) => {
  const [alugueis, setAlugueis] = useState<Aluguel[]>([]);

  const adicionarAluguel = (novo: Aluguel) => {
    setAlugueis((prev) => [...prev, novo]);
  };

  return (
    <AluguelContext.Provider value={{ alugueis, adicionarAluguel }}>
      {children}
    </AluguelContext.Provider>
  );
};

export const useAluguel = () => {
  const context = useContext(AluguelContext);
  if (!context) {
    throw new Error("useAluguel deve ser usado dentro de um AluguelProvider");
  }
  return context;
};
