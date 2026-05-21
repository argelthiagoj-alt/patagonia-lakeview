"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAppDateClient } from "@/modules/demo-tools/date";

/**
 * Provee la fecha "de la app" a los components cliente. La envoltura
 * cliente lee la cookie `demo-date` (si demo mode está habilitado) y
 * notifica a sus consumidores cada vez que cambia.
 *
 * Si demo mode está apagado, `getAppDateClient()` ya devuelve
 * `new Date()` real — el provider es transparente.
 *
 * Para evitar mismatches SSR/CSR usamos un estado inicial que sólo se
 * setea cuando el component monta en el cliente; durante el primer
 * render usamos la fecha pasada por el server (initial).
 */
type AppDateContextValue = {
  appDate: Date;
};

const AppDateContext = createContext<AppDateContextValue | null>(null);

export function AppDateProvider({
  initial,
  children,
}: {
  /** Fecha resuelta server-side (para que la primera pintura coincida). */
  initial: string;
  children: React.ReactNode;
}) {
  const [appDate, setAppDate] = useState<Date>(() => new Date(initial));

  useEffect(() => {
    // Una vez montados, refrescamos por si la cookie cambió desde el
    // panel demo entre render y hidratación.
    setAppDate(getAppDateClient());

    // Escuchamos cambios de cookie / focus (cuando el usuario vuelve
    // del panel demo).
    const onFocus = () => setAppDate(getAppDateClient());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <AppDateContext.Provider value={{ appDate }}>
      {children}
    </AppDateContext.Provider>
  );
}

/** Hook para consumir la app date. Fuera del provider devuelve `new Date()`. */
export function useAppDate(): Date {
  const ctx = useContext(AppDateContext);
  return ctx?.appDate ?? new Date();
}
