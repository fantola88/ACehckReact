// utils/formatters.ts

/**
 * Formatação de data e hora
 */
export const formatarData = (data: Date | string, formato: 'completo' | 'data' | 'hora' = 'completo'): string => {
  const date = typeof data === 'string' ? new Date(data) : data;
  
  const dia = date.getDate().toString().padStart(2, '0');
  const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  const ano = date.getFullYear();
  const horas = date.getHours().toString().padStart(2, '0');
  const minutos = date.getMinutes().toString().padStart(2, '0');
  
  switch (formato) {
    case 'data':
      return `${dia}/${mes}/${ano}`;
    case 'hora':
      return `${horas}:${minutos}`;
    case 'completo':
    default:
      return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
  }
};

export const formatarDataISO = (data: Date = new Date()): string => {
  return data.toISOString();
};

export const formatarDataArquivo = (data: Date = new Date()): string => {
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  const ano = data.getFullYear();
  const horas = data.getHours().toString().padStart(2, '0');
  const minutos = data.getMinutes().toString().padStart(2, '0');
  const segundos = data.getSeconds().toString().padStart(2, '0');
  
  return `${dia}${mes}${ano}_${horas}${minutos}${segundos}`;
};

/**
 * Formatação de números
 */
export const formatarNumero = (
  valor: number,
  casasDecimais: number = 2,
  separadorMilhar: boolean = true
): string => {
  const valorFormatado = valor.toFixed(casasDecimais);
  
  if (!separadorMilhar) {
    return valorFormatado.replace('.', ',');
  }
  
  const partes = valorFormatado.split('.');
  partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return partes.join(',');
};

export const formatarPorcentagem = (valor: number, casasDecimais: number = 1): string => {
  return `${valor.toFixed(casasDecimais)}%`;
};

/**
 * Formatação de texto
 */
export const formatarMaiusculas = (texto: string): string => {
  return texto.toUpperCase();
};

export const formatarPrimeiraMaiuscula = (texto: string): string => {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

export const truncarTexto = (texto: string, maxLength: number = 50): string => {
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength - 3) + '...';
};

/**
 * Formatação de código Spalm
 */
export const formatarCodigoSpalm = (codigo: string): string => {
  // Remove caracteres não numéricos
  const numeros = codigo.replace(/\D/g, '');
  
  // Aplica máscara XX.XX.XX.XXXX-X
  if (numeros.length >= 11) {
    return numeros.replace(/^(\d{2})(\d{2})(\d{2})(\d{4})(\d{1}).*/, '$1.$2.$3.$4-$5');
  }
  
  return codigo;
};

export const validarCodigoSpalm = (codigo: string): boolean => {
  const regex = /^\d{2}\.\d{2}\.\d{2}\.\d{4}-\d{1}$/;
  return regex.test(codigo);
};

/**
 * Formatação para arquivos
 */
export const gerarNomeArquivo = (
  prefixo: string,
  almoxarifado: string,
  extensao: string
): string => {
  const data = formatarDataArquivo();
  const almoxLimpo = almoxarifado
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  
  return `${prefixo}_${almoxLimpo}_${data}.${extensao}`;
};

/**
 * Formatação de tempo
 */
export const formatarTempo = (segundos: number): string => {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = segundos % 60;
  
  const partes = [];
  if (horas > 0) partes.push(`${horas}h`);
  if (minutos > 0) partes.push(`${minutos}min`);
  if (segs > 0 || partes.length === 0) partes.push(`${segs}s`);
  
  return partes.join(' ');
};