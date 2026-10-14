"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export type ModuleNavItem = {
  label: string;
  href: string;
};

type ModuleHeaderProps = {
  moduleTitle: string;
  navItems: ModuleNavItem[];
  homeHref?: string;
};

/** El link más específico (href más largo) gana — evita activar "Incidencias" y "Registrar" a la vez. */
function activeHref(
  pathname: string,
  navItems: ModuleNavItem[],
  moduleRoot: string,
): string | null {
  const matches = navItems.filter((item) => {
    if (item.href === moduleRoot) {
      return pathname === moduleRoot;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.href.length - a.href.length)[0].href;
}

export function ModuleHeader({
  moduleTitle,
  navItems,
  homeHref = "/",
}: ModuleHeaderProps) {
  const pathname = usePathname() || "";
  const { usuario, isAuthenticated, logout } = useAuth();
  const moduleRoot = navItems[0]?.href ?? homeHref;
  const current = activeHref(pathname, navItems, moduleRoot);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href={homeHref}
          className="flex shrink-0 items-center gap-2 text-lg font-bold text-[#002b5c] transition-colors hover:text-[#ff8c00]"
        >
          <Image
            src="/favicon/favicon-96x96.png"
            alt="Hapag-Lloyd"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="hidden sm:inline">Hapag-Lloyd</span>
        </Link>

        <div className="hidden h-6 w-px bg-zinc-200 sm:block" aria-hidden />

        <span className="truncate text-sm font-semibold text-[#002b5c] sm:text-base">
          {moduleTitle}
        </span>

        <nav className="ml-2 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {navItems.map((item) => {
            const active = current === item.href;
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#ff8c00]/10 text-[#ff8c00]"
                    : "text-gray-700 hover:bg-gray-100 hover:text-[#ff8c00]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3 text-sm">
          <Link
            href={homeHref}
            className="rounded-lg px-2.5 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-[#ff8c00]"
          >
            Módulos
          </Link>
          {isAuthenticated && usuario ? (
            <>
              <span className="hidden text-gray-600 md:inline">
                {usuario.empleado?.nombre} {usuario.empleado?.apellido}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-md bg-gray-100 px-3 py-1.5 font-medium hover:bg-gray-200"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-[#ff8c00] px-3 py-1.5 font-semibold text-white hover:opacity-90"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
