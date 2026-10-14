import { RegistrarIncidenciaUseCase } from './registrar-incidencia.use-case';
import { Incidencias } from './incidencias.port';
import { IncidenciasEnMemoriaAdapter } from '../infraestructura/incidencias-en-memoria.adapter';
import { IncidenciasTypeormAdapter } from '../infraestructura/incidencias-typeorm.adapter';

const COMANDO_VALIDO = {
  idTipoIncidencia: 'tipo-1',
  descripcion: 'Sensor de temperatura fuera de rango',
  gradoSeveridad: 4,
  idOperacion: 'op-99',
  idUsuario: 'user-42',
};

function prepararMemoria(): IncidenciasEnMemoriaAdapter {
  const adaptador = new IncidenciasEnMemoriaAdapter();
  adaptador.sembrarTipo('tipo-1');
  adaptador.sembrarEstadoInicial('estado-abierta');
  return adaptador;
}

/** TypeORM sin base real: repositorios stub (prueba de dominio / intercambio). */
function prepararTypeormStub(): Incidencias {
  const tipoRepo = {
    findOne: jest.fn(async ({ where }: any) =>
      where.id_tipo_incidencia === 'tipo-1' ? { id_tipo_incidencia: 'tipo-1' } : null,
    ),
  };
  const estadoRepo = {
    findOne: jest.fn(async () => ({ id_estado_incidencia: 'estado-abierta' })),
  };
  const incidenciaRepo = {
    create: jest.fn((data: any) => data),
    save: jest.fn(async (data: any) => ({
      ...data,
      id_incidencia: 'uuid-generado',
      fecha_hora: new Date('2026-10-14T12:00:00Z'),
    })),
    createQueryBuilder: jest.fn(() => ({
      where: () => ({
        andWhere: () => ({
          getCount: async () => 0,
        }),
      }),
    })),
  };

  return new IncidenciasTypeormAdapter(
    incidenciaRepo as any,
    tipoRepo as any,
    estadoRepo as any,
  );
}

function suiteDominio(nombre: string, crearAdaptador: () => Incidencias) {
  describe(`RegistrarIncidenciaUseCase (${nombre})`, () => {
    let useCase: RegistrarIncidenciaUseCase;

    beforeEach(() => {
      useCase = new RegistrarIncidenciaUseCase(crearAdaptador());
    });

    it('registra una incidencia válida', async () => {
      const creada = await useCase.ejecutar(COMANDO_VALIDO);

      expect(creada.idTipoIncidencia).toBe('tipo-1');
      expect(creada.descripcion).toBe('Sensor de temperatura fuera de rango');
      expect(creada.gradoSeveridad).toBe(4);
      expect(creada.idEstadoIncidencia).toBe('estado-abierta');
      expect(creada.codigo).toMatch(/^INC-\d{4}-\d{4}$/);
    });

    it('rechaza severidad fuera de 1..5', async () => {
      await expect(
        useCase.ejecutar({ ...COMANDO_VALIDO, gradoSeveridad: 9 }),
      ).rejects.toThrow('El grado de severidad debe ser un entero entre 1 y 5');
    });

    it('rechaza si no hay estados configurados', async () => {
      const vacio = new IncidenciasEnMemoriaAdapter();
      vacio.sembrarTipo('tipo-1');
      const caso = new RegistrarIncidenciaUseCase(vacio);

      await expect(caso.ejecutar(COMANDO_VALIDO)).rejects.toThrow(
        'No hay estados de incidencia configurados',
      );
    });
  });
}

/** Misma prueba de dominio con los dos adaptadores del puerto. */
suiteDominio('adaptador en memoria', () => prepararMemoria());
suiteDominio('adaptador TypeORM (stub)', () => prepararTypeormStub());
