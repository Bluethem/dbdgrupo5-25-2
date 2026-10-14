"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "leaflet/dist/leaflet.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Puerto = {
  id_puerto: string;
  nombre: string;
  pais: string;
  codigo?: string;
};

type Muelle = {
  id_muelle: string;
  codigo: string;
  id_puerto: string;
};

type RutaMapaPuerto = {
  tipo: "origen" | "intermedio" | "destino";
  nombre: string;
  direccion?: string;
  lat?: number;
  lng?: number;
};

type RutaMapaDetalle = {
  id: string;
  codigo: string;
  puertos: RutaMapaPuerto[];
  distancia?: string | number;
  duracion?: string | number;
};

// Coordenadas geográficas exactas de los 20 puertos del sistema
const PUERTOS_GEO: Record<string, { lat: number; lng: number }> = {
  // Por UUID
  "23c762eb-3e3f-43a3-aa10-4844f7c1223d": { lat: 51.2605, lng: 4.4028 }, // Amberes (Bélgica)
  "e1893efa-10e7-4d41-9d07-21bfddac221b": { lat: 10.9878, lng: -74.7889 }, // Barranquilla (Colombia)
  "81d6c6f5-1e50-42aa-861b-62b89b52fb06": { lat: -34.5847, lng: -58.3712 }, // Buenos Aires (Argentina)
  "f7c2ebb4-01d6-4bd0-8aae-39d84af2a5d0": { lat: -12.0565, lng: -77.1478 }, // Callao (Perú)
  "a2353003-5d33-41f2-9c80-564190bafd62": { lat: 10.4002, lng: -75.5341 }, // Cartagena (Colombia)
  "11e33743-4610-4430-8bf4-7c2c74650a64": { lat: -2.2778, lng: -79.9000 }, // Guayaquil (Ecuador)
  "61db822b-1e33-4abb-add8-c4364ed84142": { lat: 53.5353, lng: 9.9872 }, // Hamburgo (Alemania)
  "b5b57289-cf95-4591-9faa-6f98830586d2": { lat: 33.7432, lng: -118.2673 }, // Los Ángeles (USA)
  "698287de-e883-4658-94fc-d9ef4df808f7": { lat: -0.9500, lng: -80.7333 }, // Manta (Ecuador)
  "8417e903-0b9e-477d-a2ef-bac4d1f422b7": { lat: 25.7781, lng: -80.1794 }, // Miami (USA)
  "d8fe8c43-e303-4200-b3a5-237449ec1ad3": { lat: -34.9059, lng: -56.2132 }, // Montevideo (Uruguay)
  "bff06baa-ce29-42cc-891d-d4527288fbcb": { lat: 8.9566, lng: -79.5667 }, // Balboa (Panamá)
  "01645782-8c65-4173-ba91-73b656a6477b": { lat: -5.0892, lng: -81.1077 }, // Paita (Perú)
  "27ac4d24-86cb-4133-a444-4cbf769cc7b6": { lat: -22.8959, lng: -43.1822 }, // Río de Janeiro (Brasil)
  "8efc50a2-c61c-4fdf-9c9a-ceedf1cec007": { lat: 51.9244, lng: 4.4777 }, // Rotterdam (Holanda)
  "c543cd11-092a-4dc2-92d5-e8cacffcd9aa": { lat: -33.5933, lng: -71.6194 }, // San Antonio (Chile)
  "3745a03e-b78a-4101-ac41-6a56a1ec7b07": { lat: 31.2304, lng: 121.4737 }, // Shanghái (China)
  "884912d3-8534-4f32-8627-cf7d1e3299d5": { lat: 1.2644, lng: 103.8400 }, // Singapur (Singapur)
  "5743ea80-6caa-4de1-b393-eed9bf3bd4e0": { lat: -23.9618, lng: -46.3072 }, // Santos (Brasil)
  "0a40fbaa-38cd-4918-94a8-9a5e652da89f": { lat: -33.0360, lng: -71.6296 }, // Valparaíso (Chile)

  // Por nombre normalizado
  "callao": { lat: -12.0565, lng: -77.1478 },
  "paita": { lat: -5.0892, lng: -81.1077 },
  "valparaiso": { lat: -33.0360, lng: -71.6296 },
  "san antonio": { lat: -33.5933, lng: -71.6194 },
  "buenos aires": { lat: -34.5847, lng: -58.3712 },
  "montevideo": { lat: -34.9059, lng: -56.2132 },
  "santos": { lat: -23.9618, lng: -46.3072 },
  "rio de janeiro": { lat: -22.8959, lng: -43.1822 },
  "cartagena": { lat: 10.4002, lng: -75.5341 },
  "barranquilla": { lat: 10.9878, lng: -74.7889 },
  "guayaquil": { lat: -2.2778, lng: -79.9000 },
  "manta": { lat: -0.9500, lng: -80.7333 },
  "balboa": { lat: 8.9566, lng: -79.5667 },
  "los angeles": { lat: 33.7432, lng: -118.2673 },
  "miami": { lat: 25.7781, lng: -80.1794 },
  "hamburgo": { lat: 53.5353, lng: 9.9872 },
  "rotterdam": { lat: 51.9244, lng: 4.4777 },
  "amberes": { lat: 51.2605, lng: 4.4028 },
  "shanghai": { lat: 31.2304, lng: 121.4737 },
  "singapur": { lat: 1.2644, lng: 103.8400 },
};

