// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
//import { signIn, useSession } from "next-auth/react"; // Quitamos next-auth
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  //const { data: session } = useSession(); // Quitamos next-auth
  const controls = useAnimation();

  const { user, refetchUser } = useAuth();

  useEffect(() => {
    //if (session) { // Quitamos la comprobación de sesión de next-auth
    if (user) {
      router.push("/v1/");
    }
  }, [user, router]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    controls.start({ y: isMobile ? "-25%" : 0 });
  }, [isMobile, controls]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // const data = await response.json(); // Ya no necesitamos el token aquí
        await refetchUser();
        router.push("/v1/"); // Redirige al dashboard
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: errorData.error, // Muestra el mensaje de error del servidor
        });
      }
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "Ocurrió un error inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 0 }}
        animate={controls}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md rounded-xl shadow-md"
      >
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Liceo Taller San Miguel
            </CardTitle>
            <CardDescription className="text-center">
              Sistema de Gestión de Soporte Técnico
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="Ingrese su usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Ingrese su contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="sr-only">
                        {showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    />
                    <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
                </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
