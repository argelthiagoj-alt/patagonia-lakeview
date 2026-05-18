"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-5 pt-32 text-center">
      <p className="text-eyebrow">Algo salió mal</p>
      <h1 className="heading-section max-w-xl">
        Pasó algo inesperado en este lado del lago.
      </h1>
      <p className="max-w-md text-[color:var(--color-text-secondary)]">
        Probá recargar la página. Si persiste, escribinos y lo miramos.
      </p>
      <Button onClick={reset} variant="primary" size="md">
        Reintentar
      </Button>
    </section>
  );
}
