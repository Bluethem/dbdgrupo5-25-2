"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type RutaResultado = {
  id: string;
  codigo: string;
  distancia: number | string;
  duracion: string | null;
  tarifa: number | string | null;
  puertosIntermedios: string[];
};

function RutasDisponiblesContent() {
  const searchParams = useSearchParams();
  const originId = searchParams.get("originId");
  const destinationId = searchParams.get("destinationId");
  const originName = searchParams.get("originName") || "Origen";
  const destinationName = searchParams.get("destinationName") || "Destino";
  const router = useRouter();

  const [rutas, setRutas] = useState<RutaResultado[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const loadRutas = async () => {
      if (!originId || !destinationId) {
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `http://localhost:3001/monitoreo/rutas-maritimas?origen=${originId}&destino=${destinationId}&page=${currentPage}&limit=${itemsPerPage}`
        );
        if (!response.ok) {
          throw new Error("No se pudieron obtener las rutas marítimas.");
        }
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          setRutas(data.data as RutaResultado[]);
          setTotalPages(data.totalPages);
          setTotal(data.total);
        } else {
          setRutas([]);
          setTotalPages(0);
          setTotal(0);
        }
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar las rutas disponibles.");
        setRutas([]);
      } finally {
        setLoading(false);
      }
    };

    loadRutas();
  }, [originId, destinationId, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f5f7f8] dark:bg-[#0f1923] font-display">
<main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Rutas Disponibles por Puertos
            </h1>
            <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {originName}
              </span>
              <span className="mx-2 text-[#0459af]">→</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {destinationName}
              </span>
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Seleccione una ruta para ver los detalles y confirmar la operación.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                    scope="col"
                  >
                    Código
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                    scope="col"
                  >
                    Distancia
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                    scope="col"
                  >
                    Duración
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                    scope="col"
                  >
                    Puertos Intermedios
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                    scope="col"
                  >
                    Tarifa (USD)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading && (
                  <tr>
                    <td
                      className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400"
                      colSpan={5}
                    >
                      Cargando rutas disponibles...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td
                      className="px-6 py-4 text-sm text-red-600 dark:text-red-400"
                      colSpan={5}
                    >
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && rutas.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400"
                      colSpan={5}
                    >
                      No hay rutas disponibles entre los puertos seleccionados.
                    </td>
                  </tr>
                )}
                {!loading && !error &&
                  rutas.map((ruta) => (
                    <tr
                      key={ruta.id}
                      onClick={() => setSelectedRouteId(ruta.id)}
                      className={`cursor-pointer transition-colors ${selectedRouteId === ruta.id
                        ? "bg-[#0459af]/10 dark:bg-[#0459af]/20"
                        : "hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {ruta.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {ruta.distancia}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {ruta.duracion ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {ruta.puertosIntermedios.length > 0
                          ? ruta.puertosIntermedios.join(", ")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {ruta.tarifa ?? "-"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-slate-800 rounded-b-lg">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-200"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-slate-700 dark:text-gray-200"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Mostrando <span className="font-medium">{rutas.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, total)}</span> de <span className="font-medium">{total}</span> resultados
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-gray-600 dark:hover:bg-slate-700"
                  >
                    <span className="sr-only">Anterior</span>
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page
                        ? "z-10 bg-[#0459af] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0459af]"
                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-slate-700"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:ring-gray-600 dark:hover:bg-slate-700"
                  >
                    <span className="sr-only">Siguiente</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Link
              href={(() => {
                const idBuque = searchParams.get("id_buque");
                const contenedores = searchParams.get("contenedores");
                const params = new URLSearchParams();
                if (idBuque) params.set('id_buque', idBuque);
                if (contenedores) params.set('contenedores', contenedores);
                return params.toString()
                  ? `/operaciones-maritimas/nueva/ruta?${params.toString()}`
                  : "/operaciones-maritimas/nueva/ruta";
              })()}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              Volver a Selección de Puertos
            </Link>
            <button
              type="button"
              className="rounded-lg bg-[#0459af] px-4 py-2 text-sm font-medium text-white hover:bg-[#0459af]/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!selectedRouteId}
              onClick={() => {
                if (!selectedRouteId) return;
                const selectedRuta = rutas.find((r) => r.id === selectedRouteId);
                const distancia = selectedRuta?.distancia ?? "";
                const duracion = selectedRuta?.duracion ?? "";
                const idBuque = searchParams.get("id_buque");
                const contenedores = searchParams.get("contenedores");

                const params = new URLSearchParams();
                params.set('routeId', selectedRouteId);
                if (originId) params.set('originId', originId);
                if (destinationId) params.set('destinationId', destinationId);
                params.set('originName', originName);
                params.set('destinationName', destinationName);
                params.set('distance', String(distancia));
                params.set('duration', duracion || "");
                if (idBuque) params.set('id_buque', idBuque);
                if (contenedores) params.set('contenedores', contenedores);

                router.push(
                  `/operaciones-maritimas/nueva/ruta?${params.toString()}`
                );
              }}
            >
              Confirmar Ruta Seleccionada
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RutasDisponiblesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f5f7f8] dark:bg-[#0f1923]">Cargando rutas...</div>}>
      <RutasDisponiblesContent />
    </Suspense>
  );
}

