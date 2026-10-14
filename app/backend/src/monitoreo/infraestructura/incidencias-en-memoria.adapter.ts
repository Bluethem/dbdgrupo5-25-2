import {
  DatosNuevaIncidencia,
  IncidenciaDominio,
  Incidencias,
} from '../dominio/incidencias.port';

/** Segundo adaptador del puerto Incidencias: sin base de datos. */
export class IncidenciasEnMemoriaAdapter implements Incidencias {
  private readonly tipos = new Set<string>();
  private estadoInicialId: string | null = null;
  private secuencia = 0;
  private readonly guardadas: IncidenciaDominio[] = [];

  sembrarTipo(idTipoIncidencia: string): void {
    this.tipos.add(idTipoIncidencia);
  }

  sembrarEstadoInicial(idEstadoIncidencia: string): void {
    this.estadoInicialId = idEstadoIncidencia;
  }

  listar(): IncidenciaDominio[] {
    return [...this.guardadas];
  }

  async existeTipo(idTipoIncidencia: string): Promise<boolean> {
    return this.tipos.has(idTipoIncidencia);
  }

  async obtenerEstadoInicial(): Promise<{ idEstadoIncidencia: string } | null> {
    if (!this.estadoInicialId) {
      return null;
    }
    return { idEstadoIncidencia: this.estadoInicialId };
  }

  async siguienteCodigo(): Promise<string> {
    this.secuencia += 1;
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const seq = this.secuencia.toString().padStart(4, '0');
    return `INC-${año}${mes}-${seq}`;
  }

  async guardar(datos: DatosNuevaIncidencia): Promise<IncidenciaDominio> {
    const incidencia: IncidenciaDominio = {
      idIncidencia: `mem-${this.guardadas.length + 1}`,
      codigo: datos.codigo,
      idTipoIncidencia: datos.idTipoIncidencia,
      descripcion: datos.descripcion,
      gradoSeveridad: datos.gradoSeveridad,
      idOperacion: datos.idOperacion,
      idUsuario: datos.idUsuario,
      idEstadoIncidencia: datos.idEstadoIncidencia,
      fechaHora: new Date(),
    };
    this.guardadas.push(incidencia);
    return incidencia;
  }
}