function getPuertoCoords(puerto: { id_puerto?: string; nombre?: string }): { lat: number; lng: number } | null {
  if (puerto.id_puerto && PUERTOS_GEO[puerto.id_puerto]) {
    return PUERTOS_GEO[puerto.id_puerto];
  }
  if (puerto.nombre) {
    const clean = puerto.nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace("puerto del ", "")
      .replace("puerto de ", "")
      .trim();

    if (PUERTOS_GEO[clean]) return PUERTOS_GEO[clean];
    for (const key of Object.keys(PUERTOS_GEO)) {
      if (clean.includes(key) || key.includes(clean)) return PUERTOS_GEO[key];
    }
  }
  return null;
}

// Ordena las escalas intermedias desde el origen hacia el destino y descarta escalas duplicadas o que coincidan con origen/destino
function orderRoutePoints(
  rawPoints: { tipo: "origen" | "intermedio" | "destino"; nombre: string; direccion: string; lat: number; lng: number }[]
) {
  const origen = rawPoints.find((p) => p.tipo === "origen");
  const destino = rawPoints.find((p) => p.tipo === "destino");

  if (!origen || !destino) return rawPoints;

  const norm = (s: string) => s.toLowerCase().replace(/puerto\s+(de\s+|del\s+)?/gi, "").trim();
  const origenKey = norm(origen.nombre);
  const destinoKey = norm(destino.nombre);

  const seen = new Set<string>();
  seen.add(origenKey);
  seen.add(destinoKey);

  const escalasValidas: typeof rawPoints = [];
  for (const p of rawPoints) {
    if (p.tipo === "intermedio") {
      const key = norm(p.nombre);
      const isOriginCoord = Math.hypot(p.lat - origen.lat, p.lng - origen.lng) < 0.1;
      const isDestCoord = Math.hypot(p.lat - destino.lat, p.lng - destino.lng) < 0.1;

      if (!seen.has(key) && !isOriginCoord && !isDestCoord) {
        seen.add(key);
        escalasValidas.push(p);
      }
    }
  }

  if (escalasValidas.length === 0) {
    return [origen, destino];
  }

  // Ordenar las escalas según avance progresivo desde origen hacia destino
  escalasValidas.sort((a, b) => {
    const distA = Math.hypot(a.lat - origen.lat, a.lng - origen.lng);
    const distB = Math.hypot(b.lat - origen.lat, b.lng - origen.lng);
    return distA - distB;
  });

  return [origen, ...escalasValidas, destino];
}

// Waypoints de aproximación costera mar adentro para cada puerto.
// Evitan que la línea de ruta cruce tierra al acercarse al puerto.
const PORT_APPROACH_WAYPOINTS: Record<string, [number, number][]> = {
  // Paita (Perú) — salida/entrada por el Pacífico, bordeando Talara al norte
  "01645782-8c65-4173-ba91-73b656a6477b": [[-4.9, -81.5]],
  // Callao (Perú) — punto mar adentro al oeste de Lima
  "f7c2ebb4-01d6-4bd0-8aae-39d84af2a5d0": [[-12.1, -77.6]],
  // Guayaquil (Ecuador) — golfo de Guayaquil, salida al Pacífico
  "11e33743-4610-4430-8bf4-7c2c74650a64": [[-2.5, -80.8]],
  // Manta (Ecuador) — punto mar adentro al oeste
  "698287de-e883-4658-94fc-d9ef4df808f7": [[-0.9, -81.4]],
  // Balboa (Panamá) — acceso por el Pacífico al canal
  "bff06baa-ce29-42cc-891d-d4527288fbcb": [[8.9, -79.5]],
  // Cartagena (Colombia) — acceso al Caribe, norte de la ciudad
  "a2353003-5d33-41f2-9c80-564190bafd62": [[11.0, -75.8]],
  // Barranquilla (Colombia) — boca del río Magdalena al Caribe
  "e1893efa-10e7-4d41-9d07-21bfddac221b": [[11.2, -74.9]],
  // San Antonio (Chile) — punto al oeste
  "c543cd11-092a-4dc2-92d5-e8cacffcd9aa": [[-33.6, -72.2]],
  // Valparaíso (Chile) — punto al oeste
  "0a40fbaa-38cd-4918-94a8-9a5e652da89f": [[-33.1, -72.2]],
  // Hamburgo (Alemania) — salida al Mar del Norte por el río Elba
  "61db822b-1e33-4abb-add8-c4364ed84142": [[54.2, 8.5]],
  // Rotterdam (Holanda) — salida al Mar del Norte
  "8efc50a2-c61c-4fdf-9c9a-ceedf1cec007": [[52.0, 4.0]],
  // Amberes (Bélgica) — salida al Mar del Norte vía Escalda
  "23c762eb-3e3f-43a3-aa10-4844f7c1223d": [[51.6, 3.5]],
  // Miami (USA) — salida al Atlántico por el estrecho de Florida
  "8417e903-0b9e-477d-a2ef-bac4d1f422b7": [[25.8, -79.9]],
  // Los Ángeles (USA) — punto al suroeste en el Pacífico
  "b5b57289-cf95-4591-9faa-6f98830586d2": [[33.5, -119.0]],
  // Buenos Aires (Argentina) — salida al Río de la Plata y Atlántico
  "81d6c6f5-1e50-42aa-861b-62b89b52fb06": [[-35.5, -56.5]],
  // Montevideo (Uruguay) — boca del Río de la Plata
  "d8fe8c43-e303-4200-b3a5-237449ec1ad3": [[-35.2, -55.5]],
  // Santos (Brasil) — punto al sureste
  "5743ea80-6caa-4de1-b393-eed9bf3bd4e0": [[-24.3, -45.5]],
  // Río de Janeiro (Brasil) — punto al sureste
  "27ac4d24-86cb-4133-a444-4cbf769cc7b6": [[-23.2, -42.5]],
  // Shanghái (China) — salida al Mar de la China Oriental
  "3745a03e-b78a-4101-ac41-6a56a1ec7b07": [[31.0, 122.8]],
  // Singapur — estrecho de Malacca al oeste
  "884912d3-8534-4f32-8627-cf7d1e3299d5": [[1.1, 103.6]],
};

