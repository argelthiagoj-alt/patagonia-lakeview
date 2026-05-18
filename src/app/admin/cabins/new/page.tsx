import { CabinForm } from "@/components/admin/CabinForm";

export default function NewCabinPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-eyebrow">Inventario</p>
        <h1 className="heading-section">Nueva cabaña</h1>
      </header>
      <CabinForm />
    </div>
  );
}
