import { redirect } from "next/navigation";

/**
 * Soft-redirect histórico: /availability se reconvirtió en /destinos.
 * Mantenemos la ruta para no romper links externos que puedan existir.
 */
export default function AvailabilityRedirect() {
  redirect("/destinos");
}
