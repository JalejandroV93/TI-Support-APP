// src/app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <h1 className="text-4xl font-bold text-foreground mb-4">404 - Página no encontrada</h1>
      <p className="text-lg text-muted-foreground mb-8">
        La página que estás buscando no existe.
      </p>
      <Button asChild variant="secondary">
        <Link href="/v1/">Ir a la página principal</Link>
      </Button>
    </div>
  );
}