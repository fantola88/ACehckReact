// services/pdfService.ts
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const gerarPDF = async (relatorio: any) => {
  try {
    const linhasTabela = relatorio.itens.map((item: any) => {
      const totalFisico = (item.fisico.paletes * 100) + (item.fisico.caixas * 10) + item.fisico.unidades;
      const diferenca = totalFisico - (item.spalm || 0);
      
      const dataFormatada = item.dataRegistro ? 
        new Date(item.dataRegistro).toLocaleDateString('pt-BR') : 
        new Date().toLocaleDateString('pt-BR');
      
      let fisicoStr = '';
      if (item.fisico.paletes > 0) fisicoStr += `${item.fisico.paletes} pal `;
      if (item.fisico.caixas > 0) fisicoStr += `${item.fisico.caixas} cx `;
      if (item.fisico.unidades > 0) fisicoStr += `${item.fisico.unidades} un`;
      
      return `
        <tr>
          <td>${item.codigo}</td>
          <td>${item.nome}</td>
          <td>${item.unidade}</td>
          <td>${fisicoStr.trim()}</td>
          <td>${item.spalm || 0}</td>
          <td>${diferenca}</td>
          <td>E:${item.qualidade?.embalagem === 'ok' ? 'OK' : 'AVARIA'} | V:${item.qualidade?.validade || 'OK'}</td>
          <td>${item.observacaoGeral || 'NORMAL'}</td>
          <td>${dataFormatada}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial; margin: 20px; }
            h1 { color: #0066CC; }
            .cabecalho { background: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #0066CC; color: white; padding: 8px; text-align: left; }
            td { padding: 6px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background: #f9f9f9; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; }
          </style>
        </head>
        <body>
          <h1>${relatorio.titulo}</h1>
          <div class="cabecalho">
            <p><strong>Almoxarifado:</strong> ${relatorio.almoxarifado}</p>
            <p><strong>Inventariante:</strong> ${relatorio.inventariante}</p>
            <p><strong>Data de criação:</strong> ${relatorio.dataCriacao}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>CÓDIGO</th><th>ITEM</th><th>UNID</th><th>FÍSICO</th>
                <th>SPALM</th><th>DIF</th><th>QUALIDADE</th><th>SITUAÇÃO</th><th>DATA</th>
              </tr>
            </thead>
            <tbody>${linhasTabela}</tbody>
          </table>
          <div class="footer">
            <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            <p>ACheck - Sistema de Inventário</p>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Salvar Relatório PDF',
        UTI: 'com.adobe.pdf'
      });
    }

    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    Alert.alert('Erro', 'Não foi possível gerar o PDF');
    return false;
  }
};