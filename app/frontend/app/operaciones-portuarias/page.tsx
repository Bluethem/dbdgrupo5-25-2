"use client";

// Dashboard del módulo; el nav vive en layout.tsx (ModuleHeader)
import { useEffect, useState } from "react";
import Link from "next/link";

type ResumenResponse = {
  pendientes: number;
  en_curso: number;
  completadas: number;
};

type OperacionPortuaria = {
  id_operacion_portuaria: string;
  puerto: string;
  muelle: string;
  tipo_operacion_portuaria: string;
  matricula_buque: string;
  estado: string;
};

export default function OperacionesPortuariasPage() {
  const [resumen, setResumen] = useState<ResumenResponse | null>(null);
  const [operaciones, setOperaciones] = useState<OperacionPortuaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [resumenRes, listaRes] = await Promise.all([
          fetch(`${baseUrl}/operaciones-portuarias/resumen`),
          fetch(`${baseUrl}/operaciones-portuarias`),
        ]);

        if (!resumenRes.ok || !listaRes.ok) {
          throw new Error("Error al cargar datos de operaciones portuarias");
        }

        const resumenData: ResumenResponse = await resumenRes.json();
        const listaData: OperacionPortuaria[] = await listaRes.json();

        setResumen(resumenData);
        setOperaciones(listaData);
      } catch (err: any) {
        setError(err.message ?? "Error inesperado");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
<main className="mx-auto flex w-full max-w-6xl flex-grow flex-col gap-6 px-6 py-8">
        {/* Contenedor 1: Título + botón */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard Operaciones Portuarias</h1>
          <Link href="/operaciones-portuarias/nueva">
            <button
              type="button"
              className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-purple-700"
            >
              Nueva operación portuaria
            </button>
          </Link>
        </div>

        {/* Contenedor 2: Resumen de estados */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Pendientes</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {resumen ? resumen.pendientes : "-"}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">En curso</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {resumen ? resumen.en_curso : "-"}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Completadas</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {resumen ? resumen.completadas : "-"}
            </p>
          </div>
        </div>

        {/* Lista de operaciones portuarias */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Operaciones portuarias
          </h2>

          {loading && (
            <p className="text-sm text-gray-500">Cargando operaciones...</p>
          )}

          {error && !loading && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {!loading && !error && operaciones.length === 0 && (
            <p className="text-sm text-gray-500">
              No hay operaciones portuarias registradas.
            </p>
          )}

          {!loading && !error && operaciones.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Puerto
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Muelle
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Tipo de operación
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Matrícula buque
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {operaciones.map((op) => (
                    <tr key={op.id_operacion_portuaria}>
                      <td className="px-4 py-2">{op.puerto}</td>
                      <td className="px-4 py-2">{op.muelle}</td>
                      <td className="px-4 py-2">
                        {op.tipo_operacion_portuaria}
                      </td>
                      <td className="px-4 py-2">{op.matricula_buque}</td>
                      <td className="px-4 py-2">{op.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