// Waypoints fijos de tránsito por el Canal de Panamá (Pacífico → Atlántico o viceversa)
const PANAMA_CANAL_WAYPOINTS: [number, number][] = [
  [8.9, -79.5],  // Entrada Pacífico (Balboa)
  [9.1, -79.7],  // Zona del canal central
  [9.3, -79.9],  // Entrada Atlántico (Colón)
];

// Determina si una longitud corresponde al Pacífico Este (< -77) o al Atlántico/Caribe/Mediterráneo (> -77)
function isPacificEast(lng: number): boolean {
  return lng < -77;
}

// Inserta waypoints de aproximación costera y, si aplica, el Canal de Panamá entre dos puntos consecutivos
function getMaritimeWaypoints(
  fromId: string,
  toId: string,
  fromCoords: [number, number],
  toCoords: [number, number]
): [number, number][] {
  const waypoints: [number, number][] = [];

  // Waypoints de salida del puerto origen (al mar)
  const fromApproach = PORT_APPROACH_WAYPOINTS[fromId] ?? [];
  // Waypoints de llegada al puerto destino (desde el mar)
  const toApproach = PORT_APPROACH_WAYPOINTS[toId] ?? [];

  const fromPacific = isPacificEast(fromCoords[1]);
  const toPacific = isPacificEast(toCoords[1]);

  // Si la ruta cruza entre Pacífico Este y Atlántico/Caribe, insertar Canal de Panamá
  const needsCanal = fromPacific !== toPacific;

  // Construir: [salida costera origen] + [canal si aplica] + [llegada costera destino]
  waypoints.push(...fromApproach);

  if (needsCanal) {
    if (fromPacific) {
      // Pacífico → Atlántico: entrar por Balboa, salir por Colón
      waypoints.push(...PANAMA_CANAL_WAYPOINTS);
    } else {
      // Atlántico → Pacífico: entrar por Colón, salir por Balboa
      waypoints.push(...[...PANAMA_CANAL_WAYPOINTS].reverse());
    }
  }

  waypoints.push(...toApproach);
  return waypoints;
}

// Genera una curva suave entre puertos que simula una derrota de navegación en el océano
function generateMaritimeCurve(points: [number, number][]): [number, number][] {
  if (points.length < 2) return points;
  const detailed: [number, number][] = [];
  const segments = 32;

  for (let i = 0; i < points.length - 1; i++) {
    const [lat1, lng1] = points[i];
    const [lat2, lng2] = points[i + 1];

    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;

    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;

    // Curvatura suave perpendicular simulando derrota marítima
    const perpLat = -dLng * 0.15;
    const perpLng = dLat * 0.15;

    const controlLat = midLat + perpLat;
    const controlLng = midLng + perpLng;

    for (let step = 0; step <= segments; step++) {
      const t = step / segments;
      const oneMinusT = 1 - t;

      const lat =
        oneMinusT * oneMinusT * lat1 +
        2 * oneMinusT * t * controlLat +
        t * t * lat2;

      const lng =
        oneMinusT * oneMinusT * lng1 +
        2 * oneMinusT * t * controlLng +
        t * t * lng2;

      detailed.push([lat, lng]);
    }
  }

  return detailed;
}

