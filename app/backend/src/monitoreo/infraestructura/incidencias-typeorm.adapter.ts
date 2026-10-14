import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DatosNuevaIncidencia,
  IncidenciaDominio,
  Incidencias,
} from '../dominio/incidencias.port';
import { Incidencia } from '../entities/incidencia.entity';
import { TipoIncidencia } from '../entities/tipo-incidencia.entity';
import { EstadoIncidencia } from '../entities/estado-incidencia.entity';

/** Primer adaptador: persiste incidencias con TypeORM (producción). */
@Injectable()
export class IncidenciasTypeormAdapter implements Incidencias {
  constructor(
    @InjectRepository(Incidencia)
    private readonly incidenciaRepository: Repository<Incidencia>,
    @InjectRepository(TipoIncidencia)
    private readonly tipoIncidenciaRepository: Repository<TipoIncidencia>,
    @InjectRepository(EstadoIncidencia)
    private readonly estadoIncidenciaRepository: Repository<EstadoIncidencia>,
  ) {}

  async existeTipo(idTipoIncidencia: string): Promise<boolean> {
    const tipo = await this.tipoIncidenciaRepository.findOne({
      where: { id_tipo_incidencia: idTipoIncidencia },
    });
    return !!tipo;
  }

  async obtenerEstadoInicial(): Promise<{ idEstadoIncidencia: string } | null> {
    const estado = await this.estadoIncidenciaRepository.findOne({ where: {} });
    if (!estado) {
      return null;
    }
    return { idEstadoIncidencia: estado.id_estado_incidencia };
  }

  async siguienteCodigo(): Promise<string> {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');

    const count = await this.incidenciaRepository
      .createQueryBuilder('incidencia')
      .where('EXTRACT(YEAR FROM incidencia.fecha_hora) = :year', {
        year: fecha.getFullYear(),
      })
      .andWhere('EXTRACT(MONTH FROM incidencia.fecha_hora) = :month', {
        month: fecha.getMonth() + 1,
      })
      .getCount();

    const secuencia = (count + 1).toString().padStart(4, '0');
    return `INC-${año}${mes}-${secuencia}`;
  }

  async guardar(datos: DatosNuevaIncidencia): Promise<IncidenciaDominio> {
    const entidad = this.incidenciaRepository.create({
      codigo: datos.codigo,
      id_tipo_incidencia: datos.idTipoIncidencia,
      descripcion: datos.descripcion,
      grado_severidad: datos.gradoSeveridad,
      id_operacion: datos.idOperacion,
      id_usuario: datos.idUsuario,
      id_estado_incidencia: datos.idEstadoIncidencia,
    });

    const saved = await this.incidenciaRepository.save(entidad);

    return {
      idIncidencia: saved.id_incidencia,
      codigo: saved.codigo,
      idTipoIncidencia: saved.id_tipo_incidencia,
      descripcion: saved.descripcion,
      gradoSeveridad: saved.grado_severidad,
      idOperacion: saved.id_operacion,
      idUsuario: saved.id_usuario,
      idEstadoIncidencia: saved.id_estado_incidencia,
      fechaHora: saved.fecha_hora,
    };
  }
}
