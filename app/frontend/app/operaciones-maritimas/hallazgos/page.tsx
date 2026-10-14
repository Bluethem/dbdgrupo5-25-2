// @ts-nocheck
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { hallazgosAPI, type TipoHallazgo } from "@/lib/api/hallazgos";

type Inspection = {
  id: string;
  type: string;
  date: string;
  time: string;
  priority: string;
  operationCode: string;
  inspectionCode: string;
  status: string;
};

const priorityStyles: Record<string, { bg: string; text: string }> = {
  Alta: { bg: "bg-[#fee]", text: "text-[#b91c1c]" },
  Media: { bg: "bg-[#fff4e6]", text: "text-[#f97316]" },
  Baja: { bg: "bg-[#e6f0ff]", text: "text-[#1d4ed8]" },
  Crítica: { bg: "bg-[#fee]", text: "text-[#b91c1c]" },
};

export default function HallazgosPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [tiposHallazgo, setTiposHallazgo] = useState<TipoHallazgo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Form state
  const [tipoHallazgo, setTipoHallazgo] = useState("");
  const [nivelGravedad, setNivelGravedad] = useState(1);
  const [descripcion, setDescripcion] = useState("");
  const [accionSugerida, setAccionSugerida] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inspeccionesData, tiposData] = await Promise.all([
        hallazgosAPI.getInspecciones(),
        hallazgosAPI.getTiposHallazgo(),
      ]);
      const mapped = inspeccionesData.map((i: any) => ({
        id: i.id,
        type: i.type,
        date: i.date,
        time: i.time,
        priority: i.priority,
        operationCode: i.operationCode,
        inspectionCode: i.inspectionCode,
        status: i.status,
      }));
      setInspections(mapped);
      setTiposHallazgo(tiposData);
      if (mapped.length > 0) setSelectedId(mapped[0].id);
    } catch (e) {
      console.error(e);
      alert("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !tipoHallazgo || !descripcion) {
      alert("Complete los campos requeridos");
      return;
    }
    try {
      await hallazgosAPI.createHallazgo({
        id_tipo_hallazgo: tipoHallazgo,
        nivel_gravedad: nivelGravedad,
        descripcion,
        accion_sugerida: accionSugerida || undefined,
        id_inspeccion: selectedId,
      });
      alert("Hallazgo creado");
      setTipoHallazgo("");
      setNivelGravedad(1);
      setDescripcion("");
      setAccionSugerida("");
    } catch (e) {
      console.error(e);
      alert("Error al crear hallazgo");
    }
  };

  const selectedInspection = inspections.find((i) => i.id === selectedId);

  const filteredInspections = useMemo(() => {
    if (!search.trim()) return inspections;
    const lower = search.toLowerCase();
    return inspections.filter(
      (i) =>
        i.operationCode.toLowerCase().includes(lower) ||
        i.inspectionCode.toLowerCase().includes(lower) ||
        i.type.toLowerCase().includes(lower)
    );
  }, [search, inspections]);

  const totalPages = Math.ceil(filteredInspections.length / itemsPerPage);
  const paginatedInspections = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredInspections.slice(start, start + itemsPerPage);
  }, [filteredInspections, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f5f5] text-[#111827] dark:bg-[#0f1923] dark:text-[#f3f4f6]">
<main className="container mx-auto flex flex-grow flex-col items-center justify-center px-4 py-8">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#003d6b] border-t-transparent" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5] text-[#111827] dark:bg-[#0f1923] dark:text-[#f3f4f6]">
<main className="container mx-auto flex flex-grow flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="mb-8 text-3xl font-bold text-[#003d6b] dark:text-white">Inspecciones Realizadas</h1>
          <section className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
              <input
                type="text"
                className="w-full rounded-lg border border-[#ddd] bg-white py-3 pl-12 pr-4 text-sm text-[#111827] shadow-sm focus:border-[#f97316] focus:outline-none focus:ring-[#f97316]"
                placeholder="Buscar por código de inspección, código de operación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="button" className="flex items-center gap-2 rounded-lg bg-[#003d6b] px-6 py-3 text-white shadow-sm transition-colors hover:bg-[#00538f]">
              <span>☰</span> Filtrar
            </button>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-md dark:bg-[#1a2a3a]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="border-b-2 border-[#e0e0e0] text-left text-sm font-semibold text-[#333]">
                  <tr>
                    <th className="w-12" />
                    <th className="px-2 py-3">Tipo de Inspección</th>
                    <th className="px-2 py-3">Fecha</th>
                    <th className="px-2 py-3">Hora</th>
                    <th className="px-2 py-3">Prioridad</th>
                    <th className="px-2 py-3">Código de Operación</th>
                    <th className="px-2 py-3">Código de Inspección</th>
                    <th className="px-2 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInspections.map((inspection) => {
                    const priority = priorityStyles[inspection.priority] || priorityStyles.Media;
                    const selected = inspection.id === selectedId;
                    return (
                      <tr
                        key={inspection.id}
                        onClick={() => setSelectedId(inspection.id)}
                        className={`cursor-pointer border-b border-[#f0f0f0] hover:bg-[#f9f9f9] ${selected ? "bg-[#fff4e6]" : ""}`}
                      >
                        <td className="px-2 py-4 text-center">
                          <input
                            type="radio"
                            name="inspection"
                            className="h-4 w-4 accent-[#f97316]"
                            checked={selected}
                            onChange={() => setSelectedId(inspection.id)}
                          />
                        </td>
                        <td className="px-2 py-4">{inspection.type}</td>
                        <td className="px-2 py-4">{inspection.date}</td>
                        <td className="px-2 py-4">{inspection.time}</td>
                        <td className="px-2 py-4">
                          <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${priority.bg} ${priority.text}`}>{inspection.priority}</span>
                        </td>
                        <td className="px-2 py-4">{inspection.operationCode}</td>
                        <td className="px-2 py-4">{inspection.inspectionCode}</td>
                        <td className="px-2 py-4">
                          <span className="inline-block rounded-full bg-[#d1fae5] px-3 py-1 text-sm font-semibold text-[#059669]">{inspection.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm text-[#666] sm:flex-row">
              <p>
                Mostrando {paginatedInspections.length} de {filteredInspections.length} inspecciones (Página {page} de {totalPages})
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-10 w-10 rounded-lg border border-[#ddd] hover:border-[#f97316] hover:text-[#f97316] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={`h-10 w-10 rounded-lg border transition-colors ${page === num ? "bg-[#f97316] text-white border-[#f97316]" : "border-[#ddd] hover:border-[#f97316] hover:text-[#f97316]"}`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-10 w-10 rounded-lg border border-[#ddd] hover:border-[#f97316] hover:text-[#f97316] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            </div>
          </section>

          <section className="form-section mt-8 rounded-2xl bg-white p-8 shadow-md dark:bg-[#1a2a3a]">
            <h2 className="mb-6 text-xl font-semibold text-[#003d6b] dark:text-white">
              Registrar Hallazgo para la Inspección {selectedInspection?.inspectionCode ?? ""}
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="form-group flex flex-col">
                  <label className="mb-2 text-sm font-medium text-[#333]">Tipo de Hallazgo</label>
                  <select
                    className="rounded-lg border border-[#ddd] bg-white px-4 py-3 text-sm focus:border-[#f97316] focus:outline-none focus:ring-[#f97316]"
                    value={tipoHallazgo}
                    onChange={(e) => setTipoHallazgo(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposHallazgo.map((t) => (
                      <option key={t.id_tipo_hallazgo} value={t.id_tipo_hallazgo}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group flex flex-col">
                  <label className="mb-2 text-sm font-medium text-[#333]">Nivel de Gravedad</label>
                  <select
                    className="rounded-lg border border-[#ddd] bg-white px-4 py-3 text-sm focus:border-[#f97316] focus:outline-none focus:ring-[#f97316]"
                    value={nivelGravedad}
                    onChange={(e) => setNivelGravedad(Number(e.target.value))}
                    required
                  >
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group flex flex-col">
                <label className="mb-2 text-sm font-medium text-[#333]">Descripción</label>
                <textarea
                  className="min-h-[120px] rounded-lg border border-[#ddd] px-4 py-3 text-sm focus:border-[#f97316] focus:outline-none focus:ring-[#f97316]"
                  placeholder="Describa detalladamente el hallazgo..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                />
              </div>
              <div className="form-group flex flex-col">
                <label className="mb-2 text-sm font-medium text-[#333]">Acción Sugerida</label>
                <textarea
                  className="min-h-[120px] rounded-lg border border-[#ddd] px-4 py-3 text-sm focus:border-[#f97316] focus:outline-none focus:ring-[#f97316]"
                  placeholder="Acción sugerida..."
                  value={accionSugerida}
                  onChange={(e) => setAccionSugerida(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3 text-sm text-[#666] sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Inspección seleccionada: <strong>{selectedInspection?.inspectionCode}</strong>
                </span>
                <div className="flex flex-wrap gap-3">
                  <Link href="/operaciones-maritimas" className="rounded-lg bg-[#e5e7eb] px-5 py-2 font-medium text-[#333] transition-colors hover:bg-[#d1d5db]">
                    Cancelar
                  </Link>
                  <button type="submit" className="rounded-lg bg-[#f97316] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#ea580c]">
                    Registrar Hallazgo
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
