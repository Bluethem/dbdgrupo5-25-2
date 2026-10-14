"use client";

import { Suspense, useState, useEffect } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Buque = {
  id_buque: string;
  matricula: string;
  nombre: string;
  capacidad: number;
  peso: number | string;
  ubicacion_actual: string | null;
};

type TrabajadorPortuario = {
  id_trabajador_portuario: string;
  empleado: {
    nombre: string;
    apellido: string;
    codigo: string;
  };
  disponibilidad: boolean;
  turno: string;
};

type EquipoPortuario = {
  id_equipo_portuario: string;
  codigo: string;
  capacidad: number;
  tipo_equipo_portuario: string;
  ubicacion?: string;
};

type OperacionPortuariaForm = {
  codigo: string;
  id_buque: string;
  id_puerto: string;
  id_muelle: string;
  id_tipo_operacion_portuaria: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: string;
  trabajadores_asignados: string[];
  equipos_asignados: string[];
};

type NuevaOperacionPortuariaPageProps = {};

function NuevaOperacionPortuariaContent({}: NuevaOperacionPortuariaPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const idBuqueFromParams = searchParams.get('id_buque');

  // Datos del buque
  const [buqueSeleccionado, setBuqueSeleccionado] = useState<Buque | null>(null);
  const [buquesDisponibles, setBuquesDisponibles] = useState<Buque[]>([]);

  // Datos de la operación
  const [puertos, setPuertos] = useState<any[]>([]);
  const [muelles, setMuelles] = useState<any[]>([]);
  const [tiposOperacion, setTiposOperacion] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);

  // Formulario
  const [formData, setFormData] = useState<OperacionPortuariaForm>({
    codigo: "",
    id_buque: "",
    id_puerto: "",
    id_muelle: "",
    id_tipo_operacion_portuaria: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "",
    trabajadores_asignados: [],
    equipos_asignados: [],
  });

  // Personal y equipos asignados
  const [trabajadoresDisponibles, setTrabajadoresDisponibles] = useState<TrabajadorPortuario[]>([]);
  const [equiposDisponibles, setEquiposDisponibles] = useState<EquipoPortuario[]>([]);
  const [trabajadoresAsignados, setTrabajadoresAsignados] = useState<TrabajadorPortuario[]>([]);
  const [equiposAsignados, setEquiposAsignados] = useState<EquipoPortuario[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const loadData = async () => {
      try {
        const [
          buquesRes,
          puertosRes,
          tiposRes,
          estadosRes,
          trabajadoresRes,
          equiposRes,
        ] = await Promise.all([
          fetch(`${baseUrl}/monitoreo/buques`),
          fetch(`${baseUrl}/monitoreo/puertos`),
          fetch(`${baseUrl}/shared/tipos-operacion-portuaria`),
          fetch(`${baseUrl}/monitoreo/estados`),
          fetch(`${baseUrl}/gestion-maritima/trabajadores-portuarios`),
          fetch(`${baseUrl}/gestion-maritima/equipos-portuarios`),
        ]);

        if (buquesRes.ok) setBuquesDisponibles(await buquesRes.json());
        if (puertosRes.ok) setPuertos(await puertosRes.json());
        if (tiposRes.ok) setTiposOperacion(await tiposRes.json());
        if (estadosRes.ok) setEstados(await estadosRes.json());
        if (trabajadoresRes.ok) setTrabajadoresDisponibles(await trabajadoresRes.json());
        if (equiposRes.ok) setEquiposDisponibles(await equiposRes.json());
      } catch (err: any) {
        setError(err.message ?? "Error al cargar datos iniciales");
      }
    };

    loadData();
  }, []);

  // Establecer el buque seleccionado si viene de parámetros
  useEffect(() => {
    if (idBuqueFromParams && buquesDisponibles.length > 0) {
      setFormData((prev) => ({ ...prev, id_buque: idBuqueFromParams }));
    }
  }, [idBuqueFromParams, buquesDisponibles]);

  // Cargar muelles cuando se selecciona un puerto
  useEffect(() => {
    if (formData.id_puerto) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      fetch(`${baseUrl}/monitoreo/muelles?puertoId=${formData.id_puerto}`)
        .then((res) => res.json())
        .then(setMuelles)
        .catch((err) => console.error("Error cargando muelles:", err));
    }
  }, [formData.id_puerto]);

  // Actualizar buque seleccionado
  useEffect(() => {
    if (formData.id_buque) {
      const buque = buquesDisponibles.find((b) => b.id_buque === formData.id_buque);
      setBuqueSeleccionado(buque || null);
    }
  }, [formData.id_buque, buquesDisponibles]);

  // Generar código automático
  useEffect(() => {
    const codigo = `OPP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
      Math.random() * 1000
    ).toString().padStart(3, "0")}`;
    setFormData((prev) => ({ ...prev, codigo }));
  }, []);

  const handleInputChange = (field: keyof OperacionPortuariaForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTrabajadorToggle = (trabajador: TrabajadorPortuario) => {
    const isAssigned = trabajadoresAsignados.some((t) => t.id_trabajador_portuario === trabajador.id_trabajador_portuario);
    
    if (isAssigned) {
      setTrabajadoresAsignados((prev) => prev.filter((t) => t.id_trabajador_portuario !== trabajador.id_trabajador_portuario));
    } else {
      setTrabajadoresAsignados((prev) => [...prev, trabajador]);
    }
  };

  const handleEquipoToggle = (equipo: EquipoPortuario) => {
    const isAssigned = equiposAsignados.some((e) => e.id_equipo_portuario === equipo.id_equipo_portuario);
    
    if (isAssigned) {
      setEquiposAsignados((prev) => prev.filter((e) => e.id_equipo_portuario !== equipo.id_equipo_portuario));
    } else {
      setEquiposAsignados((prev) => [...prev, equipo]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.id_buque || !formData.id_puerto || !formData.id_muelle || !formData.id_tipo_operacion_portuaria || !formData.estado || !formData.fecha_inicio) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    if (!confirm("¿Está seguro de que desea crear la operación portuaria?")) return;

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      const payload = {
        ...formData,
        trabajadores_asignados: trabajadoresAsignados.map((t) => t.id_trabajador_portuario),
        equipos_asignados: equiposAsignados.map((e) => e.id_equipo_portuario),
      };

      const response = await fetch(`${baseUrl}/gestion-portuaria/operaciones-portuarias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Operación portuaria creada con éxito");
        router.push("/operaciones-portuarias");
      } else {
        const errorData = await response.json();
        alert(`Error al crear operación: ${errorData.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const vesselNombre = buqueSeleccionado?.nombre ?? "Sin embarcación seleccionada";
  const vesselMatricula = buqueSeleccionado?.matricula ?? "-";
  const vesselCapacidad = typeof buqueSeleccionado?.capacidad === "number" ? buqueSeleccionado.capacidad.toString() : "-";
  const vesselPeso = buqueSeleccionado?.peso !== undefined && buqueSeleccionado?.peso !== null ? buqueSeleccionado.peso.toString() : "-";
  const vesselUbicacion = buqueSeleccionado?.ubicacion_actual ?? "-";

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7f8] text-gray-900 dark:bg-[#0f1923] dark:text-gray-100">
<main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#0459af]">
                  Registro de Operación Portuaria
                </h1>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                    <span>{new Date().toLocaleDateString()} (Automático)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Automático)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="font-semibold">Nº Operación:</span>
                  <span className="bg-gray-200 dark:bg-slate-700 px-3 py-1.5 rounded-md text-xs">
                    {formData.codigo}
                  </span>
                </span>
                <Image
                  alt="User avatar"
                  className="h-10 w-10 rounded-full"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2dLT5BTromXioK4wV6ALN_C3AVwem9YEyECyzr_g3OdNVYl29mRg_6k022s4sGJGUPmlez7iw5trFen4hklRqRY85XMGGVh1bNX5XfDzQ5fAFGB3xTSrFmpQYHAnVxdP-ofkPK6KDtFp6o_NBTU64w2YgfwgxNgV6QaQKq6po2IH5eLSanYNkRWZVsgrJz6qYh44KXZ_LDkYQPDGqWKsF9hoLNi3Jwdpdey2IzmWgcPLgQxoUG3d4y9Ve9oqaLIcQAdurOi2jYSzJ"
                  height={40}
                  width={40}
                />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Parte Izquierda - Personal y Equipo Asignado */}
            <div className="xl:col-span-3 space-y-8">
              {/* Personal Asignado */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#0459af] text-2xl">groups</span>
                    Personal Asignado
                  </h2>
                  <Link
                    href="/operaciones-portuarias/nueva/asignar-personal"
                    className="flex items-center gap-2 px-4 py-2 bg-[#0459af] text-white text-sm font-semibold rounded-lg hover:bg-[#0459af]/90 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      person_add
                    </span>
                    Asignar
                  </Link>
                </div>
                
                <div className="space-y-4">
                  <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 dark:border-slate-700 rounded-lg p-3">
                    {Array.isArray(trabajadoresDisponibles) && trabajadoresDisponibles.length > 0 ? (
                      trabajadoresDisponibles.map((trabajador) => {
                        const isAssigned = trabajadoresAsignados.some((t) => t.id_trabajador_portuario === trabajador.id_trabajador_portuario);
                        return (
                          <div
                            key={trabajador.id_trabajador_portuario}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                              isAssigned
                                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                                : "bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700"
                            }`}
                            onClick={() => handleTrabajadorToggle(trabajador)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-xs">
                                {trabajador.empleado.nombre.charAt(0)}
                                {trabajador.empleado.apellido.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {trabajador.empleado.nombre} {trabajador.empleado.apellido}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {trabajador.empleado.codigo} • Turno: {trabajador.turno}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                trabajador.disponibilidad
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}>
                                {trabajador.disponibilidad ? "Disponible" : "No disponible"}
                              </span>
                              <span className={`material-symbols-outlined text-lg ${
                                isAssigned ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                              }`}>
                                {isAssigned ? "check_circle" : "radio_button_unchecked"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                        No hay trabajadores portuarios disponibles
                      </p>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Seleccionados: {trabajadoresAsignados.length} trabajador(es)
                  </div>
                </div>
              </div>

              {/* Equipo Portuario Asignado */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#0459af] text-2xl">engineering</span>
                    Equipo Portuario Asignado
                  </h2>
                  <Link
                    href="/operaciones-portuarias/nueva/equipos-portuarios"
                    className="flex items-center gap-2 px-4 py-2 bg-[#0459af] text-white text-sm font-semibold rounded-lg hover:bg-[#0459af]/90 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      construction
                    </span>
                    Asignar
                  </Link>
                </div>
                
                <div className="space-y-4">
                  <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 dark:border-slate-700 rounded-lg p-3">
                    {Array.isArray(equiposDisponibles) && equiposDisponibles.length > 0 ? (
                      equiposDisponibles.map((equipo) => {
                        const isAssigned = equiposAsignados.some((e) => e.id_equipo_portuario === equipo.id_equipo_portuario);
                        return (
                          <div
                            key={equipo.id_equipo_portuario}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                              isAssigned
                                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                                : "bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700"
                            }`}
                            onClick={() => handleEquipoToggle(equipo)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold text-xs">
                                {equipo.codigo.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {equipo.codigo}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {equipo.tipo_equipo_portuario} • Capacidad: {equipo.capacidad}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {equipo.ubicacion && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {equipo.ubicacion}
                                </span>
                              )}
                              <span className={`material-symbols-outlined text-lg ${
                                isAssigned ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                              }`}>
                                {isAssigned ? "check_circle" : "radio_button_unchecked"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                        No hay equipos portuarios disponibles
                      </p>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Seleccionados: {equiposAsignados.length} equipo(s)
                  </div>
                </div>
              </div>
            </div>

            {/* Parte Derecha - Información de Embarcación y Detalles de Operación */}
            <div className="xl:col-span-2 space-y-8">
              {/* Información de la Embarcación */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#0459af] text-2xl">directions_boat</span>
                  Información de la Embarcación
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Embarcación</label>
                    <div className="flex gap-2">
                      <select
                        value={formData.id_buque}
                        onChange={(e) => handleInputChange("id_buque", e.target.value)}
                        className="flex-1 rounded-lg bg-[#f5f7f8] dark:bg-slate-700 border-gray-200 dark:border-slate-700 shadow-sm focus:border-[#0459af] focus:ring focus:ring-[#0459af] focus:ring-opacity-50 text-sm py-2.5 px-4"
                      >
                        <option value="">Seleccione una embarcación</option>
                        {Array.isArray(buquesDisponibles) && buquesDisponibles.map((buque) => (
                          <option key={buque.id_buque} value={buque.id_buque}>
                            {buque.nombre} ({buque.matricula})
                          </option>
                        ))}
                      </select>
                      <Link
                        href="/operaciones-portuarias/nueva/seleccionar-buque"
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#e6f0fa] text-[#0459af] text-sm font-semibold rounded-lg hover:bg-[#0459af]/20 transition-colors whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-lg">
                          search
                        </span>
                        Buscar
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre</label>
                      <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                        {vesselNombre}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Matrícula</label>
                      <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                        {vesselMatricula}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Capacidad (TEUs)</label>
                      <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                        {vesselCapacidad}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Peso (t)</label>
                      <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                        {vesselPeso}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ubicación actual</label>
                    <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                      {vesselUbicacion}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles de la Operación */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#0459af] text-2xl">list_alt</span>
                  Detalles de la Operación
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Puerto</label>
                    <select
                      value={formData.id_puerto}
                      onChange={(e) => handleInputChange("id_puerto", e.target.value)}
                      className="block w-full rounded-lg bg-[#f5f7f8] dark:bg-slate-700 border-gray-200 dark:border-slate-700 shadow-sm focus:border-[#0459af] focus:ring focus:ring-[#0459af] focus:ring-opacity-50 text-sm py-2.5 px-4"
                    >
                      <option value="">Seleccione un puerto</option>
                      {Array.isArray(puertos) && puertos.map((puerto) => (
                        <option key={puerto.id_puerto} value={puerto.id_puerto}>
                          {puerto.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Muelle</label>
                    <select
                      value={formData.id_muelle}
                      onChange={(e) => handleInputChange("id_muelle", e.target.value)}
                      disabled={!formData.id_puerto}
                      className="block w-full rounded-lg bg-[#f5f7f8] dark:bg-slate-700 border-gray-200 dark:border-slate-700 shadow-sm focus:border-[#0459af] focus:ring focus:ring-[#0459af] focus:ring-opacity-50 text-sm py-2.5 px-4 disabled:opacity-50"
                    >
                      <option value="">Seleccione un muelle</option>
                      {Array.isArray(muelles) && muelles.map((muelle) => (
                        <option key={muelle.id_muelle} value={muelle.id_muelle}>
                          {muelle.nombre} ({muelle.codigo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Operación</label>
                    <select
                      value={formData.id_tipo_operacion_portuaria}
                      onChange={(e) => handleInputChange("id_tipo_operacion_portuaria", e.target.value)}
                      className="block w-full rounded-lg bg-[#f5f7f8] dark:bg-slate-700 border-gray-200 dark:border-slate-700 shadow-sm focus:border-[#0459af] focus:ring focus:ring-[#0459af] focus:ring-opacity-50 text-sm py-2.5 px-4"
                    >
                      <option value="">Seleccione un tipo</option>
                      {Array.isArray(tiposOperacion) && tiposOperacion.map((tipo) => (
                        <option key={tipo.id_tipo_operacion_portuaria} value={tipo.id_tipo_operacion_portuaria}>
                          {tipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => handleInputChange("estado", e.target.value)}
                      className="block w-full rounded-lg bg-[#f5f7f8] dark:bg-slate-700 border-gray-200 dark:border-slate-700 shadow-sm focus:border-[#0459af] focus:ring focus:ring-[#0459af] focus:ring-opacity-50 text-sm py-2.5 px-4"
                    >
                      <option value="">Seleccione un estado</option>
                      {Array.isArray(estados) && estados.map((estado) => (
                        <option key={estado.id_estado_operacion} value={estado.nombre}>
                          {estado.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha y hora de inicio</label>
                    <input
                      type="datetime-local"
                      value={formData.fecha_inicio}
                      onChange={(e) => handleInputChange("fecha_inicio", e.target.value)}
                      className="block w-full rounded-lg bg-[#f5f7f8] dark:bg-slate-700 border-gray-200 dark:border-slate-700 shadow-sm focus:border-[#0459af] focus:ring focus:ring-[#0459af] focus:ring-opacity-50 text-sm py-2.5 px-4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha y hora de fin (opcional)</label>
                    <input
                      type="datetime-local"
                      value={formData.fecha_fin || ""}
                      onChange={(e) => handleInputChange("fecha_fin", e.target.value)}
                      className="block w-full rounded-lg bg-[#f5f7f8] dark:bg-slate-700 border-gray-200 dark:border-slate-700 shadow-sm focus:border-[#0459af] focus:ring focus:ring-[#0459af] focus:ring-opacity-50 text-sm py-2.5 px-4"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <footer className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-end gap-4">
            <button
              type="button"
              className="px-6 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              onClick={() => router.back()}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#10b981] text-white text-sm font-bold rounded-lg hover:bg-[#10b981]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10b981] disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
              onClick={handleSubmit}
            >
              <span className="material-symbols-outlined text-lg">
                {loading ? 'hourglass_empty' : 'save'}
              </span>
              {loading ? 'Guardando...' : 'Crear Operación'}
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default function NuevaOperacionPortuariaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5f7f8] dark:bg-[#0f1923]">
          Cargando datos de la nueva operación portuaria...
        </div>
      }
    >
      <NuevaOperacionPortuariaContent />
    </Suspense>
  );
}