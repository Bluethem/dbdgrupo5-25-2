"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { tiposIncidenciaAPI, TipoIncidencia } from "@/lib/api/tipos-incidencia";
import { incidenciasAPI } from "@/lib/api/incidencias";
import { useAuth } from "@/context/AuthContext";

const defaultOperation = "OP-2024-002";

function NuevaIncidenciaContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { token } = useAuth();
  const operationCode = useMemo(
    () => params.get("op") ?? defaultOperation,
    [params],
  );
  const [tiposIncidencia, setTiposIncidencia] = useState<TipoIncidencia[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  // Form State
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(3);
  const [selectedTipoId, setSelectedTipoId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const tipos = await tiposIncidenciaAPI.getTipos();
        setTiposIncidencia(tipos);
        if (tipos.length > 0) {
          setSelectedTipoId(tipos[0].id_tipo_incidencia);
        }
      } catch (error) {
        console.error("Error fetching incident types:", error);
      } finally {
        setLoadingTipos(false);
      }
    };

    fetchTipos();
  }, []);

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert("Por favor ingrese una descripción");
      return;
    }
    if (!selectedTipoId) {
      alert("Por favor seleccione un tipo de incidencia");
      return;
    }
    if (!token) {
      alert("No hay sesión activa. Por favor inicie sesión.");
      return;
    }

    setSubmitting(true);
    try {
      await incidenciasAPI.create({
        codigo_operacion: operationCode,
        descripcion: description,
        grado_severidad: severity,
        id_tipo_incidencia: selectedTipoId,
      }, token);
      alert("Incidencia registrada correctamente");
      router.push(`/operaciones-maritimas/incidencias?op=${operationCode}`);
    } catch (error: any) {
      console.error("Error creating incident:", error);
      alert(error.message || "Error al registrar la incidencia");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#111827] dark:bg-[#0f1923] dark:text-[#f3f4f6]">
<main className="container mx-auto flex flex-grow flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <header className="mb-8">
            <h2 className="text-3xl font-bold">Agregar Incidencia</h2>
            <p className="mt-1 text-[#6b7280] dark:text-[#9ca3af]">
              Operación:{" "}
              <span className="font-semibold text-[#111827] dark:text-[#f3f4f6]">
                {operationCode}
              </span>{" "}
              | Gestiona las{" "}
              <span className="text-[#f97316] underline decoration-[#f97316]/50 decoration-2 underline-offset-2">
                operaciones marítimas
              </span>
              .
            </p>
          </header>

          <section className="rounded-xl border border-[#e5e7eb] bg-white shadow-md dark:border-[#374151] dark:bg-[#1a2a3a]">
            <div className="p-6 sm:p-8">
              <h3 className="mb-6 text-xl font-semibold">
                Formulario de Registro de Incidencia
              </h3>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-[#6b7280] dark:text-[#9ca3af]"
                  >
                    Descripción de la Incidencia
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describa detalladamente la incidencia..."
                    className="mt-1 block w-full rounded-lg border border-[#e5e7eb] bg-[#f5f7f8] text-sm text-[#111827] shadow-sm focus:border-[#0459af] focus:outline-none focus:ring-[#0459af] dark:border-[#374151] dark:bg-[#0f1923] dark:text-[#f3f4f6]"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#6b7280] dark:text-[#9ca3af]">
                    Grado de Severidad (1 - 5)
                  </p>
                  <div className="mt-2 flex gap-4">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <label key={level} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="severity"
                          value={level}
                          checked={severity === level}
                          onChange={() => setSeverity(level)}
                          className="h-4 w-4 border-[#e5e7eb] text-[#0459af] focus:ring-[#0459af] dark:border-[#374151]"
                        />
                        <span className="text-sm font-medium text-[#111827] dark:text-[#f3f4f6]">
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="incidence-type"
                    className="block text-sm font-medium text-[#6b7280] dark:text-[#9ca3af]"
                  >
                    Tipo de Incidencia
                  </label>
                  <select
                    id="incidence-type"
                    name="incidence-type"
                    value={selectedTipoId}
                    onChange={(e) => setSelectedTipoId(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-[#e5e7eb] bg-[#f5f7f8] text-sm text-[#111827] shadow-sm focus:border-[#0459af] focus:outline-none focus:ring-[#0459af] dark:border-[#374151] dark:bg-[#0f1923] dark:text-[#f3f4f6]"
                    disabled={loadingTipos}
                  >
                    {loadingTipos ? (
                      <option>Cargando tipos de incidencia...</option>
                    ) : tiposIncidencia.length > 0 ? (
                      tiposIncidencia.map((tipo) => (
                        <option key={tipo.id_tipo_incidencia} value={tipo.id_tipo_incidencia}>
                          {tipo.nombre}
                        </option>
                      ))
                    ) : (
                      <option value="">No hay tipos de incidencia disponibles</option>
                    )}
                  </select>
                </div>
              </form>
            </div>

            <div className="rounded-b-xl border-t border-[#e5e7eb] bg-[#f5f7f8] px-6 py-4 text-sm text-[#6b7280] dark:border-[#374151] dark:bg-[#0f1923] dark:text-[#9ca3af] sm:px-8">
              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                <p>
                  <span className="font-medium text-[#111827] dark:text-[#f3f4f6]">
                    Fecha y Hora:
                  </span>{" "}
                  {new Date().toLocaleString()}
                </p>
                <p>
                  <span className="font-medium text-[#111827] dark:text-[#f3f4f6]">
                    Registrado por:
                  </span>{" "}
                  Juan Perez (Administrador)
                </p>
              </div>
            </div>
          </section>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end sm:space-x-4 sm:space-y-0">
            <Link
              href={`/operaciones-maritimas/incidencias?op=${operationCode}`}
              className="rounded-lg border border-[#e5e7eb] px-6 py-2 text-center text-sm font-semibold text-[#111827] transition-colors hover:bg-[#f5f7f8] dark:border-[#374151] dark:text-[#f3f4f6] dark:hover:bg-[#25384f]"
            >
              Volver a Operación
            </Link>
            <Link
              href="/operaciones-maritimas"
              className="rounded-lg border border-[#e5e7eb] px-6 py-2 text-center text-sm font-semibold text-[#991b1b] transition-colors hover:bg-[#fee2e2]/60 dark:border-[#374151] dark:text-[#fecaca] dark:hover:bg-[#991b1b]/30"
            >
              Cancelar
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-[#0459af] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0459af]/90 disabled:opacity-50"
            >
              {submitting ? "Registrando..." : "Registrar Incidencia"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function NuevaIncidenciaPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando...</div>}>
      <NuevaIncidenciaContent />
    </Suspense>
  );
}
