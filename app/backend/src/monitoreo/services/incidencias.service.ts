import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incidencia } from '../entities/incidencia.entity';
import { TipoIncidencia } from '../entities/tipo-incidencia.entity';
import { EstadoIncidencia } from '../entities/estado-incidencia.entity';

export interface CreateIncidenciaDto {
  id_tipo_incidencia: string;
  descripcion: string;
  grado_severidad: number;
  id_operacion: string;
  id_usuario?: string;
}

export interface UpdateIncidenciaDto {
  id_tipo_incidencia?: string;
  descripcion?: string;
  grado_severidad?: number;
  id_estado_incidencia?: string;
  id_usuario?: string;
}

@Injectable()
export class IncidenciasService {
  constructor(
    @InjectRepository(Incidencia)
    private incidenciaRepository: Repository<Incidencia>,
    @InjectRepository(TipoIncidencia)
    private tipoIncidenciaRepository: Repository<TipoIncidencia>,
    @InjectRepository(EstadoIncidencia)
    private estadoIncidenciaRepository: Repository<EstadoIncidencia>,
  ) {}

  async findAll(filtros: any = {}) {
    try {
      const { tipo, estado, operacion, codigo, limite = 100, pagina = 1 } = filtros;

      const query = this.incidenciaRepository
        .createQueryBuilder('incidencia')
        .leftJoinAndSelect('incidencia.tipo_incidencia', 'tipo')
        .leftJoinAndSelect('incidencia.estado_incidencia', 'estado')
        .leftJoinAndSelect('incidencia.operacion', 'operacion')
        .orderBy('incidencia.fecha_hora', 'DESC');

      // Aplicar filtros
      if (tipo) {
        query.andWhere('incidencia.id_tipo_incidencia = :tipo', { tipo });
      }

      if (estado) {
        query.andWhere('incidencia.id_estado_incidencia = :estado', { estado });
      }

      if (operacion) {
        query.andWhere('incidencia.id_operacion = :operacion', { operacion });
      }

      if (codigo) {
        query.andWhere('LOWER(incidencia.codigo) LIKE :codigo', {
          codigo: `%${String(codigo).toLowerCase()}%`,
        });
      }

      // Paginación
      const skip = (pagina - 1) * limite;
      query.skip(skip).take(limite);

      const [incidencias, total] = await query.getManyAndCount();

      return {
        incidencias,
        total,
        pagina: Number(pagina),
        total_paginas: Math.ceil(total / limite),
        por_pagina: Number(limite),
      };
    } catch (error) {
      console.error('Error en findAll incidencias:', error.message);
      return {
        incidencias: [],
        total: 0,
        pagina: 1,
        total_paginas: 0,
        por_pagina: 100,
      };
    }
  }

  async findOne(id: string) {
    try {
      const incidencia = await this.incidenciaRepository.findOne({
        where: { id_incidencia: id },
        relations: ['tipo_incidencia', 'estado_incidencia', 'operacion'],
      });

      if (!incidencia) {
        throw new NotFoundException(`Incidencia con ID ${id} no encontrada`);
      }

      return incidencia;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error en findOne incidencia:', error.message);
      throw new Error('Error al obtener la incidencia');
    }
  }

  /**
   * Rodaja vertical Lab06: el POST de incidencias usa RegistrarIncidenciaUseCase
   * + IncidenciasTypeormAdapter. Este create queda como legado / respaldo;
   * listar, update y delete siguen aquí.
   */
  async create(data: CreateIncidenciaDto) {
    try {
      // Validar que venga un id_usuario (desde el contexto de autenticación)
      if (!data.id_usuario) {
        throw new BadRequestException('Usuario no autenticado');
      }

      // Validar que el tipo de incidencia existe
      const tipoExists = await this.tipoIncidenciaRepository.findOne({
        where: { id_tipo_incidencia: data.id_tipo_incidencia },
      });

      if (!tipoExists) {
        throw new BadRequestException('Tipo de incidencia no válido');
      }

      // Obtener el estado inicial (puedes ajustarlo según tu lógica)
      const estadoInicial = await this.estadoIncidenciaRepository.findOne({
        where: {}, // Obtener el primer estado o el que definas como "Abierta"
      });

      if (!estadoInicial) {
        throw new BadRequestException('No hay estados de incidencia configurados');
      }

      // Generar código único
      const codigo = await this.generarCodigoUnico();

      const incidencia = this.incidenciaRepository.create({
        ...data,
        codigo,
        id_estado_incidencia: estadoInicial.id_estado_incidencia,
        id_usuario: data.id_usuario,
      });

      const saved = await this.incidenciaRepository.save(incidencia);

      // Devolver con relaciones
      return await this.findOne(saved.id_incidencia);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error en create incidencia:', error.message);
      throw new Error('Error al crear la incidencia');
    }
  }

