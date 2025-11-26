// Configuração base da API
const API_BASE_URL = "http://localhost:5000/api";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Pega o token salvo no login
  const token = localStorage.getItem('token');

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    // Se o token for inválido, desloga o usuário
    localStorage.removeItem('token');
    window.location.href = '/'; 
    throw new Error("Sessão expirada");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro: ${response.status}`);
  }

  return response.json();
}