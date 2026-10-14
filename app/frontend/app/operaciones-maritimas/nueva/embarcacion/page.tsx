"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Buque = {
  id_buque: string;
  matricula: string;
  nombre: string;
  capacidad: number;
  id_estado_embarcacion: string;
  estado_embarcacion?: {
    id_estado_embarcacion: string;
    nombre: string;
  };
  peso: number;
  ubicacion_actual: string | null;
};

function SeleccionarEmbarcacionContent() {
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [vessels, setVessels] = useState<Buque[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [minWeight, setMinWeight] = useState<string>("");
  const [maxWeight, setMaxWeight] = useState<string>("");
  const [vesselStates, setVesselStates] = useState<{ id_estado_embarcacion: string; nombre: string }[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const itemsPerPage = 10;
  const router = useRouter();
  const searchParams = useSearchParams();

  const baseQueryString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    // id_buque se sobreescribe solo en Confirmar
    params.delete("id_buque");
    return params.toString();
  }, [searchParams]);

  useEffect(() => {
    const loadVessels = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', itemsPerPage.toString());
        if (minWeight) params.append('minWeight', minWeight);
        if (maxWeight) params.append('maxWeight', maxWeight);
        if (selectedState) params.append('stateId', selectedState);

        const response = await fetch(`http://localhost:3001/monitoreo/buques?${params.toString()}`);
        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
          setVessels(data.data as Buque[]);
          setTotalPages(data.totalPages);
          setTotal(data.total);
        } else {
          setVessels([]);
          setTotalPages(0);
          setTotal(0);
        }
      } catch (e) {
        console.error("Error al cargar buques", e);
        setError("No se pudieron cargar los buques");
        setVessels([]);
      } finally {
        setLoading(false);
      }
    };

    loadVessels();
  }, [currentPage, minWeight, maxWeight, selectedState]);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const response = await fetch("http://localhost:3001/monitoreo/estados-embarcacion");
        const data = await response.json();
        if (Array.isArray(data)) {
          setVesselStates(data);
        }
      } catch (e) {
        console.error("Error al cargar estados", e);
      }
    };
    loadStates();
  }, []);



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f7f8] dark:bg-[#0f1923] font-display">
<main className="flex-grow flex p-6 gap-6">
        <div className="w-full flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                Seleccionar Embarcación
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Visualice las embarcaciones disponibles y seleccione una para la
                operación.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-[#f5f7f8] dark:bg-gray-800 rounded-lg focus:ring-[#0459af] focus:border-[#0459af] text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Buscar embarcaciones..."
                  type="text"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Peso Mín"
                  value={minWeight}
                  onChange={(e) => {
                    setMinWeight(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-[#f5f7f8] dark:bg-gray-800 rounded-lg focus:ring-[#0459af] focus:border-[#0459af] text-gray-800 dark:text-gray-200"
                />
                <input
                  type="number"
                  placeholder="Peso Máx"
                  value={maxWeight}
                  onChange={(e) => {
                    setMaxWeight(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-[#f5f7f8] dark:bg-gray-800 rounded-lg focus:ring-[#0459af] focus:border-[#0459af] text-gray-800 dark:text-gray-200"
                />
              </div>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-[#f5f7f8] dark:bg-gray-800 rounded-lg focus:ring-[#0459af] focus:border-[#0459af] text-gray-800 dark:text-gray-200"
              >
                <option value="">Filtrar por Estado</option>
                {vesselStates.map((state) => (
                  <option key={state.id_estado_embarcacion} value={state.id_estado_embarcacion}>
                    {state.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <p className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  Cargando buques...
                </p>
              ) : error ? (
                <p className="px-6 py-4 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              ) : (
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-[#f5f7f8] dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3" scope="col"></th>
                      <th className="px-6 py-3" scope="col">
                        Matrícula
                      </th>
                      <th className="px-6 py-3" scope="col">
                        Nombre
                      </th>
                      <th className="px-6 py-3" scope="col">
                        Capacidad
                      </th>
                      <th className="px-6 py-3" scope="col">
                        Estado
                      </th>
                      <th className="px-6 py-3" scope="col">
                        Peso
                      </th>
                      <th className="px-6 py-3" scope="col">
                        Ubicación actual
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vessels.length === 0 ? (
                      <tr className="bg-white dark:bg-slate-800">
                        <td
                          className="px-6 py-6 text-center text-gray-600 dark:text-gray-400"
                          colSpan={7}
                        >
                          No hay buques disponibles
                        </td>
                      </tr>
                    ) : (
                      vessels.map((vessel) => (
                        <tr
                          key={vessel.id_buque}
                          className="bg-white dark:bg-slate-800 border-b dark:border-gray-800 hover:bg-[#f5f7f8] dark:hover:bg-gray-800/50"
                        >
                          <td className="px-6 py-4">
                            <input
                              className="h-4 w-4 rounded border-gray-300 text-[#0459af] focus:ring-[#0459af] dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-[#0459af]"
                              id={vessel.id_buque}
                              name="vessel-selection"
                              type="radio"
                              checked={selectedVessel === vessel.id_buque}
                              onChange={() => setSelectedVessel(vessel.id_buque)}
                            />
                          </td>
                          <td className="px-6 py-4">{vessel.matricula}</td>
                          <th
                            className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
                            scope="row"
                          >
                            {vessel.nombre}
                          </th>
                          <td className="px-6 py-4">{vessel.capacidad}</td>
                          <td className="px-6 py-4">
                            {vessel.estado_embarcacion?.nombre || "-"}
                          </td>
                          <td className="px-6 py-4">{vessel.peso}</td>
                          <td className="px-6 py-4">
                            {vessel.ubicacion_actual || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-slate-800">
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
                    Mostrando <span className="font-medium">{vessels.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, total)}</span> de <span className="font-medium">{total}</span> resultados
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

            <div className="flex justify-end items-center mt-6 gap-4">
              <Link
                href={
                  baseQueryString
                    ? `/operaciones-maritimas/nueva?${baseQueryString}`
                    : "/operaciones-maritimas/nueva"
                }
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-transparent rounded-lg border border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Volver
              </Link>
              <button
                type="button"
                onClick={() => setSelectedVessel(null)}
                className="px-6 py-2 text-sm font-medium text-[#0459af] bg-transparent rounded-lg border border-[#0459af] hover:bg-[#0459af]/10 dark:text-[#0459af] dark:border-[#0459af] dark:hover:bg-[#0459af]/20"
              >
                Deseleccionar
              </button>
              <button
                type="button"
                disabled={!selectedVessel}
                onClick={() => {
                  if (selectedVessel) {
                    const params = new URLSearchParams(baseQueryString);
                    params.set("id_buque", selectedVessel);
                    const qs = params.toString();
                    router.push(
                      qs
                        ? `/operaciones-maritimas/nueva?${qs}`
                        : "/operaciones-maritimas/nueva"
                    );
                  }
                }}
                className="px-6 py-2 text-sm font-medium text-white bg-[#0459af] rounded-lg hover:bg-[#0459af]/90 focus:ring-4 focus:ring-[#0459af]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SeleccionarEmbarcacionPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f5f7f8] dark:bg-[#0f1923]">Cargando embarcaciones...</div>}>
      <SeleccionarEmbarcacionContent />
    </Suspense>
  );
}

