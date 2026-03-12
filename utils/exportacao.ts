// utils/exportacao.ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';
import { ItemInventario } from '../data/types';
import { formatarData, gerarNomeArquivo } from './formatters';

interface ExportOptions {
  almoxarifado: string;
  itens: ItemInventario[];
  inventariante?: string;
  includeResumo?: boolean;
}

/**
 * Gera conteúdo CSV a partir dos itens
 */
export const gerarCSV = (itens: ItemInventario[]): string => {
  const cabecalhos = [
    'Código',
    'Item',
    'Unidade',
    'Total Físico',
    'Saldo Spalm',
    'Diferença',
    'Qualidade',
    'Situação',
    'Data',
  ];

  const linhas = itens.map(item => [
    item.codigo,
    `"${item.item.replace(/"/g, '""')}"`, // Escape aspas
    item.unidade,
    item.totalFisico,
    item.saldoSpalm,
    item.diferenca,
    item.qualidade,
    `"${item.situacao.replace(/"/g, '""')}"`,
    item.data,
  ]);

  return [
    cabecalhos.join(';'),
    ...linhas.map(linha => linha.join(';')),
  ].join('\n');
};

/**
 * Gera conteúdo Excel a partir dos itens
 */
export const gerarExcel = (options: ExportOptions): XLSX.WorkBook => {
  const { almoxarifado, itens, inventariante, includeResumo = true } = options;

  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Dados da planilha
  const dados: any[][] = [];

  // Cabeçalho do relatório
  dados.push(['RELATÓRIO DE INVENTÁRIO']);
  dados.push(['Almoxarifado:', almoxarifado]);
  dados.push(['Data:', formatarData(new Date(), 'completo')]);
  if (inventariante) {
    dados.push(['Inventariante:', inventariante]);
  }
  dados.push([]); // Linha em branco

  // Resumo
  if (includeResumo) {
    const resumo = calcularResumoExport(itens);
    dados.push(['RESUMO']);
    dados.push(['Total de Itens', resumo.total]);
    dados.push(['OK', resumo.ok]);
    dados.push(['Sobra', resumo.sobra]);
    dados.push(['Falta', resumo.falta]);
    dados.push(['Aguardando', resumo.aguardando]);
    dados.push([]);
  }

  // Cabeçalho da tabela
  dados.push([
    'Código',
    'Item',
    'Unidade',
    'Total Físico',
    'Saldo Spalm',
    'Diferença',
    'Qualidade',
    'Situação',
    'Data',
  ]);

  // Dados
  itens.forEach(item => {
    dados.push([
      item.codigo,
      item.item,
      item.unidade,
      item.totalFisico,
      item.saldoSpalm,
      item.diferenca,
      item.qualidade,
      item.situacao,
      item.data,
    ]);
  });

  // Rodapé
  dados.push([]);
  dados.push([`Relatório gerado em ${formatarData(new Date(), 'completo')}`]);

  // Criar worksheet
  const ws = XLSX.utils.aoa_to_sheet(dados);

  // Ajustar largura das colunas
  ws['!cols'] = [
    { wch: 15 }, // Código
    { wch: 50 }, // Item
    { wch: 10 }, // Unidade
    { wch: 12 }, // Total Físico
    { wch: 12 }, // Saldo Spalm
    { wch: 10 }, // Diferença
    { wch: 15 }, // Qualidade
    { wch: 20 }, // Situação
    { wch: 12 }, // Data
  ];

  // Adicionar ao workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Inventário');

  return wb;
};

/**
 * Gera conteúdo HTML para PDF
 */
