// services/excelService.ts
import { File, Paths } from 'expo-file-system'; // NOVA API
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import XLSX from 'xlsx';

export const gerarExcel = async (relatorio: any) => {
  try {
    // Preparar os dados para o Excel
    const dados = relatorio.itens.map((item: any) => {
      // Calcular diferença
      const totalFisico = (item.fisico.paletes * 100) + (item.fisico.caixas * 10) + item.fisico.unidades;
      const diferenca = totalFisico - (item.spalm || 0);
      
      // Formatar quantidade física
      let fisicoStr = '';
      if (item.fisico.paletes > 0) fisicoStr += `${item.fisico.paletes} pal `;
      if (item.fisico.caixas > 0) fisicoStr += `${item.fisico.caixas} cx `;
      if (item.fisico.unidades > 0) fisicoStr += `${item.fisico.unidades} un`;
      
      // Formatar data
      const dataFormatada = item.dataRegistro ? 
        new Date(item.dataRegistro).toLocaleDateString('pt-BR') : 
        new Date().toLocaleDateString('pt-BR');
      
      return {
        CÓDIGO: item.codigo,
        ITEM: item.nome,
        UNID: item.unidade,
        FÍSICO: fisicoStr.trim(),
        SPALM: item.spalm || 0,
        DIF: diferenca,
        QUALIDADE: `E:${item.qualidade?.embalagem === 'ok' ? 'OK' : 'AVARIA'} | V:${item.qualidade?.validade || 'OK'}`,
        SITUAÇÃO: item.observacaoGeral || 'NORMAL',
        DATA: dataFormatada
      };
    });

    // Criar worksheet
    const ws = XLSX.utils.json_to_sheet(dados);
    
    // Ajustar largura das colunas
    const wscols = [
      { wch: 15 }, // CÓDIGO
      { wch: 40 }, // ITEM
      { wch: 8 },  // UNID
      { wch: 20 }, // FÍSICO
      { wch: 8 },  // SPALM
      { wch: 8 },  // DIF
      { wch: 20 }, // QUALIDADE
      { wch: 15 }, // SITUAÇÃO
      { wch: 12 }, // DATA
    ];
    ws['!cols'] = wscols;

    // Criar workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Itens');

    // Gerar arquivo em base64
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    
    // Nome do arquivo
    const fileName = `${relatorio.titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0,10)}.xlsx`;
    
    // Usar a NOVA API do expo-file-system
    const file = new File(Paths.document, fileName);
    
    // Criar o arquivo (se não existir)
    if (!file.exists) {
      file.create();
    }
    
    // Escrever o conteúdo em base64
    file.write(wbout, { encoding: 'base64' });

    // Compartilhar o arquivo
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Salvar Relatório Excel',
        UTI: 'com.microsoft.excel.xlsx'
      });
    } else {
      Alert.alert('Sucesso', `Arquivo salvo em: ${file.uri}`);
    }

    return true;
  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    Alert.alert('Erro', 'Não foi possível gerar o arquivo Excel');
    return false;
  }
};