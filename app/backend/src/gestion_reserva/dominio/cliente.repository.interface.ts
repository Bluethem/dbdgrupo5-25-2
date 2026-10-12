export interface ClienteDominio {
  idCliente: number;
  ruc: string;
  razonSocial: string;
  direccion?: string;
  email?: string;
}

export interface ClienteRepositoryInterface {
  buscarPorRuc(ruc: string): Promise<ClienteDominio | null>;
}
