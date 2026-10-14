"use client";

import Image from "next/image";
import Link from "next/link";
import { ContenedoresInfo } from "@/components/operaciones-maritimas/ContenedoresInfo";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Buque = {
    id_buque: string;
    matricula: string;
    nombre: string;
    capacidad: number;
    peso: number | string;
    ubicacion_actual: string | null;
};

type Tripulante = {
    id_tripulante: string;
    empleado: {
        nombre: string;
        apellido: string;
        codigo: string;
    };
    nacionalidad: string;
};

type OperacionFormProps = {
    buque: Buque | null;
    searchParams: {
        id_buque?: string;
        routeId?: string;
        routeCode?: string;
        originName?: string;
        destinationName?: string;
        distance?: string;
        duration?: string;
        originDockCode?: string;
        destinationDockCode?: string;
        contenedores?: string;
        tripulacion?: string;
    };
};

type ToastType = "success" | "error" | "warning";

interface Toast {
    id: number;
    type: ToastType;
    title: string;
    message: string;
}

export default function OperacionForm({ buque, searchParams }: OperacionFormProps) {
    const router = useRouter();
    const [estado, setEstado] = useState("");
    const [estadosDisponibles, setEstadosDisponibles] = useState<{ id_estado_operacion: string; nombre: string }[]>([]);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [tripulacionAsignada, setTripulacionAsignada] = useState<Tripulante[]>([]);
    const [buqueData, setBuqueData] = useState<Buque | null>(buque);
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (type: ToastType, title: string, message: string) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, title, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
    };

    const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

    const idBuque = searchParams.id_buque;
    const routeId = searchParams.routeId;
    const routeCode = searchParams.routeCode ?? "-";
    const routeOriginName = searchParams.originName ?? "-";
    const routeDestinationName = searchParams.destinationName ?? "-";
    const routeDistance = searchParams.distance ?? "-";
    const routeDuration = searchParams.duration ?? "-";
    const routeOriginDockCode = searchParams.originDockCode ?? "-";
    const routeDestinationDockCode = searchParams.destinationDockCode ?? "-";
    const contenedoresSeleccionados = searchParams.contenedores;
    const tripulacionIds = searchParams.tripulacion;

    const routeQuery = new URLSearchParams();
    if (routeId) routeQuery.set("routeId", routeId);
    if (routeCode && routeCode !== "-") routeQuery.set("routeCode", routeCode);
    if (routeOriginName && routeOriginName !== "-") routeQuery.set("originName", routeOriginName);
    if (routeDestinationName && routeDestinationName !== "-")
        routeQuery.set("destinationName", routeDestinationName);
    if (routeDistance && routeDistance !== "-") routeQuery.set("distance", routeDistance);
    if (routeDuration && routeDuration !== "-") routeQuery.set("duration", routeDuration);
    if (routeOriginDockCode && routeOriginDockCode !== "-")
        routeQuery.set("originDockCode", routeOriginDockCode);
    if (routeDestinationDockCode && routeDestinationDockCode !== "-")
        routeQuery.set("destinationDockCode", routeDestinationDockCode);
    if (idBuque) routeQuery.set("id_buque", idBuque);
    if (contenedoresSeleccionados)
        routeQuery.set("contenedores", contenedoresSeleccionados);
    if (tripulacionIds) routeQuery.set("tripulacion", tripulacionIds);

    const cambiarEmbarcacionHref = (() => {
        const qs = routeQuery.toString();
        return qs
            ? `/operaciones-maritimas/nueva/embarcacion?${qs}`
            : "/operaciones-maritimas/nueva/embarcacion";
    })();

    // Fetch available operation states
    useEffect(() => {
        fetch("http://localhost:3001/monitoreo/estados")
            .then((res) => res.json())
            .then((data) => {
                setEstadosDisponibles(data);
                // Seleccionar "Programada" por defecto si existe
                const programada = data.find((e: { nombre: string }) =>
                    e.nombre.toLowerCase() === "programada"
                );
                if (programada) setEstado(programada.nombre);
            })
            .catch((err) => console.error("Error loading estados:", err));
    }, []);

    useEffect(() => {
        if (idBuque) {
            fetch(`http://localhost:3001/monitoreo/buques/${idBuque}`)
                .then((res) => res.ok ? res.json() : null)
                .then((data: Buque | null) => { if (data) setBuqueData(data); })
                .catch((err) => console.error("Error loading buque:", err));
        } else {
            setBuqueData(null);
        }
    }, [idBuque]);

    useEffect(() => {
        if (tripulacionIds) {
            fetch("http://localhost:3001/tripulantes")
                .then((res) => res.json())
                .then((data: Tripulante[]) => {
                    const ids = tripulacionIds.split(",");
                    setTripulacionAsignada(data.filter((t) => ids.includes(t.id_tripulante)));
                })
                .catch((err) => console.error("Error loading crew:", err));
        }
    }, [tripulacionIds]);

    const vesselNombre = buqueData?.nombre ?? "Sin embarcación seleccionada";
    const vesselMatricula = buqueData?.matricula ?? "-";
    const vesselCapacidad =
        typeof buqueData?.capacidad === "number" ? buqueData?.capacidad.toString() : "-";
    const vesselPeso =
        buqueData?.peso !== undefined && buqueData?.peso !== null
            ? buqueData.peso.toString()
            : "-";
    const vesselUbicacion = buqueData?.ubicacion_actual ?? "-";

    const isFormValid =
        idBuque &&
        buqueData &&
        routeId &&
        contenedoresSeleccionados &&
        tripulacionIds &&
        estado &&
        estado !== "Seleccione estado" &&
        fechaInicio;


    const ejecutarInicioOperacion = async () => {
        setShowConfirmModal(false);

        setLoading(true);
        try {
            // Get dock IDs from the dock codes in URL params
            let idMuelleOrigen = null;
            let idMuelleDestino = null;

            if (routeId) {
                try {
                    const routeRes = await fetch(`http://localhost:3001/monitoreo/rutas-maritimas/${routeId}`);
                    const routeData = await routeRes.json();

                    console.log("Route data:", routeData);
                    console.log("Looking for origin dock code:", routeOriginDockCode);
                    console.log("Looking for destination dock code:", routeDestinationDockCode);

                    // Get docks from origin port and find the one matching the code
                    if (routeData.id_puerto_origen && routeOriginDockCode && routeOriginDockCode !== "-") {
                        const muellesOrigenRes = await fetch(`http://localhost:3001/monitoreo/muelles?puertoId=${routeData.id_puerto_origen}`);
                        const muellesOrigen = await muellesOrigenRes.json();
                        console.log("Available origin docks:", muellesOrigen);
                        const muelleOrigen = muellesOrigen.find((m: any) => m.codigo === routeOriginDockCode);
                        console.log("Found origin dock:", muelleOrigen);
                        if (muelleOrigen) {
                            idMuelleOrigen = muelleOrigen.id_muelle;
                        }
                    }

                    // Get docks from destination port and find the one matching the code
                    if (routeData.id_puerto_destino && routeDestinationDockCode && routeDestinationDockCode !== "-") {
                        const muellesDestinoRes = await fetch(`http://localhost:3001/monitoreo/muelles?puertoId=${routeData.id_puerto_destino}`);
                        const muellesDestino = await muellesDestinoRes.json();
                        console.log("Available destination docks:", muellesDestino);
                        const muelleDestino = muellesDestino.find((m: any) => m.codigo === routeDestinationDockCode);
                        console.log("Found destination dock:", muelleDestino);
                        if (muelleDestino) {
                            idMuelleDestino = muelleDestino.id_muelle;
                        }
                    }
                } catch (err) {
                    console.error("Error fetching route/dock details:", err);
                }
            }

            if (!idMuelleOrigen || !idMuelleDestino) {
                addToast("warning", "Muelles no encontrados", "No se encontraron los muelles seleccionados. Verifique la ruta y los muelles asignados.");
                setLoading(false);
                return;
            }

            const payload = {
                codigo: `OP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 1000)}`,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin || undefined,
                estado_nombre: estado,
                id_buque: idBuque,
                cantidad_contenedores: contenedoresSeleccionados?.split(",").length || 0,
                estatus_navegacion_nombre: "En Puerto",
                porcentaje_trayecto: 0,
                id_ruta_maritima: routeId,
                id_muelle_origen: idMuelleOrigen,
                id_muelle_destino: idMuelleDestino,
                tripulacion_ids: tripulacionIds?.split(",") || [],
                contenedor_ids: contenedoresSeleccionados?.split(",") || [],
            };

            const response = await fetch("http://localhost:3001/gestion-maritima/operaciones-maritimas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                addToast("success", "¡Operación creada!", "La operación marítima fue iniciada con éxito.");
                setTimeout(() => router.push("/operaciones-maritimas"), 1800);
            } else {
                const errorData = await response.json();
                addToast("error", "Error al crear operación", errorData.message || "Error desconocido");
            }
        } catch (error) {
            console.error("Error:", error);
            addToast("error", "Error de conexión", "No se pudo conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    const handleIniciarOperacion = () => setShowConfirmModal(true);

    // El header del módulo lo aporta operaciones-maritimas/layout.tsx (ModuleHeader)
    return (
        <div className="flex min-h-screen flex-col bg-[#f5f7f8] text-gray-900 dark:bg-[#0f1923] dark:text-gray-100">
            {/* ── Toasts ── */}
            <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-80">
                {toasts.map((toast) => {
                    const styles = {
                        success: { bar: "bg-emerald-500", icon: "check_circle", iconColor: "text-emerald-500", bg: "bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-700" },
                        error:   { bar: "bg-red-500",     icon: "cancel",       iconColor: "text-red-500",     bg: "bg-white dark:bg-slate-800 border-red-200 dark:border-red-700"     },
                        warning: { bar: "bg-amber-500",   icon: "warning",      iconColor: "text-amber-500",   bg: "bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-700" },
                    }[toast.type];
                    return (
                        <div key={toast.id} className={`relative flex items-start gap-3 rounded-xl border shadow-xl p-4 pr-10 overflow-hidden animate-[slideIn_0.3s_ease-out] ${styles.bg}`}>
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.bar} rounded-l-xl`} />
                            <span className={`material-symbols-outlined text-2xl mt-0.5 ${styles.iconColor}`}>{styles.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white">{toast.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{toast.message}</p>
                            </div>
                            <button onClick={() => removeToast(toast.id)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* ── Modal de Confirmación ── */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-slate-700 animate-[scaleIn_0.2s_ease-out]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-[#0459af] text-2xl">directions_boat</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirmar operación</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Esta acción no se puede deshacer</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                            ¿Está seguro de que desea iniciar la operación marítima? Se registrarán todos los datos configurados.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={ejecutarInicioOperacion}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#0459af] rounded-lg hover:bg-[#0459af]/90 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">play_arrow</span>
                                Iniciar Operación
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-[#0459af]">
                                    Registro de Operación Marítima
                                </h1>
                                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">
                                            calendar_today
                                        </span>
                                        <span>{new Date().toLocaleDateString()} (Automático)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">
                                            schedule
                                        </span>
                                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Automático)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <span className="font-semibold">Nº Operación:</span>
                                    <span className="bg-gray-200 dark:bg-slate-700 px-3 py-1.5 rounded-md text-xs">
                                        OP-20240521-001 (Automático)
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
                        <div className="xl:col-span-3 space-y-8">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#0459af] text-2xl">
                                        directions_boat
                                    </span>
                                    Información de la Embarcación
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            htmlFor="vessel-name"
                                        >
                                            Nombre
                                        </label>
                                        <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                                            {vesselNombre}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            htmlFor="vessel-id"
                                        >
                                            Número de matrícula/IMO
                                        </label>
                                        <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                                            {vesselMatricula}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            htmlFor="vessel-capacity"
                                        >
                                            Capacidad (TEUs)
                                        </label>
                                        <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                                            {vesselCapacidad}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            htmlFor="vessel-weight"
                                        >
                                            Peso (t)
                                        </label>
                                        <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                                            {vesselPeso}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            htmlFor="vessel-location"
                                        >
                                            Ubicación actual
                                        </label>
                                        <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                                            {vesselUbicacion}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <Link
                                        href={cambiarEmbarcacionHref}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#e6f0fa] text-[#0459af] text-sm font-semibold rounded-lg hover:bg-[#0459af]/20 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            swap_horiz
                                        </span>
                                        Cambiar Embarcación
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#0459af] text-2xl">
                                        list_alt
                                    </span>
                                    Detalles de la Operación
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">
                                            Estado
                                        </label>
                                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-slate-700">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />
                                                Programada
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">El estado inicial siempre es Programada</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            htmlFor="start-time"
                                        >
                                            Fecha y hora estimada de inicio
                                        </label>
                                        <input
                                            className="block w-full rounded-lg bg-[#f5f7f8] dark:bg-slate-700 border-gray-200 dark:border-slate-700 shadow-sm focus:border-[#0459af] focus:ring focus:ring-[#0459af] focus:ring-opacity-50 text-sm py-2.5 px-4"
                                            id="start-time"
                                            type="datetime-local"
                                            value={fechaInicio}
                                            onChange={(e) => setFechaInicio(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            htmlFor="end-time"
                                        >
                                            Fecha y hora estimada de fin
                                        </label>
                                        <input
                                            className="block w-full rounded-lg bg-[#f5f7f8] dark:bg-slate-700 border-gray-200 dark:border-slate-700 shadow-sm focus:border-[#0459af] focus:ring focus:ring-[#0459af] focus:ring-opacity-50 text-sm py-2.5 px-4"
                                            id="end-time"
                                            type="datetime-local"
                                            value={fechaFin}
                                            onChange={(e) => setFechaFin(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="xl:col-span-2 space-y-8">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#0459af] text-2xl">
                                        route
                                    </span>
                                    Ruta Marítima
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            htmlFor="route-code"
                                        >
                                            Código
                                        </label>
                                        <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                                            {routeCode}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            htmlFor="distance"
                                        >
                                            Distancia
                                        </label>
                                        <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                                            {routeDistance}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            htmlFor="origin-port"
                                        >
                                            Puerto de Origen
                                        </label>
                                        <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                                            {routeOriginName}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            htmlFor="origin-dock-route"
                                        >
                                            Muelle de Origen
                                        </label>
                                        <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                                            {routeOriginDockCode}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            htmlFor="destination-port"
                                        >
                                            Puerto de Destino
                                        </label>
                                        <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                                            {routeDestinationName}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            htmlFor="destination-dock-route"
                                        >
                                            Muelle de Destino
                                        </label>
                                        <p className="block w-full rounded-lg bg-gray-100 dark:bg-slate-700 border-transparent px-4 py-2.5 text-sm">
                                            {routeDestinationDockCode}
                                        </p>
                                    </div>
                                    <Link
                                        href={
                                            routeQuery.toString()
                                                ? `/operaciones-maritimas/nueva/ruta?${routeQuery.toString()}`
                                                : "/operaciones-maritimas/nueva/ruta"
                                        }
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#e6f0fa] text-[#0459af] text-sm font-semibold rounded-lg hover:bg-[#0459af]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0459af] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            edit_road
                                        </span>
                                        Modificar Ruta
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#0459af] text-2xl">
                                        groups
                                    </span>
                                    Tripulación Asignada
                                </h2>
                                <div className="space-y-6">
                                    {tripulacionAsignada.length > 0 ? (
                                        <div className="space-y-4">
                                            {tripulacionAsignada.map((tripulante) => (
                                                <div
                                                    key={tripulante.id_tripulante}
                                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-700"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-xs">
                                                            {tripulante.empleado.nombre.charAt(0)}
                                                            {tripulante.empleado.apellido.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {tripulante.empleado.nombre}{" "}
                                                                {tripulante.empleado.apellido}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {tripulante.empleado.codigo} •{" "}
                                                                {tripulante.nacionalidad}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Todavía no se ha asignado tripulación
                                        </p>
                                    )}
                                    <Link
                                        href={
                                            routeQuery.toString()
                                                ? `/operaciones-maritimas/nueva/asignar-tripulacion?${routeQuery.toString()}`
                                                : "/operaciones-maritimas/nueva/asignar-tripulacion"
                                        }
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#e6f0fa] text-[#0459af] text-sm font-semibold rounded-lg hover:bg-[#0459af]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0459af] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            group_add
                                        </span>
                                        <span>
                                            {tripulacionAsignada.length > 0
                                                ? "Modificar Tripulación"
                                                : "Asignar Tripulación"}
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-5">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                <h2 className="text-xl font-semibold flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[#0459af] text-2xl">
                                        view_in_ar
                                    </span>
                                    Información de Contenedores
                                </h2>
                                <Link
                                    href={routeQuery.toString()
                                        ? `/operaciones-maritimas/nueva/contenedores?${routeQuery.toString()}`
                                        : "/operaciones-maritimas/nueva/contenedores"}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#e6f0fa] text-[#0459af] text-sm font-semibold rounded-lg hover:bg-[#0459af]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0459af] transition-colors self-start md:self-center"
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        settings
                                    </span>
                                    Gestionar contenedores
                                </Link>
                            </div>
                            <ContenedoresInfo selectedIdsParam={contenedoresSeleccionados} />
                        </div>
                    </div>

                    <footer className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-end gap-4 xl:col-span-5">
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
                            disabled={!isFormValid || loading}
                            onClick={handleIniciarOperacion}
                        >
                            <span className="material-symbols-outlined text-lg">
                                {loading ? 'hourglass_empty' : 'play_arrow'}
                            </span>
                            {loading ? 'Iniciando...' : 'Iniciar Operación'}
                        </button>
                    </footer>
                </div>
            </main>
        </div>
    );
}
