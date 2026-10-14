import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { OperacionMonitoreo } from './entities/operacion-monitoreo.entity';
import { Operador } from './entities/operador.entity';
import { Sensor } from './entities/sensor.entity';
import { TipoSensor } from './entities/tipo-sensor.entity';
import { RolSensor } from './entities/rol-sensor.entity';
import { Notificacion } from './entities/notificacion.entity';
import { TipoNotificacion } from './entities/tipo-notificacion.entity';
import { PosicionContenedor } from './entities/posicion-contenedor.entity';
import { PosicionVehiculo } from './entities/posicion-vehiculo.entity';
import { PosicionBuque } from './entities/posicion-buque.entity';
import { Incidencia } from './entities/incidencia.entity';
import { TipoIncidencia } from './entities/tipo-incidencia.entity';
import { EstadoIncidencia } from './entities/estado-incidencia.entity';
import { Reporte } from './entities/reporte.entity';
import { IncidenciaReporte } from './entities/incidencia-reporte.entity';
import { Entrega } from './entities/entrega.entity';
import { Importador } from './entities/importador.entity';
import { ImportadorDireccion } from './entities/importador-direccion.entity';
import { Documentacion } from './entities/documentacion.entity';
import { DocumentacionContenedor } from './entities/documentacion-contenedor.entity';
import { LecturaSensor } from './entities/lectura-sensor.entity';

// Shared Entities
import { Operacion } from '../shared/entities/operacion.entity';
import { Contenedor } from '../shared/entities/contenedor.entity';
import { Vehiculo } from '../shared/entities/vehiculo.entity';
import { Buque } from '../shared/entities/buque.entity';
import { Ruta } from '../shared/entities/ruta.entity';
import { Puerto } from '../gestion_maritima/entities/puerto.entity';
import { Muelle } from '../gestion_maritima/entities/muelle.entity';
import { RutaMaritima } from '../gestion_maritima/entities/ruta-maritima.entity';
import { RutaPuertoIntermedio } from '../gestion_maritima/entities/ruta-puerto-intermedio.entity';
import { EstadoOperacion } from '../shared/entities/estado-operacion.entity';
import { EstadoContenedor } from '../shared/entities/estado-contenedor.entity';
import { TipoContenedor } from '../shared/entities/tipo-contenedor.entity';
import { EstadoEntrega } from '../shared/entities/estado-entrega.entity';
import { EstatusNavegacion } from '../shared/entities/estatus-navegacion.entity';
import { EstadoLectura } from '../shared/entities/estado-lectura.entity';
import { OperacionEmpleado } from '../gestion_maritima/entities/operacion-empleado.entity';
import { OperacionContenedor } from '../gestion_maritima/entities/operacion-contenedor.entity';
import { OperacionMaritima } from '../shared/entities/operacion-maritima.entity';
import { OperacionTerrestre } from '../operaciones_terrestres/entities/operacion-terrestre.entity';
import { OperacionTerrestreDetalle } from '../operaciones_terrestres/entities/operacion-terrestre-detalle.entity';
import { TipoDocumento } from '../shared/entities/tipo-documento.entity';

// Controllers
import { OperacionesController } from './controllers/operaciones.controller';
import { ContenedoresController } from './controllers/contenedores.controller';
import { SensoresController } from './controllers/sensores.controller';
import { GpsController } from './controllers/gps.controller';
import { IncidenciasController } from './controllers/incidencias.controller';
import { ReportesController } from './controllers/reportes.controller';
import { EntregasController } from './controllers/entregas.controller';
import { ImportadoresController } from './controllers/importadores.controller';
import { DocumentacionController } from './controllers/documentacion.controller';
import { VmDemoController } from './controllers/vm-demo.controller';

// Services
import { OperacionesService } from './services/operaciones.service';
import { ContenedoresService } from './services/contenedores.service';
import { SensoresService } from './services/sensores.service';
import { GpsService } from './services/gps.service';
import { IncidenciasService } from './services/incidencias.service';
import { ReportesService } from './services/reportes.service';
import { EntregasService } from './services/entregas.service';
import { ImportadoresService } from './services/importadores.service';
import { DocumentacionService } from './services/documentacion.service';
import { VictoriaMetricsService } from './services/victoriametrics.service';
// Rodaja vertical Lab06: adaptador de infraestructura del puerto Incidencias
import { IncidenciasTypeormAdapter } from './infraestructura/incidencias-typeorm.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Monitoreo entities
      OperacionMonitoreo,
      Operador,
      Sensor,
      TipoSensor,
      RolSensor,
      Notificacion,
      TipoNotificacion,
      PosicionContenedor,
      PosicionVehiculo,
      PosicionBuque,
      Incidencia,
      TipoIncidencia,
      EstadoIncidencia,
      IncidenciaReporte,
      Reporte,
      Entrega,
      Importador,
      ImportadorDireccion,
      Documentacion,
      DocumentacionContenedor,
      // Shared entities
      LecturaSensor,
      Operacion,
      Contenedor,
      Vehiculo,
      Buque,
      EstadoOperacion,
      EstadoContenedor,
      TipoContenedor,
      EstadoEntrega,
      EstatusNavegacion,
      EstadoLectura,
      Ruta,
      TipoDocumento,
      Puerto,
      Muelle,
      RutaMaritima,
      RutaPuertoIntermedio,
      OperacionEmpleado,
      OperacionContenedor,
      OperacionMaritima,
      OperacionTerrestre,
      OperacionTerrestreDetalle,
    ]),
  ],
  controllers: [
    OperacionesController,
    ContenedoresController,
    SensoresController,
    GpsController,
    IncidenciasController,
    ReportesController,
    EntregasController,
    ImportadoresController,
    DocumentacionController,
    VmDemoController,
  ],
  providers: [
    OperacionesService,
    ContenedoresService,
    SensoresService,
    GpsService,
    IncidenciasService,
    IncidenciasTypeormAdapter,
    ReportesService,
    EntregasService,
    ImportadoresService,
    DocumentacionService,
    VictoriaMetricsService,
  ],
  exports: [
    OperacionesService,
    ContenedoresService,
    SensoresService,
    GpsService,
  ],
})
export class MonitoreoModule { }
