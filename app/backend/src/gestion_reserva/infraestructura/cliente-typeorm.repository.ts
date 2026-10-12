import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../entities/cliente.entity';
import { ClienteDominio, ClienteRepositoryInterface } from '../dominio/cliente.repository.interface';

@Injectable()
export class ClienteTypeormRepository implements ClienteRepositoryInterface {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async buscarPorRuc(ruc: string): Promise<ClienteDominio | null> {
    const query = `
      SELECT 
        c.id_cliente,
        c.ruc,
        c.razon_social,
        c.direccion,
        c.email
      FROM gestion_reserva.cliente c
      WHERE c.ruc = $1
    `;
    const result = await this.clienteRepository.query(query, [ruc]);
    if (!result || result.length === 0) {
      return null;
    }

    const raw = result[0];
    return {
      idCliente: raw.id_cliente,
      ruc: raw.ruc,
      razonSocial: raw.razon_social,
      direccion: raw.direccion,
      email: raw.email,
    };
  }
}
