// ✅ CONTEXT RESPONSÁVEL POR GERENCIAR A AUTENTICAÇÃO COM FIREBASE

import { ReactNode, createContext, useEffect, useState, useContext } from "react";
import {
  onAuthStateChanged,
  signOut,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/firebaseConfig";

// Tipagem do contexto
interface AuthContextType {
  user: User | null;
  loadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Criando contexto
export const AuthContext = createContext<AuthContextType | null>(null);

// Provider que envolve o App
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // ✅ Observa mudanças na autenticação (login/logout)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Funções de autenticação
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const forgotPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // ✅ Aqui exporta tudo via value
  return (
    <AuthContext.Provider
      value={{
        user,
        loadingAuth,
        login,
        register,
        forgotPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook para facilitar o uso do contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
