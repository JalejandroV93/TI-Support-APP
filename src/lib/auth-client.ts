// lib/auth-client.ts
import { UserPayload } from "@/types/user";

// Función de login para el cliente.  Hace la solicitud a la API.
export const loginClient = async (username: string, password: string): Promise<void> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error de inicio de sesión");
  }
  // No es necesario devolver nada.  La cookie se establece en el servidor.
};


// Función de logout para el cliente.  Hace la solicitud y redirige.
export const logoutClient = async (): Promise<void> => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  if (response.ok) {
    window.location.href = '/login'; // Redirige al cliente

  } else {
    // Manejar errores, por ejemplo, mostrar un mensaje.
    console.error("Error al cerrar sesión");
  }
};

// Función para obtener el usuario desde el cliente.
export const fetchUserClient = async (): Promise<UserPayload | null> => {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
        return await response.json();
    } else {
        return null; // No hay usuario autenticado
    }
};