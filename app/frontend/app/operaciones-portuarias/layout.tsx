import { ReactNode } from "react";
import { ModuleHeader } from "@/components/ModuleHeader";

const NAV = [
  { label: "Inicio", href: "/operaciones-portuarias" },
  { label: "Nueva operación", href: "/operaciones-portuarias/nueva" },
];

export default function OperacionesPortuariasLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {/* Layout del módulo: header propio; las pantallas funcionales no cambian */}
      <ModuleHeader moduleTitle="Operaciones Portuarias" navItems={NAV} />
      {children}
    </>
  );
}
