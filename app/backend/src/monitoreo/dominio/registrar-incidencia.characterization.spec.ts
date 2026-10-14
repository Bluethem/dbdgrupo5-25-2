import { RegistrarIncidenciaUseCase } from './registrar-incidencia.use-case';
import { IncidenciasEnMemoriaAdapter } from '../infraestructura/incidencias-en-memoria.adapter';

/**
 * Pruebas de caracterización (Lab paso 01):
 * fijan el comportamiento actual de registrar incidencia
 * (mensajes y reglas) antes de mover más estructura.
 */
describe('RegistrarIncidencia — caracterización', () => {
  let useCase: RegistrarIncidenciaUseCase;
  let adaptador: IncidenciasEnMemoriaAdapter;

  beforeEach(() => {
    adaptador = new IncidenciasEnMemoriaAdapter();
    adaptador.sembrarTipo('tipo-1');
    adaptador.sembrarEstadoInicial('estado-abierta');
    useCase = new RegistrarIncidenciaUseCase(adaptador);
  });

  it('rechaza sin usuario (comportamiento actual)', async () => {
    await expect(
      useCase.ejecutar({
        idTipoIncidencia: 'tipo-1',
        descripcion: 'Fuga de refrigerante',
        gradoSeveridad: 3,
        idOperacion: 'op-1',
        idUsuario: '',
      }),
    ).rejects.toThrow('Usuario no autenticado');
  });

  it('rechaza tipo inexistente (comportamiento actual)', async () => {
    await expect(
      useCase.ejecutar({
        idTipoIncidencia: 'tipo-inexistente',
        descripcion: 'Fuga de refrigerante',
        gradoSeveridad: 3,
        idOperacion: 'op-1',
        idUsuario: 'user-1',
      }),
    ).rejects.toThrow('Tipo de incidencia no válido');
  });

  it('registra y asigna código INC-YYMM-#### (comportamiento actual)', async () => {
    const resultado = await useCase.ejecutar({
      idTipoIncidencia: 'tipo-1',
      descripcion: 'Fuga de refrigerante',
      gradoSeveridad: 3,
      idOperacion: 'op-1',
      idUsuario: 'user-1',
    });

    expect(resultado.descripcion).toBe('Fuga de refrigerante');
    expect(resultado.gradoSeveridad).toBe(3);
    expect(resultado.idEstadoIncidencia).toBe('estado-abierta');
    expect(resultado.codigo).toMatch(/^INC-\d{4}-\d{4}$/);
  });
});
