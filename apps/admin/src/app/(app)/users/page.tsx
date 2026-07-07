"use client";

import { UserTable } from "@/components/app/dashboard/user-table";

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground text-sm">
            Todos los usuarios de la app: usuarios, comercios y administradores.
          </p>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <UserTable basePath="/users" />
      </div>
    </div>
  );
}
