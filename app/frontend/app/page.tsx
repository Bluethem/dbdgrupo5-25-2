"use client";

import Link from "next/link";
import { useAuth, MODULE_ROUTES } from "@/context/AuthContext";

type ModuloInfo = {
  key: string | null;
  icon: string;
  title: string;
  description: string;
};

/** Módulos con pantalla real */
const ACTIVE_MODULES: ModuloInfo[] = [
  {
    key: "reservas",
    icon: "calendar_month",
    title: "Reservas",
    description: "Gestionar las reservas",
  },
  {
    key: "maritimo",
    icon: "directions_boat",
    title: "Operaciones Marítimas",
    description: "Supervisar actividades marítimas",
  },
  {
    key: "portuario",
    icon: "warehouse",
    title: "Operaciones Portuarias",
    description: "Controlar operaciones en puerto",
  },
  {
    key: "monitoreo",
    icon: "monitoring",
    title: "Monitoreo",
    description: "Seguimiento en tiempo real",
  },
];

/** Placeholders sin ruta (bloque secundario) */
const COMING_SOON: ModuloInfo[] = [
  {
    key: null,
    icon: "groups",
    title: "Personal",
    description: "Administrar el personal",
  },
  {
    key: null,
    icon: "local_shipping",
    title: "Operaciones Terrestres",
    description: "Coordinar transporte terrestre",
  },
  {
    key: null,
    icon: "build",
    title: "Mantenimiento Logístico",
    description: "Planificar mantenimiento",
  },
];

export default function Home() {
  const { usuario, isAuthenticated, hasModule, logout } = useAuth();

  const visibleActive = isAuthenticated
    ? ACTIVE_MODULES.filter((m) => !m.key || hasModule(m.key))
    : ACTIVE_MODULES;

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-[#0f1923] dark:text-gray-100">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h1 className="text-xl font-bold text-[#002b5c] dark:text-white">
          Hapag-Lloyd
        </h1>
        <div className="flex items-center gap-4 text-sm">
          {isAuthenticated && usuario ? (
            <>
              <span className="text-gray-600 dark:text-gray-300">
                {usuario.empleado?.nombre} {usuario.empleado?.apellido}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-md bg-gray-100 px-3 py-1.5 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-[#ff8c00] px-4 py-1.5 font-semibold text-white hover:opacity-90"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-grow flex-col px-6 py-10">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl font-bold text-[#002b5c] dark:text-white">
            Bienvenido a Hapag-Lloyd
          </h2>
          <p className="text-gray-500">
            {isAuthenticated
              ? "Selecciona un módulo para continuar"
              : "Inicia sesión para acceder a los módulos"}
          </p>
        </div>

        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Módulos disponibles
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {visibleActive.map((m) => {
              const href = !isAuthenticated
                ? "/login"
                : m.key
                  ? MODULE_ROUTES[m.key]
                  : "#";
              return (
                <Link
                  key={m.title}
                  href={href}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#ff8c00] p-6 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-opacity-90"
                >
                  <span className="material-symbols-outlined text-5xl">
                    {m.icon}
                  </span>
                  <span className="text-xl font-semibold">{m.title}</span>
                  <span className="text-sm font-normal opacity-90">
                    {m.description}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Próximamente
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {COMING_SOON.map((m) => (
              <div
                key={m.title}
                className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-gray-400 dark:border-gray-700 dark:bg-gray-900/40"
              >
                <span className="material-symbols-outlined text-3xl">
                  {m.icon}
                </span>
                <span className="text-base font-semibold text-gray-500">
                  {m.title}
                </span>
                <span className="text-xs">{m.description}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
