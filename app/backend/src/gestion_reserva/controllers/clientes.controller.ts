import { Controller, Get, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { ClientesService } from '../services/clientes.service';
import { ObtenerClienteUseCase } from '../dominio/obtener-cliente.use-case';
import { ClienteTypeormRepository } from '../infraestructura/cliente-typeorm.repository';

@Controller('gestion-reserva/clientes')
export class ClientesController {
  private readonly obtenerClienteUseCase: ObtenerClienteUseCase;

  constructor(
    private readonly clientesService: ClientesService,
    private readonly clienteTypeormRepo: ClienteTypeormRepository,
  ) {
    // El caso de uso de dominio recibe el repositorio de infraestructura
    this.obtenerClienteUseCase = new ObtenerClienteUseCase(this.clienteTypeormRepo);
  }

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  @Get('ruc/:ruc')
  async findByRuc(@Param('ruc') ruc: string) {
    try {
      return await this.obtenerClienteUseCase.ejecutar(ruc);
    } catch (error: any) {
      if (error.message.includes('no encontrado')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}
