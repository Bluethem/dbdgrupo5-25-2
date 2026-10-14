import {
  IncidenciaDominio,
  Incidencias,
  RegistrarIncidenciaComando,
} from './incidencias.port';

export class RegistrarIncidenciaUseCase {
  constructor(private readonly incidencias: Incidencias) {}

  async ejecutar(comando: RegistrarIncidenciaComando): Promise<IncidenciaDominio> {
    if (!comando.idUsuario || comando.idUsuario.trim().length === 0) {
      throw new Error('Usuario no autenticado');
    }

    const descripcion = (comando.descripcion ?? '').trim();
    if (descripcion.length === 0) {
      throw new Error('La descripción no puede estar vacía');
    }

    if (
      !Number.isInteger(comando.gradoSeveridad) ||
      comando.gradoSeveridad < 1 ||
      comando.gradoSeveridad > 5
    ) {
      throw new Error('El grado de severidad debe ser un entero entre 1 y 5');
    }

    if (!comando.idTipoIncidencia || comando.idTipoIncidencia.trim().length === 0) {
      throw new Error('Tipo de incidencia no válido');
    }

    if (!comando.idOperacion || comando.idOperacion.trim().length === 0) {
      throw new Error('La operación es obligatoria');
    }

    const tipoExiste = await this.incidencias.existeTipo(comando.idTipoIncidencia);
    if (!tipoExiste) {
      throw new Error('Tipo de incidencia no válido');
    }

    const estadoInicial = await this.incidencias.obtenerEstadoInicial();
    if (!estadoInicial) {
      throw new Error('No hay estados de incidencia configurados');
    }

    const codigo = await this.incidencias.siguienteCodigo();

    return this.incidencias.guardar({
      codigo,
      idTipoIncidencia: comando.idTipoIncidencia,
      descripcion,
      gradoSeveridad: comando.gradoSeveridad,
      idOperacion: comando.idOperacion,
      idUsuario: comando.idUsuario,
      idEstadoIncidencia: estadoInicial.idEstadoIncidencia,
    });
  }
}