function SeleccionRutasMaritimasContent() {
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [puertos, setPuertos] = useState<Puerto[]>([]);
  const [originCountry, setOriginCountry] = useState<string>("");
  const [destinationCountry, setDestinationCountry] = useState<string>("");
  const [originPortId, setOriginPortId] = useState<string>("");
  const [destinationPortId, setDestinationPortId] = useState<string>("");
  const [portsError, setPortsError] = useState<string | null>(null);
  const [originDocks, setOriginDocks] = useState<Muelle[]>([]);
  const [destinationDocks, setDestinationDocks] = useState<Muelle[]>([]);
  const [originDockId, setOriginDockId] = useState<string>("");
  const [destinationDockId, setDestinationDockId] = useState<string>("");
  const [rutaMapa, setRutaMapa] = useState<RutaMapaDetalle | null>(null);
  const [geoPoints, setGeoPoints] = useState<
    { tipo: "origen" | "intermedio" | "destino"; nombre: string; lat: number; lng: number; direccion: string; id_puerto?: string }[]
  >([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRouteIdFromQuery = searchParams.get("routeId");
  const originPortIdFromQuery = searchParams.get("originId");
  const destinationPortIdFromQuery = searchParams.get("destinationId");
  const originNameFromQuery = searchParams.get("originName") || "";
  const destinationNameFromQuery = searchParams.get("destinationName") || "";
  const distanceFromQuery = searchParams.get("distance") || "";
  const durationFromQuery = searchParams.get("duration") || "";
  const idBuque = searchParams.get("id_buque");
  const contenedores = searchParams.get("contenedores");

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any | null>(null);
  const layerGroupRef = useRef<any | null>(null);
  const LRef = useRef<any | null>(null);

  // 1. Cargar lista de puertos
  useEffect(() => {
    const loadPuertos = async () => {
      try {
        const response = await fetch(`${API_URL}/monitoreo/puertos`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setPuertos(data as Puerto[]);
        } else {
          setPuertos([]);
        }
      } catch (error) {
        console.error("Error al cargar puertos:", error);
        setPuertos([]);
      }
    };

    loadPuertos();
  }, []);

  // 2. Inicializar selección si viene por query params
  useEffect(() => {
    if (!puertos.length) return;

    if (originPortIdFromQuery) {
      const originPort = puertos.find((p) => p.id_puerto === originPortIdFromQuery);
      if (originPort) {
        setOriginCountry(originPort.pais);
        setOriginPortId(originPort.id_puerto);
      }
    }

    if (destinationPortIdFromQuery) {
      const destinationPort = puertos.find((p) => p.id_puerto === destinationPortIdFromQuery);
      if (destinationPort) {
        setDestinationCountry(destinationPort.pais);
        setDestinationPortId(destinationPort.id_puerto);
      }
    }
  }, [puertos, originPortIdFromQuery, destinationPortIdFromQuery]);

  // 3. Cargar ruta específica ÚNICAMENTE si viene seleccionada desde la pantalla de resultados (?routeId=...)
  useEffect(() => {
    if (!selectedRouteIdFromQuery) {
      setRutaMapa(null);
      setGeoPoints([]);
      return;
    }

    const loadRutaMapa = async () => {
      try {
        const response = await fetch(`${API_URL}/monitoreo/rutas-maritimas/${selectedRouteIdFromQuery}`);
        if (!response.ok) {
          setRutaMapa(null);
          setGeoPoints([]);
          return;
        }
        const data = (await response.json()) as RutaMapaDetalle | null;
        if (data) {
          setRutaMapa(data);
        }
      } catch (error) {
        console.error("Error al cargar ruta para el mapa:", error);
        setRutaMapa(null);
        setGeoPoints([]);
      }
    };

    loadRutaMapa();
  }, [selectedRouteIdFromQuery]);

  // 6. Convertir los puertos de la ruta en geoPoints usando el diccionario de coordenadas exactas
  useEffect(() => {
    if (!rutaMapa || !rutaMapa.puertos || rutaMapa.puertos.length === 0) {
      setGeoPoints([]);
      return;
    }

    const rawList: {
      tipo: "origen" | "intermedio" | "destino";
      nombre: string;
      direccion: string;
      lat: number;
      lng: number;
      id_puerto?: string;
    }[] = [];

    for (const punto of rutaMapa.puertos) {
      const coords = getPuertoCoords(punto);
      if (coords) {
        rawList.push({
          tipo: punto.tipo,
          nombre: punto.nombre,
          direccion: punto.direccion || "",
          lat: coords.lat,
          lng: coords.lng,
          id_puerto: (punto as any).id_puerto ?? "",
        });
      }
    }

    const ordered = orderRoutePoints(rawList);
    setGeoPoints(ordered);
  }, [rutaMapa]);

  // 7. Inicializar mapa de Leaflet UNA SOLA VEZ
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      if (typeof window === "undefined") return;
      const leaflet = await import("leaflet");
      const L = leaflet.default ?? leaflet;
      LRef.current = L;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!isMounted || !mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [-5, -75], // Centro en Sudamérica/Pacífico
        zoom: 3,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapRef.current = map;

      // Si ya hay puntos calculados, renderizarlos inmediatamente
      renderRouteOnMap(map, layerGroup, L, geoPoints);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 8. Función para dibujar puertos y la LÍNEA ROJA de navegación marítima
  const renderRouteOnMap = (map: any, layerGroup: any, L: any, points: typeof geoPoints) => {
    if (!map || !layerGroup || !L) return;

    layerGroup.clearLayers();

    if (points.length === 0) {
      // Mostrar todos los puertos conocidos como puntos sutiles
      puertos.forEach((p) => {
        const coords = getPuertoCoords(p);
        if (!coords) return;

        const dotIcon = L.divIcon({
          className: "port-dot-marker",
          html: `<div style="
            width: 10px;
            height: 10px;
            background: #002D62;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 4px rgba(0,0,0,0.5);
            cursor: pointer;
          "></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });

        const marker = L.marker([coords.lat, coords.lng], { icon: dotIcon });
        marker.bindPopup(`<b>${p.nombre}</b><br/><span style="color:#666">${p.pais}</span>`);
        marker.addTo(layerGroup);
      });
      return;
    }

    const bounds = L.latLngBounds([]);
    const baseLatLngs: [number, number][] = [];
    const portIds: string[] = [];

    points.forEach((punto) => {
      const isPrincipal = punto.tipo === "origen" || punto.tipo === "destino";
      const markerColor = isPrincipal ? "#002D62" : "#10b981"; // Azul puerto principal, Verde intermedio

      const customIcon = L.divIcon({
        className: "custom-port-marker",
        html: `<div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          background: ${markerColor};
          border: 3px solid #ffffff;
          border-radius: 50%;
          color: #ffffff;
          font-weight: bold;
          font-size: 11px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.45);
        ">
          ${punto.tipo === "origen" ? "O" : punto.tipo === "destino" ? "D" : "E"}
        </div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([punto.lat, punto.lng], { icon: customIcon });

      marker.bindPopup(
        `<div style="font-size: 12px; min-width: 160px;">
          <div style="font-weight: bold; color: #1e293b; margin-bottom: 2px;">${punto.nombre}</div>
          <div style="font-size: 11px; color: ${markerColor}; font-weight: 600; text-transform: uppercase;">
            ${punto.tipo === "origen" ? "Puerto de Origen" : punto.tipo === "destino" ? "Puerto de Destino" : "Escala Intermedia"}
          </div>
          ${punto.direccion ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">${punto.direccion}</div>` : ""}
        </div>`
      );

      marker.addTo(layerGroup);
      bounds.extend([punto.lat, punto.lng]);
      baseLatLngs.push([punto.lat, punto.lng]);
      portIds.push(punto.id_puerto ?? "");
    });

    // TRAZAR LA LÍNEA ROJA DE NAVEGACIÓN MARÍTIMA
    if (baseLatLngs.length >= 2) {
      // Insertar waypoints de derrota marítima (aproximación costera + Canal de Panamá si aplica)
      const expandedLatLngs: [number, number][] = [];
      for (let i = 0; i < baseLatLngs.length; i++) {
        expandedLatLngs.push(baseLatLngs[i]);
        if (i < baseLatLngs.length - 1) {
          const midWaypoints = getMaritimeWaypoints(
            portIds[i] ?? "",
            portIds[i + 1] ?? "",
            baseLatLngs[i],
            baseLatLngs[i + 1]
          );
          expandedLatLngs.push(...midWaypoints);
        }
      }
      const curvedPath = generateMaritimeCurve(expandedLatLngs);

      // Línea roja principal de la ruta
      const polyline = L.polyline(curvedPath, {
        color: "#dc2626", // Rojo brillante (#dc2626 / #ef4444)
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      });
      polyline.addTo(layerGroup);

      // Línea de borde / sombra sutil para resaltar la ruta en cualquier tipo de mapa
      const polylineGlow = L.polyline(curvedPath, {
        color: "#991b1b",
        weight: 7,
        opacity: 0.35,
        lineCap: "round",
        lineJoin: "round",
      });
      polylineGlow.addTo(layerGroup);
      polyline.bringToFront();
    }

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 6);
    } else if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 7 });
    }
  };

  // 9. Actualizar el mapa cuando cambian geoPoints
  useEffect(() => {
    if (mapRef.current && layerGroupRef.current && LRef.current) {
      renderRouteOnMap(mapRef.current, layerGroupRef.current, LRef.current, geoPoints);
    }
  }, [geoPoints]);

  const handleOriginChange = (value: string) => {
    setOriginPortId(value);
    setOriginDockId("");
    setOriginDocks([]);
    if (value && value === destinationPortId) {
      setPortsError("El Puerto de Origen y el Puerto de Destino no pueden ser el mismo.");
    } else {
      setPortsError(null);
    }
  };

  const handleDestinationChange = (value: string) => {
    setDestinationPortId(value);
    setDestinationDockId("");
    setDestinationDocks([]);
    if (value && value === originPortId) {
      setPortsError("El Puerto de Origen y el Puerto de Destino no pueden ser el mismo.");
    } else {
      setPortsError(null);
    }
  };

  // Cargar muelles de origen
  useEffect(() => {
    const loadOriginDocks = async () => {
      if (!originPortId) {
        setOriginDocks([]);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/monitoreo/muelles?puertoId=${originPortId}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setOriginDocks(data as Muelle[]);
        } else {
          setOriginDocks([]);
        }
      } catch (error) {
        console.error("Error al cargar muelles de origen:", error);
        setOriginDocks([]);
      }
    };

    loadOriginDocks();
  }, [originPortId]);

  // Cargar muelles de destino
  useEffect(() => {
    const loadDestinationDocks = async () => {
      if (!destinationPortId) {
        setDestinationDocks([]);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/monitoreo/muelles?puertoId=${destinationPortId}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setDestinationDocks(data as Muelle[]);
        } else {
          setDestinationDocks([]);
        }
      } catch (error) {
        console.error("Error al cargar muelles de destino:", error);
        setDestinationDocks([]);
      }
    };

    loadDestinationDocks();
  }, [destinationPortId]);

  // Nombres actuales seleccionados
  const selectedOrigin = useMemo(
    () => puertos.find((p) => p.id_puerto === originPortId),
    [puertos, originPortId]
  );
  const selectedDestination = useMemo(
    () => puertos.find((p) => p.id_puerto === destinationPortId),
    [puertos, destinationPortId]
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-[#0f1923] dark:text-gray-100">
<main className="flex flex-col flex-1 gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-gray-800 dark:text-gray-100 text-2xl font-bold">
              Selección de Rutas Marítimas
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Operaciones / Planificación / Selección de Rutas Marítimas
            </p>
          </div>
        </div>

        <div className="flex flex-1 gap-6">
          <aside className="flex flex-col w-96 bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex-grow">
              <h3 className="text-gray-800 dark:text-gray-100 text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F98C00]">travel_explore</span>
                Criterios de Búsqueda
              </h3>
              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    htmlFor="origin-country"
                  >
                    País de Origen
                  </label>
                  <select
                    className="form-select w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 shadow-sm focus:border-[#005594] focus:ring focus:ring-[#005594] focus:ring-opacity-50"
                    id="origin-country"
                    value={originCountry}
                    onChange={(e) => {
                      const value = e.target.value;
                      setOriginCountry(value);
                      setOriginPortId("");
                      setOriginDockId("");
                      setOriginDocks([]);
                    }}
                  >
                    <option value="">Seleccionar país de origen</option>
                    {[...new Set(puertos.map((p) => p.pais))].map((pais) => (
                      <option key={pais} value={pais}>
                        {pais}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    htmlFor="origin-port"
                  >
                    Puerto de Origen
                  </label>
                  <select
                    className="form-select w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 shadow-sm focus:border-[#005594] focus:ring focus:ring-[#005594] focus:ring-opacity-50"
                    id="origin-port"
                    value={originPortId}
                    onChange={(e) => handleOriginChange(e.target.value)}
                    disabled={!originCountry}
                  >
                    <option value="">Seleccionar puerto</option>
                    {puertos
                      .filter((puerto) => (originCountry ? puerto.pais === originCountry : true))
                      .map((puerto) => (
                        <option key={puerto.id_puerto} value={puerto.id_puerto}>
                          {puerto.nombre}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    htmlFor="destination-country"
                  >
                    País de Destino
                  </label>
                  <select
                    className="form-select w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 shadow-sm focus:border-[#005594] focus:ring focus:ring-[#005594] focus:ring-opacity-50"
                    id="destination-country"
                    value={destinationCountry}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDestinationCountry(value);
                      setDestinationPortId("");
                      setDestinationDockId("");
                      setDestinationDocks([]);
                    }}
                  >
                    <option value="">Seleccionar país de destino</option>
                    {[...new Set(puertos.map((p) => p.pais))].map((pais) => (
                      <option key={pais} value={pais}>
                        {pais}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    htmlFor="destination-port"
                  >
                    Puerto de Destino
                  </label>
                  <select
                    className="form-select w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 shadow-sm focus:border-[#005594] focus:ring focus:ring-[#005594] focus:ring-opacity-50"
                    id="destination-port"
                    value={destinationPortId}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    disabled={!destinationCountry}
                  >
                    <option value="">Seleccionar puerto</option>
                    {puertos
                      .filter((puerto) => (destinationCountry ? puerto.pais === destinationCountry : true))
                      .map((puerto) => (
                        <option key={puerto.id_puerto} value={puerto.id_puerto}>
                          {puerto.nombre}
                        </option>
                      ))}
                  </select>
                </div>
                {portsError && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {portsError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!originPortId || !destinationPortId || portsError) {
                      return;
                    }
                    const originPort = puertos.find((p) => p.id_puerto === originPortId);
                    const destinationPort = puertos.find((p) => p.id_puerto === destinationPortId);

                    const originName = originPort?.nombre || "";
                    const destinationName = destinationPort?.nombre || "";

                    const params = new URLSearchParams();
                    params.set("originId", originPortId);
                    params.set("destinationId", destinationPortId);
                    params.set("originName", originName);
                    params.set("destinationName", destinationName);
                    if (idBuque) params.set("id_buque", idBuque);
                    if (contenedores) params.set("contenedores", contenedores);

                    router.push(
                      `/operaciones-maritimas/nueva/ruta/resultados?${params.toString()}`
                    );
                  }}
                  className="flex items-center justify-center gap-2 w-full rounded-md h-10 px-4 bg-[#F98C00] text-white text-sm font-bold hover:bg-orange-500 transition-colors mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
                  disabled={!originPortId || !destinationPortId || !!portsError}
                >
                  <span className="material-symbols-outlined">search</span>
                  <span>Buscar rutas</span>
                </button>
              </div>

              <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-4">
                <h4 className="text-gray-800 dark:text-gray-100 text-sm font-semibold mb-3">
                  Selección de muelles
                </h4>
                <div className="flex flex-col gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      htmlFor="origin-dock"
                    >
                      Muelle de Origen
                    </label>
                    <select
                      className="form-select w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 shadow-sm focus:border-[#005594] focus:ring focus:ring-[#005594] focus:ring-opacity-50"
                      id="origin-dock"
                      value={originDockId}
                      onChange={(e) => setOriginDockId(e.target.value)}
                      disabled={!originPortId || originDocks.length === 0}
                    >
                      <option value="">
                        {originDocks.length === 0
                          ? "Sin muelles disponibles"
                          : "Seleccionar muelle de origen"}
                      </option>
                      {originDocks.map((muelle) => (
                        <option key={muelle.id_muelle} value={muelle.id_muelle}>
                          {muelle.codigo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      htmlFor="destination-dock"
                    >
                      Muelle de Destino
                    </label>
                    <select
                      className="form-select w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 shadow-sm focus:border-[#005594] focus:ring focus:ring-[#005594] focus:ring-opacity-50"
                      id="destination-dock"
                      value={destinationDockId}
                      onChange={(e) => setDestinationDockId(e.target.value)}
                      disabled={!destinationPortId || destinationDocks.length === 0}
                    >
                      <option value="">
                        {destinationDocks.length === 0
                          ? "Sin muelles disponibles"
                          : "Seleccionar muelle de destino"}
                      </option>
                      {destinationDocks.map((muelle) => (
                        <option key={muelle.id_muelle} value={muelle.id_muelle}>
                          {muelle.codigo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1 rounded-lg overflow-hidden relative shadow-lg min-h-[500px]">
              <div className="absolute inset-0">
                <div ref={mapContainerRef} className="w-full h-full" />
                {geoPoints.length === 0 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full pointer-events-none z-[1000] shadow-md flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#F98C00]">info</span>
                    Busca y selecciona una ruta en la pantalla de resultados para ver el trazado marítimo.
                  </div>
                )}
              </div>

              {/* Botones de control del mapa */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
                <div className="flex flex-col bg-white dark:bg-slate-800 rounded-md shadow-md">
                  <button
                    type="button"
                    title="Acercar"
                    onClick={() => mapRef.current?.zoomIn()}
                    className="flex size-10 items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-t-md"
                  >
                    <span className="material-symbols-outlined text-2xl">add</span>
                  </button>
                  <button
                    type="button"
                    title="Alejar"
                    onClick={() => mapRef.current?.zoomOut()}
                    className="flex size-10 items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-b-md border-t border-gray-200 dark:border-slate-600"
                  >
                    <span className="material-symbols-outlined text-2xl">remove</span>
                  </button>
                </div>
                <button
                  type="button"
                  title="Centrar ruta"
                  onClick={() => {
                    if (mapRef.current && geoPoints.length >= 2 && LRef.current) {
                      const bounds = LRef.current.latLngBounds(geoPoints.map((p) => [p.lat, p.lng]));
                      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
                    }
                  }}
                  className="flex size-10 items-center justify-center rounded-md bg-white dark:bg-slate-800 shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined text-2xl">navigation</span>
                </button>
              </div>

              {/* Leyenda interactiva */}
              <div className="absolute bottom-20 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-3.5 rounded-lg shadow-md text-xs z-[1000] border border-gray-100 dark:border-slate-700">
                <h4 className="font-bold mb-2 text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#002D62] dark:text-blue-400">legend_toggle</span>
                  Leyenda del mapa
                </h4>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="w-3.5 h-3.5 bg-[#002D62] rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[8px] text-white font-bold">O</span>
                    <span>Puerto Principal (Origen / Destino)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="w-3.5 h-3.5 bg-[#10b981] rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[8px] text-white font-bold">E</span>
                    <span>Puerto Secundario (Escala)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="w-5 h-1.5 bg-[#dc2626] rounded-full shadow-sm"></div>
                    <span className="font-medium text-red-600 dark:text-red-400">Ruta Marítima Activa</span>
                  </div>
                </div>
              </div>

              {/* Acciones flotantes inferiores */}
              <div className="absolute bottom-4 right-4 flex gap-2 z-[1000]">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-bold text-white bg-[#F98C00] rounded-md hover:bg-orange-500 shadow-lg flex items-center gap-1.5 transition-all"
                  onClick={() => {
                    if (!originDockId || !destinationDockId) {
                      if (typeof window !== "undefined") {
                        window.alert(
                          "Debes seleccionar los muelles de origen y destino antes de confirmar la ruta."
                        );
                      }
                      return;
                    }

                    const routeCode = rutaMapa?.codigo ?? "";
                    const distance = distanceFromQuery || "";
                    const duration = durationFromQuery || "";
                    const originDock = originDocks.find((d) => d.id_muelle === originDockId);
                    const destinationDock = destinationDocks.find((d) => d.id_muelle === destinationDockId);
                    const originDockCode = originDock?.codigo ?? "";
                    const destinationDockCode = destinationDock?.codigo ?? "";

                    router.push(
                      `/operaciones-maritimas/nueva?id_buque=${idBuque ?? ""}` +
                      `&contenedores=${encodeURIComponent(contenedores ?? "")}` +
                      `&routeId=${selectedRouteIdFromQuery ?? ""}` +
                      `&routeCode=${encodeURIComponent(routeCode)}` +
                      `&originId=${originPortId ?? originPortIdFromQuery ?? ""}` +
                      `&destinationId=${destinationPortId ?? destinationPortIdFromQuery ?? ""}` +
                      `&originName=${encodeURIComponent(selectedOrigin?.nombre || originNameFromQuery)}` +
                      `&destinationName=${encodeURIComponent(selectedDestination?.nombre || destinationNameFromQuery)}` +
                      `&distance=${encodeURIComponent(distance)}` +
                      `&duration=${encodeURIComponent(duration)}` +
                      `&originDockCode=${encodeURIComponent(originDockCode)}` +
                      `&destinationDockCode=${encodeURIComponent(destinationDockCode)}`
                    );
                  }}
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Confirmar Ruta</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOriginCountry("");
                    setOriginPortId("");
                    setDestinationCountry("");
                    setDestinationPortId("");
                    setOriginDockId("");
                    setDestinationDockId("");
                    setRutaMapa(null);
                    setGeoPoints([]);
                    router.push("/operaciones-maritimas/nueva/ruta");
                  }}
                  className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 shadow-lg transition-all"
                >
                  Limpiar mapa
                </button>
                <Link
                  href={
                    `/operaciones-maritimas/nueva?id_buque=${idBuque ?? ""}` +
                    `&contenedores=${encodeURIComponent(contenedores ?? "")}` +
                    `&routeId=${selectedRouteIdFromQuery ?? ""}` +
                    `&routeCode=${encodeURIComponent(rutaMapa?.codigo ?? "")}` +
                    `&originId=${originPortId ?? originPortIdFromQuery ?? ""}` +
                    `&destinationId=${destinationPortId ?? destinationPortIdFromQuery ?? ""}` +
                    `&originName=${encodeURIComponent(selectedOrigin?.nombre || originNameFromQuery)}` +
                    `&destinationName=${encodeURIComponent(selectedDestination?.nombre || destinationNameFromQuery)}` +
                    `&distance=${encodeURIComponent(distanceFromQuery)}` +
                    `&duration=${encodeURIComponent(durationFromQuery)}`
                  }
                  className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 shadow-lg transition-all"
                >
                  Cancelar
                </Link>
              </div>
            </div>

            {/* Ficha de Información de Ruta Activa */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <details open={isDetailsOpen}>
                <summary
                  className="flex items-center justify-between font-bold text-gray-800 dark:text-gray-100 cursor-pointer select-none"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDetailsOpen(!isDetailsOpen);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F98C00]">route</span>
                    Información de Ruta Activa: {rutaMapa?.codigo ?? "Sin ruta seleccionada"}
                  </span>
                  <span className="material-symbols-outlined">
                    {isDetailsOpen ? "expand_less" : "expand_more"}
                  </span>
                </summary>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="bg-gray-50 dark:bg-slate-700/40 p-2.5 rounded">
                    <strong className="block text-xs text-gray-500 dark:text-gray-400">Origen:</strong>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {selectedOrigin?.nombre || originNameFromQuery || "-"}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/40 p-2.5 rounded">
                    <strong className="block text-xs text-gray-500 dark:text-gray-400">Destino:</strong>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {selectedDestination?.nombre || destinationNameFromQuery || "-"}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/40 p-2.5 rounded">
                    <strong className="block text-xs text-gray-500 dark:text-gray-400">Distancia Total:</strong>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {distanceFromQuery || (rutaMapa?.distancia ? `${rutaMapa.distancia} mn` : "-")}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/40 p-2.5 rounded">
                    <strong className="block text-xs text-gray-500 dark:text-gray-400">Tiempo Estimado:</strong>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {durationFromQuery || (rutaMapa?.duracion ? `${rutaMapa.duracion} hrs` : "-")}
                    </span>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SeleccionRutasMaritimasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0f1923]">
          Cargando rutas marítimas...
        </div>
      }
    >
      <SeleccionRutasMaritimasContent />
    </Suspense>
  );
}