export const gerarHTML = (options: ExportOptions): string => {
  const { almoxarifado, itens, inventariante } = options;
  const dataAtual = formatarData(new Date(), 'completo');
  const resumo = calcularResumoExport(itens);

  const linhasTabela = itens.map(item => `
    <tr>
      <td>${item.codigo}</td>
      <td>${item.item}</td>
      <td>${item.unidade}</td>
      <td class="numero">${item.totalFisico}</td>
      <td class="numero">${item.saldoSpalm}</td>
      <td class="numero ${item.diferenca > 0 ? 'positivo' : item.diferenca < 0 ? 'negativo' : ''}">
        ${item.diferenca > 0 ? '+' : ''}${item.diferenca}
      </td>
      <td>${item.qualidade}</td>
      <td>${item.situacao}</td>
      <td>${item.data}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Inventário - ${almoxarifado}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        h1 {
          color: #1e3a5a;
          border-bottom: 3px solid #d32f2f;
          padding-bottom: 10px;
        }
        .header {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .header p {
          margin: 5px 0;
          font-size: 14px;
        }
        .resumo {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 10px;
        }
        .resumo-item {
          flex: 1;
          background: #f8f9fa;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
          border-left: 4px solid #1e3a5a;
        }
        .resumo-item.ok { border-left-color: #2ecc71; }
        .resumo-item.sobra { border-left-color: #f39c12; }
        .resumo-item.falta { border-left-color: #d32f2f; }
        .resumo-item.aguardando { border-left-color: #95a5a6; }
        .resumo-valor {
          font-size: 24px;
          font-weight: bold;
          color: #1e3a5a;
        }
        .resumo-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 12px;
        }
        th {
          background: #1e3a5a;
          color: white;
          padding: 10px;
          text-align: center;
          font-weight: bold;
        }
        td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        td.numero {
          text-align: right;
        }
        td.positivo {
          color: #f39c12;
          font-weight: bold;
        }
        td.negativo {
          color: #d32f2f;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background: #f9f9f9;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 11px;
          color: #666;
        }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>RELATÓRIO DE INVENTÁRIO</h1>
      
      <div class="header">
        <p><strong>Almoxarifado:</strong> ${almoxarifado}</p>
        <p><strong>Data/Hora:</strong> ${dataAtual}</p>
        ${inventariante ? `<p><strong>Inventariante:</strong> ${inventariante}</p>` : ''}
        <p><strong>Total de Itens:</strong> ${itens.length}</p>
      </div>

      <div class="resumo">
        <div class="resumo-item ok">
          <div class="resumo-valor">${resumo.ok}</div>
          <div class="resumo-label">OK</div>
        </div>
        <div class="resumo-item sobra">
          <div class="resumo-valor">${resumo.sobra}</div>
          <div class="resumo-label">Sobra</div>
        </div>
        <div class="resumo-item falta">
          <div class="resumo-valor">${resumo.falta}</div>
          <div class="resumo-label">Falta</div>
        </div>
        <div class="resumo-item aguardando">
          <div class="resumo-valor">${resumo.aguardando}</div>
          <div class="resumo-label">Aguardando</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Item</th>
            <th>Unid</th>
            <th>Físico</th>
            <th>Spalm</th>
            <th>Dif</th>
            <th>Qualidade</th>
            <th>Situação</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          ${linhasTabela}
        </tbody>
      </table>

      <div class="footer">
        <p>Relatório gerado por ACheck - Sistema de Inventário</p>
        <p>Documento gerado em ${dataAtual}</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Salva arquivo no dispositivo
 */
export const salvarArquivo = async (
  conteudo: string | Uint8Array,
  nomeArquivo: string,
  mimeType: string
): Promise<string> => {
  try {
    if (Platform.OS === 'web') {
      // Web: download via blob
      const blob = conteudo instanceof Uint8Array 
        ? new Blob([conteudo], { type: mimeType })
        : new Blob([conteudo], { type: mimeType });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      a.click();
      URL.revokeObjectURL(url);
      
      return url;
    } else {
      // Mobile: salvar no sistema de arquivos
      const fileUri = `${FileSystem.documentDirectory}${nomeArquivo}`;
      
      if (conteudo instanceof Uint8Array) {
        // Converter Uint8Array para base64
        const base64 = btoa(String.fromCharCode.apply(null, Array.from(conteudo)));
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        await FileSystem.writeAsStringAsync(fileUri, conteudo, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }
      
      return fileUri;
    }
  } catch (error) {
    console.error('Erro ao salvar arquivo:', error);
    throw error;
  }
};

/**
 * Compartilha arquivo
 */
export const compartilharArquivo = async (fileUri: string, nomeArquivo: string) => {
  if (Platform.OS === 'web') {
    // Web: já foi feito download
    return;
  }

  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/octet-stream',
        dialogTitle: `Compartilhar ${nomeArquivo}`,
        UTI: 'public.data',
      });
    } else {
      alert('Compartilhamento não disponível neste dispositivo');
    }
  } catch (error) {
    console.error('Erro ao compartilhar:', error);
    throw error;
  }
};

/**
 * Calcula resumo para exportação
 */
const calcularResumoExport = (itens: ItemInventario[]) => {
  return {
    total: itens.length,
    ok: itens.filter(i => i.diferenca === 0).length,
    sobra: itens.filter(i => i.diferenca > 0).length,
    falta: itens.filter(i => i.diferenca < 0).length,
    aguardando: itens.filter(i => i.totalFisico === 0 && i.saldoSpalm === 0).length,
  };
};

/**
 * Exportar para Excel
 */
export const exportarParaExcel = async (options: ExportOptions): Promise<void> => {
  try {
    const wb = gerarExcel(options);
    const nomeArquivo = gerarNomeArquivo('inventario', options.almoxarifado, 'xlsx');
    
    // Gerar arquivo
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    
    // Converter para Uint8Array
    const buffer = new Uint8Array(wbout.length);
    for (let i = 0; i < wbout.length; i++) {
      buffer[i] = wbout.charCodeAt(i) & 0xFF;
    }
    
    // Salvar
    const fileUri = await salvarArquivo(buffer, nomeArquivo, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // Compartilhar
    await compartilharArquivo(fileUri, nomeArquivo);
    
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    throw error;
  }
};

/**
 * Exportar para CSV
 */
export const exportarParaCSV = async (options: ExportOptions): Promise<void> => {
  try {
    const csv = gerarCSV(options.itens);
    const nomeArquivo = gerarNomeArquivo('inventario', options.almoxarifado, 'csv');
    
    const fileUri = await salvarArquivo(csv, nomeArquivo, 'text/csv');
    await compartilharArquivo(fileUri, nomeArquivo);
    
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    throw error;
  }
};