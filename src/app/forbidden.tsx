// src/app/forbidden.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <h1 className="text-4xl font-bold text-foreground mb-4">403 - Acceso denegado</h1>
      <p className="text-lg text-muted-foreground mb-8">
        No tienes permiso para acceder a esta página.
      </p>
       <Button asChild variant="secondary">
        <Link href="/">Ir a la página principal</Link>
      </Button>
    </div>
  );
}