export interface BillModel {
  id?: number;
  descricao: string;
  dataVencimento: string;
  valorVariavel: boolean;
  valor?: number;
}
