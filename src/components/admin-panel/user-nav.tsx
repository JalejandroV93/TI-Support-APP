// components/admin-panel/user-nav.tsx
"use client";

import Link from "next/link";
import { LogOut, Settings } from "lucide-react"; // Importa Settings

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/providers/AuthProvider"; // Importa useAuth
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
export function UserNav() {
  const { user, isLoading } = useAuth(); // Obtiene el usuario y el estado de carga
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
  };

  if (isLoading) {
    return <Skeleton className="w-8 h-8 rounded-full" />; // O un spinner más elaborado
  }

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  {/* Usa la imagen del usuario si existe, si no, un fallback */}
                  {/* <AvatarImage src={user?.imagenUrl || "#"} alt={user?.nombre || "Avatar"} /> */}
                  <AvatarFallback className="bg-transparent">
                    {user?.nombre
                      ? user.nombre.slice(0, 2).toUpperCase()
                      : "NN"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Perfil</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {/* Muestra el nombre y correo del usuario */}
            <p className="text-sm font-medium leading-none">{user?.nombre}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          
          {/* Enlace a la página de cuenta del usuario */}
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/v1/account/" className="flex items-center">
              <Settings className="w-4 h-4 mr-3 text-muted-foreground" />
              Ajustes de cuenta
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="hover:cursor-pointer"
          onClick={async () => {
            await logout();
            router.refresh();
          }}
        >
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
          Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
