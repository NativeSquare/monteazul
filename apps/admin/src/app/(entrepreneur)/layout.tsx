import { EntrepreneurGuard } from "@/components/app/entrepreneur/entrepreneur-guard";
import { EntrepreneurShell } from "@/components/app/entrepreneur/entrepreneur-shell";
import { Toaster } from "@/components/ui/sonner";

export default function EntrepreneurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EntrepreneurGuard>
      <EntrepreneurShell>{children}</EntrepreneurShell>
      <Toaster />
    </EntrepreneurGuard>
  );
}
