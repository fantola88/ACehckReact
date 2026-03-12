// data/types.ts
export type UnidadeMedida = 
  | 'UNIDADE' 
  | 'QUILOGRAMA' 
  | 'LITRO' 
  | 'CAIXA' 
  | 'PACOTE' 
  | 'FRASCO' 
  | 'PEÇA' 
  | 'METRO' 
  | 'ROLO'
  | 'AMPOLA'
  | 'COMPRIMIDO'
  | 'BISNAGA'
  | 'TUBO'
  | 'GALÃO'
  | 'LATA'
  | 'BARRA'
  | 'PAR'
  | 'JOGO'
  | 'KIT'
  | 'RESMA'
  | 'FOLHA'
  | 'BOBINA';

export interface Produto {
  almox: string;
  cod: string;
  nome: string;
  unid: UnidadeMedida;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Inventariante {
  id?: string;
  nome: string;
  email?: string;
  cargo?: string;
  setor?: string;
  uid?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ItemInventario {
  id: string;
  firestoreId?: string;
  codigo: string;
  item: string;
  unidade: string;
  totalFisico: number;
  saldoSpalm: number;
  diferenca: number;
  qualidade: string;
  situacao: string;
  data: string;
  observacoes?: {
    embalagem?: string;
    validade?: string;
  };
  inventariante?: string;
  userId?: string;
  userEmail?: string;
}

export interface Relatorio {
  id: string;
  firestoreId?: string;
  titulo: string;
  almoxarifado: string;
  inventariante: string;
  dataCriacao: string;
  dataISO: string;
  status: 'em_andamento' | 'arquivado';
  itens: ItemInventario[];
  totalItens: number;
  resumo: {
    ok: number;
    sobra: number;
    falta: number;
    aguardando: number;
  };
  userId: string;
  userEmail: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type StatusQualidade = 'OK' | 'AVARIA' | 'VENCIDO';

export type SituacaoContagem = 'AGUARDANDO' | 'OK' | 'SOBRA' | 'FALTA';