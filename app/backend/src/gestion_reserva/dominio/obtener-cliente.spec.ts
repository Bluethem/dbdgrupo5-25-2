import { ClienteDominio, ClienteRepositoryInterface } from './cliente.repository.interface';
import { ObtenerClienteUseCase } from './obtener-cliente.use-case';

// Implementación en memoria solo para pruebas (sin tocar base de datos)
class RepositorioClienteEnMemoria implements ClienteRepositoryInterface {
  private clientes: ClienteDominio[] = [
    {
      idCliente: 1,
      ruc: '20123456789',
      razonSocial: 'Hapag-Lloyd Perú S.A.C.',
      direccion: 'Av. Las Begonias 441',
      email: 'contacto@hapag-lloyd.com',
    },
  ];

  async buscarPorRuc(ruc: string): Promise<ClienteDominio | null> {
    const encontrado = this.clientes.find((c) => c.ruc === ruc);
    return encontrado || null;
  }
}

describe('ObtenerClienteUseCase (Prueba de Dominio)', () => {
  let useCase: ObtenerClienteUseCase;
  let repoEnMemoria: RepositorioClienteEnMemoria;

  beforeEach(() => {
    repoEnMemoria = new RepositorioClienteEnMemoria();
    useCase = new ObtenerClienteUseCase(repoEnMemoria);
  });

  it('debe obtener un cliente si el RUC es válido y existe', async () => {
    const cliente = await useCase.ejecutar('20123456789');

    expect(cliente).toBeDefined();
    expect(cliente.ruc).toBe('20123456789');
    expect(cliente.razonSocial).toBe('Hapag-Lloyd Perú S.A.C.');
  });

  it('debe lanzar error de dominio si el RUC no tiene 11 dígitos', async () => {
    await expect(useCase.ejecutar('12345')).rejects.toThrow(
      'El RUC 12345 no es válido. Debe contener exactamente 11 dígitos numéricos',
    );
  });

  it('debe lanzar error de dominio si el cliente no existe', async () => {
    await expect(useCase.ejecutar('20999999999')).rejects.toThrow(
      'Cliente con RUC 20999999999 no encontrado',
    );
  });
});
