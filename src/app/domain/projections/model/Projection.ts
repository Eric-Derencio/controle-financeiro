export interface ProjectionModel {
  id?: number;
  mes: string;
  contaId: number;
  valor: number | null;
  pago: boolean;
  observacao?: string;
}
