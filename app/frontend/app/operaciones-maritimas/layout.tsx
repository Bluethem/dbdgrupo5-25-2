import { ReactNode } from "react";
import { ModuleHeader } from "@/components/ModuleHeader";

const NAV = [
  { label: "Inicio", href: "/operaciones-maritimas" },
  { label: "Operaciones", href: "/operaciones-maritimas/dashboard" },
  { label: "Nueva operación", href: "/operaciones-maritimas/nueva" },
  { label: "Incidencias", href: "/operaciones-maritimas/incidencias/gestion" },
  {
    label: "Registrar incidencia",
    href: "/operaciones-maritimas/incidencias",
  },
  { label: "Inspecciones", href: "/operaciones-maritimas/hallazgos" },
];

export default function OperacionesMaritimasLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {/* Layout del módulo: header propio; las pantallas funcionales no cambian */}
      <ModuleHeader moduleTitle="Operaciones Marítimas" navItems={NAV} />
      {children}
    </>
  );
}
