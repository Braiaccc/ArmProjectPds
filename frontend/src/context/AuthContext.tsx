// Em @/contexts/AuthContext.tsx (ou onde seu contexto está)

import { ReactNode, createContext, useEffect, useState, useContext } from "react";
import {
  onAuthStateChanged,
  signOut,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "@/firebaseConfig"; // 1. Importe o 'db'
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // 2. Importe funções do Firestore

// Tipagem do contexto
interface AuthContextType {
  user: User | null;
  loadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  // 3. Atualize a tipagem da função register
  register: (
    email: string,
    password: string,
    name: string,
    company: string,
  ) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Criando contexto
export const AuthContext = createContext<AuthContextType | null>(null);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // 4. ATUALIZE A FUNÇÃO DE REGISTRO
  const register = async (
    email: string,
    password: string,
    name: string,
    company: string,
  ) => {
    try {
      // Parte 1: Criar o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Parte 2: Salvar os dados extras no Cloud Firestore
      // Criamos uma referência para um novo documento na coleção "users"
      // O ID do documento será o mesmo UID do usuário no Auth
      const userDocRef = doc(db, "users", user.uid);

      // Salvamos os dados
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        name: name, // Dado extra do formulário
        company: company, // Dado extra do formulário
        createdAt: serverTimestamp(), // Data de criação
      });
    } catch (error) {
      console.error("Erro ao registrar:", error);
      // Re-lança o erro para ser pego no formulário
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loadingAuth,
        login,
        register, // 5. 'register' agora é a nova função
        forgotPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook useAuth (continua o mesmo)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};