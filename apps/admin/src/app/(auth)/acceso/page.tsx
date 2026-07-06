import { AccesoForm } from "@/components/app/auth/acceso-form";

export default function AccesoPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <AccesoForm />
      </div>
    </div>
  );
}
