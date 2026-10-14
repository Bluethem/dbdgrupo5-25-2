/** Modelo de dominio (sin TypeORM). */
export interface IncidenciaDominio {
  idIncidencia: string;
  codigo: string;
  idTipoIncidencia: string;
  descripcion: string;
  gradoSeveridad: number;
  idOperacion: string;
  idUsuario: string;
  idEstadoIncidencia: string;
  fechaHora: Date;
}

export interface RegistrarIncidenciaComando {
  idTipoIncidencia: string;
  descripcion: string;
  gradoSeveridad: number;
  idOperacion: string;
  idUsuario: string;
}

export interface DatosNuevaIncidencia {
  codigo: string;
  idTipoIncidencia: string;
  descripcion: string;
  gradoSeveridad: number;
  idOperacion: string;
  idUsuario: string;
  idEstadoIncidencia: string;
}

/**
 * Puerto de salida: lo que el dominio necesita del mundo exterior.
 * Vive en dominio; lo implementa infraestructura.
 */
export interface Incidencias {
  existeTipo(idTipoIncidencia: string): Promise<boolean>;
  obtenerEstadoInicial(): Promise<{ idEstadoIncidencia: string } | null>;
  siguienteCodigo(): Promise<string>;
  guardar(datos: DatosNuevaIncidencia): Promise<IncidenciaDominio>;
}
