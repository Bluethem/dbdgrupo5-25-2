// Hub del módulo; el nav vive en layout.tsx (ModuleHeader)
const actions = [
  {
    icon: "assignment",
    title: "Registro de Operaciones",
    description: "Registrar y revisar operaciones activas.",
    href: "/operaciones-maritimas/dashboard",
  },
  {
    icon: "add_box",
    title: "Nueva Operación Marítima",
    description: "Iniciar un nuevo registro de operación.",
    href: "/operaciones-maritimas/nueva",
  },
  {
    icon: "report",
    title: "Registrar Incidencia",
    description: "Reportar un problema o evento inesperado.",
    href: "/operaciones-maritimas/incidencias",
  },
  {
    icon: "fact_check",
    title: "Gestionar Inspecciones",
    description: "Revisar inspecciones y hallazgos asociados.",
    href: "/operaciones-maritimas/hallazgos",
  },
  {
    icon: "rule",
    title: "Gestionar Incidencias",
    description: "Administrar y dar seguimiento a incidencias registradas.",
    href: "/operaciones-maritimas/incidencias/gestion",
  },
];

export default function OperacionesMaritimasPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f5] text-[#333333] dark:bg-[#221910] dark:text-gray-200">
<main className="flex flex-1 justify-center px-4 py-5 sm:px-8 md:px-16 lg:px-24 xl:px-40">
        <div className="flex w-full max-w-5xl flex-1 flex-col">
          <section className="flex flex-col gap-3 p-4 text-center">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-[#333333] dark:text-gray-100">
              Operaciones Marítimas
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Seleccione una acción para continuar.
            </p>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {actions.map((action) => (
              <a
                key={action.title}
                className="flex flex-col items-center justify-center gap-4 rounded-xl bg-[#f27f0d] p-6 text-center text-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl"
                href={action.href}
              >
                <span className="material-symbols-outlined text-5xl">
                  {action.icon}
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-bold leading-tight">
                    {action.title}
                  </h2>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </a>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

