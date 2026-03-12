// utils/calculos.ts
import { ItemInventario, SituacaoContagem } from '../data/types';

interface CalculoContagemParams {
  qtdPaletes: number;
  cxPorPalete: number;
  cxAvulsas: number;
  unidPorCx: number;
  unidAvulsas: number;
  avulsosExp: number;
  saldoSpalm: number;
}

interface ResultadoContagem {
  totalGeral: number;
  diferenca: number;
  situacao: SituacaoContagem;
}

/**
 * Calcula o total geral e diferença da contagem
 */
export const calcularTotalGeral = ({
  qtdPaletes,
  cxPorPalete,
  cxAvulsas,
  unidPorCx,
  unidAvulsas,
  avulsosExp,
}: Omit<CalculoContagemParams, 'saldoSpalm'>): number => {
  const total = ((qtdPaletes * cxPorPalete + cxAvulsas) * unidPorCx) + unidAvulsas + avulsosExp;
  return Number(total.toFixed(2));
};

export const calcularDiferenca = (
  totalGeral: number,
  saldoSpalm: number
): number => {
  return Number((totalGeral - saldoSpalm).toFixed(2));
};

export const calcularSituacao = (
  totalGeral: number,
  saldoSpalm: number
): SituacaoContagem => {
  if (totalGeral === 0 && saldoSpalm === 0) {
    return 'AGUARDANDO';
  }
  if (totalGeral === saldoSpalm) {
    return 'OK';
  }
  if (totalGeral > saldoSpalm) {
    return 'SOBRA';
  }
  return 'FALTA';
};

export const calcularContagem = (params: CalculoContagemParams): ResultadoContagem => {
  const totalGeral = calcularTotalGeral(params);
  const diferenca = calcularDiferenca(totalGeral, params.saldoSpalm);
  const situacao = calcularSituacao(totalGeral, params.saldoSpalm);

  return {
    totalGeral,
    diferenca,
    situacao,
  };
};

/**
 * Formata valores para exibição
 */
export const formatarDiferenca = (diferenca: number): string => {
  const signal = diferenca > 0 ? '+' : '';
  return `${signal}${diferenca.toFixed(2)}`;
};

export const getCorSituacao = (situacao: SituacaoContagem): string => {
  const cores = {
    AGUARDANDO: '#cbd5e1',
    OK: '#2ecc71',
    SOBRA: '#f39c12',
    FALTA: '#d32f2f',
  };
  return cores[situacao];
};

/**
 * Calcula resumo do relatório
 */
export const calcularResumo = (itens: ItemInventario[]) => {
  return {
    total: itens.length,
    ok: itens.filter(i => i.diferenca === 0).length,
    sobra: itens.filter(i => i.diferenca > 0).length,
    falta: itens.filter(i => i.diferenca < 0).length,
    aguardando: itens.filter(i => i.totalFisico === 0 && i.saldoSpalm === 0).length,
    totalFisico: itens.reduce((acc, i) => acc + i.totalFisico, 0),
    totalSpalm: itens.reduce((acc, i) => acc + i.saldoSpalm, 0),
    totalDiferenca: itens.reduce((acc, i) => acc + i.diferenca, 0),
  };
};

/**
 * Validações
 */
export const validarCamposContagem = (params: CalculoContagemParams): string[] => {
  const erros: string[] = [];

  if (params.qtdPaletes < 0) erros.push('Quantidade de paletes não pode ser negativa');
  if (params.cxPorPalete < 0) erros.push('Caixas por palete não pode ser negativo');
  if (params.cxAvulsas < 0) erros.push('Caixas avulsas não pode ser negativo');
  if (params.unidPorCx <= 0) erros.push('Unidades por caixa deve ser maior que zero');
  if (params.unidAvulsas < 0) erros.push('Unidades avulsas não pode ser negativo');
  if (params.avulsosExp < 0) erros.push('Expedição não pode ser negativo');
  if (params.saldoSpalm < 0) erros.push('Saldo Spalm não pode ser negativo');

  return erros;
};

/**
 * Estatísticas avançadas
 */
export const calcularEstatisticas = (itens: ItemInventario[]) => {
  if (itens.length === 0) {
    return {
      mediaDiferenca: 0,
      maiorDiferenca: 0,
      menorDiferenca: 0,
      desvioPadrao: 0,
      itensConferidos: 0,
      precisao: 0,
    };
  }

  const diferencas = itens.map(i => i.diferenca);
  const somaDiferencas = diferencas.reduce((acc, val) => acc + val, 0);
  const mediaDiferenca = somaDiferencas / itens.length;

  const quadradosDiferencas = diferencas.map(d => Math.pow(d - mediaDiferenca, 2));
  const somaQuadrados = quadradosDiferencas.reduce((acc, val) => acc + val, 0);
  const desvioPadrao = Math.sqrt(somaQuadrados / itens.length);

  const itensConferidos = itens.filter(i => i.totalFisico > 0 || i.saldoSpalm > 0).length;
  const itensOk = itens.filter(i => i.diferenca === 0).length;
  const precisao = itensConferidos > 0 ? (itensOk / itensConferidos) * 100 : 0;

  return {
    mediaDiferenca: Number(mediaDiferenca.toFixed(2)),
    maiorDiferenca: Math.max(...diferencas),
    menorDiferenca: Math.min(...diferencas),
    desvioPadrao: Number(desvioPadrao.toFixed(2)),
    itensConferidos,
    precisao: Number(precisao.toFixed(2)),
  };
};