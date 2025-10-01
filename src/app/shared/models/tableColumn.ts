export interface TableColumn<T> {
  key: string; // Chave do objeto de dados (ex: 'descricao')
  header: string; // Texto a ser exibido no cabeçalho (ex: 'Descrição')
  isDate?: boolean; // Flag para formatar como data
  isCurrency?: boolean; // Flag para formatar como moeda
  isVariable?: keyof T; // Chave para a propriedade que indica se o valor é variável
}
