import { ClienteDominio, ClienteRepositoryInterface } from './cliente.repository.interface';

export class ObtenerClienteUseCase {
  constructor(private readonly clienteRepository: ClienteRepositoryInterface) {}

  async ejecutar(ruc: string): Promise<ClienteDominio> {
    if (!ruc || ruc.trim().length === 0) {
      throw new Error('El RUC no puede estar vacío');
    }

    // Regla de negocio: RUC en Perú debe tener exactamente 11 dígitos numéricos
    const esRucValido = /^\d{11}$/.test(ruc);
    if (!esRucValido) {
      throw new Error(`El RUC ${ruc} no es válido. Debe contener exactamente 11 dígitos numéricos`);
    }

    const cliente = await this.clienteRepository.buscarPorRuc(ruc);

    if (!cliente) {
      throw new Error(`Cliente con RUC ${ruc} no encontrado`);
    }

    return cliente;
  }
}