  async update(id: string, data: UpdateIncidenciaDto) {
    try {
      const incidencia = await this.findOne(id);

      // Validar tipo de incidencia si se proporciona
      if (data.id_tipo_incidencia) {
        const tipoExists = await this.tipoIncidenciaRepository.findOne({
          where: { id_tipo_incidencia: data.id_tipo_incidencia },
        });

        if (!tipoExists) {
          throw new BadRequestException('Tipo de incidencia no válido');
        }
      }

      // Validar estado de incidencia si se proporciona
      if (data.id_estado_incidencia) {
        const estadoExists = await this.estadoIncidenciaRepository.findOne({
          where: { id_estado_incidencia: data.id_estado_incidencia },
        });

        if (!estadoExists) {
          throw new BadRequestException('Estado de incidencia no válido');
        }
      }

      await this.incidenciaRepository.update(id, data);

      return await this.findOne(id);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error en update incidencia:', error.message);
      throw new Error('Error al actualizar la incidencia');
    }
  }

  async remove(id: string) {
    try {
      const incidencia = await this.findOne(id);
      await this.incidenciaRepository.remove(incidencia);
      return { message: 'Incidencia eliminada correctamente' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error en remove incidencia:', error.message);
      throw new Error('Error al eliminar la incidencia');
    }
  }

  // Métodos auxiliares
  async getTiposIncidencia() {
    try {
      const tipos = await this.tipoIncidenciaRepository.find();
      console.log('Tipos de incidencia encontrados:', tipos.length);
      return tipos;
    } catch (error) {
      console.error('Error al obtener tipos de incidencia:', error.message);
      return [];
    }
  }

  async getEstadosIncidencia() {
    try {
      const estados = await this.estadoIncidenciaRepository.find();
      console.log('Estados de incidencia encontrados:', estados.length);
      return estados;
    } catch (error) {
      console.error('Error al obtener estados de incidencia:', error.message);
      return [];
    }
  }

  async getEstadisticas() {
    try {
      const total = await this.incidenciaRepository.count();

      const porTipo = await this.incidenciaRepository
        .createQueryBuilder('incidencia')
        .leftJoin('incidencia.tipo_incidencia', 'tipo')
        .select('tipo.nombre', 'tipo')
        .addSelect('COUNT(*)', 'cantidad')
        .groupBy('tipo.nombre')
        .getRawMany();

      const porEstado = await this.incidenciaRepository
        .createQueryBuilder('incidencia')
        .leftJoin('incidencia.estado_incidencia', 'estado')
        .select('estado.nombre', 'estado')
        .addSelect('COUNT(*)', 'cantidad')
        .groupBy('estado.nombre')
        .getRawMany();

      const porSeveridad = await this.incidenciaRepository
        .createQueryBuilder('incidencia')
        .select('incidencia.grado_severidad', 'severidad')
        .addSelect('COUNT(*)', 'cantidad')
        .groupBy('incidencia.grado_severidad')
        .getRawMany();

      return {
        total,
        por_tipo: porTipo,
        por_estado: porEstado,
        por_severidad: porSeveridad,
      };
    } catch (error) {
      console.error('Error en getEstadisticas incidencias:', error.message);
      return {
        total: 0,
        por_tipo: [],
        por_estado: [],
        por_severidad: [],
      };
    }
  }

  private async generarCodigoUnico(): Promise<string> {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    
    // Contar incidencias del mes actual
    const count = await this.incidenciaRepository
      .createQueryBuilder('incidencia')
      .where('EXTRACT(YEAR FROM incidencia.fecha_hora) = :year', { year: fecha.getFullYear() })
      .andWhere('EXTRACT(MONTH FROM incidencia.fecha_hora) = :month', { month: fecha.getMonth() + 1 })
      .getCount();

    const secuencia = (count + 1).toString().padStart(4, '0');
    
    return `INC-${año}${mes}-${secuencia}`;
  }
}
