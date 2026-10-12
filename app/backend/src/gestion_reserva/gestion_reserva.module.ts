import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades de gestion_reserva
import { AgenteReservas } from './entities/agente-reservas.entity';
import { Cliente } from './entities/cliente.entity';
import { Reserva } from './entities/reserva.entity';
import { ReservaContenedor } from './entities/reserva-contenedor.entity';
import { ClienteTypeormRepository } from './infraestructura/cliente-typeorm.repository';

// Entidades compartidas necesarias
import { Buque } from '../shared/entities/buque.entity';
import { Ruta } from '../shared/entities/ruta.entity';
import { OperacionMaritima } from '../shared/entities/operacion-maritima.entity';
import { EstadoReserva } from '../shared/entities/estado-reserva.entity';
import { RutaMaritima } from '../gestion_maritima/entities/ruta-maritima.entity';
import { Usuario } from '../shared/entities/usuario.entity';
import { RolUsuario } from '../shared/entities/rol-usuario.entity';

// Modules
import { AuthModule } from '../auth/auth.module';

// Controllers
import { ClientesController } from './controllers/clientes.controller';
import { ReservasController } from './controllers/reservas.controller';
import { AgentesController } from './controllers/agentes.controller';
import { TarifasController } from './controllers/tarifas.controller';
import { BuquesOperacionesController } from './controllers/buques-operaciones.controller';
import { EstadosReservaController } from './controllers/estados-reserva.controller';

// Services
import { ClientesService } from './services/clientes.service';
import { ReservasService } from './services/reservas.service';
import { AgentesService } from './services/agentes.service';
import { TarifasService } from './services/tarifas.service';
import { BuquesOperacionesService } from './services/buques-operaciones.service';
import { EstadosReservaService } from './services/estados-reserva.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      // Entidades propias de gestion_reserva
      AgenteReservas,
      Cliente,
      Reserva,
      ReservaContenedor,
      // Entidades compartidas necesarias
      Buque,
      Ruta,
      OperacionMaritima,
      EstadoReserva,
      RutaMaritima,
      Usuario,
      RolUsuario,
    ]),
  ],
  controllers: [
    ClientesController,
    ReservasController,
    AgentesController,
    TarifasController,
    BuquesOperacionesController,
    EstadosReservaController,
  ],
  providers: [
    ClientesService,
    ClienteTypeormRepository,
    ReservasService,
    AgentesService,
    TarifasService,
    BuquesOperacionesService,
    EstadosReservaService,
  ],
  exports: [
    ClientesService,
    ReservasService,
    AgentesService,
  ],
})
export class GestionReservaModule {}
