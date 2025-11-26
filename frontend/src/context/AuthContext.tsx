import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ✅ MUDANÇA CRÍTICA:
// Se existir uma variável de ambiente (Vercel), usa ela. Se não, usa localhost.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type User = {
  id: string;
  name: string;
  email: string;
  company?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    company?: string
  ) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const performLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser && savedToken !== "undefined") {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setLoading(false);

    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.warn("Sessão expirada. Realizando logout.");
          performLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    const res = await axios.post("/auth/login", { email, password });

    const newToken = res.data?.token;
    const newUser = res.data?.user;

    if (!newToken) {
      throw new Error("Erro de comunicação: Token não recebido.");
    }

    setToken(newToken);
    setUser(newUser);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

    navigate("/");
  };

  const register = async (name: string, email: string, password: string, company?: string) => {
    const res = await axios.post("/auth/register", { name, email, password, company });

    if (res.data.token && res.data.user) {
        const newToken = res.data.token;
        const newUser = res.data.user;

        setToken(newToken);
        setUser(newUser);

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));

        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        
        navigate("/");
    } else {
        navigate("/login"); 
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout: performLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};