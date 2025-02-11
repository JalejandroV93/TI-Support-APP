// lib/menu-list.ts
import {
  Users,
  
  LayoutGrid,
  LucideIcon,
  FileText,
  ClipboardCheck,
  Network,
  Tablet,
  HeartHandshake,
} from "lucide-react";
import { UserPayload } from "@/types/user"; // Importa el tipo UserPayload


type Submenu = {
  href: string;
  label: string;
  roles?: Array<UserPayload['rol']>;  // Opcional: Roles permitidos
  icon?: LucideIcon;
};

type Menu = {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  roles?: Array<UserPayload['rol']>; // Opcional: Roles permitidos
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};



export function getMenuList(pathname: string, user: UserPayload | null): Group[] {  //Recibe user
  const baseMenu: Group[] = [
    {
      groupLabel: "",
      menus: [
        {
          href: "/v1/",
          label: "Dashboard",
          icon: LayoutGrid,
          roles: ['ADMIN', 'COLABORADOR'], // Permitido para todos
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Informes",
      menus: [
        {
          href: "/v1/reports",  // Ruta base para los informes
          label: "Informes",
          icon: FileText,
          roles: ['ADMIN', 'COLABORADOR'],
          submenus: [
            { href: "/v1/reports/maintenance", label: "Mantenimiento Equipos", icon: ClipboardCheck },
            { href: "/v1/reports/network", label: "Red", icon: Network },
            { href: "/v1/reports/mobile-classrooms", label: "Aulas Móviles", icon: Tablet },
            { href: "/v1/reports/soporte-en-sitio", label: "Soporte", icon: HeartHandshake },
          ]
        }
      ]
    }
  ];

    // Menú de usuarios (solo para administradores)
  const adminMenu: Menu = {
    href: "/v1/users",
    label: "Gestión de Usuarios",
    icon: Users,
    roles: ['ADMIN'], // Solo ADMIN
  };

  // Agrega el menú de administrador si el usuario es ADMIN
  if (user?.rol === 'ADMIN') {
    baseMenu.push({ groupLabel: "Administración", menus: [adminMenu] });
  }
  
  
  // Filtrar los menús y submenús según el rol del usuario
  const filteredMenu = baseMenu.map(group => ({
    ...group,
    menus: group.menus.filter(menu => !menu.roles || (user && menu.roles.includes(user.rol))).map(menu => ({
      ...menu,
      submenus: menu.submenus?.filter(submenu => !submenu.roles || (user && submenu.roles.includes(user.rol)))
    }))
  }));

  return filteredMenu;
}