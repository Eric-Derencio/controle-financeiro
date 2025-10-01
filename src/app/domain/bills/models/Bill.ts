export interface BillModel {
  id?: number;
  valor: number | null;
  descricao: string | null;
  dataVencimento: string | null;
  valorVariavel: boolean | null;
}
