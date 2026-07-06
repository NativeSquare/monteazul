import { RegistroForm } from "@/components/app/auth/registro-form";

export default function RegistroPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegistroForm />
      </div>
    </div>
  );
}
