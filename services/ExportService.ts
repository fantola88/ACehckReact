// services/ExportService.ts
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { ItemInventario } from '../data/types';
import {
    compartilharArquivo,
    exportarParaCSV,
    exportarParaExcel,
    gerarHTML
} from '../utils/exportacao';
import { gerarNomeArquivo } from '../utils/formatters';

export class ExportService {
  /**
   * Exporta relatório para Excel
   */
  static async exportarExcel(
    almoxarifado: string,
    itens: ItemInventario[],
    inventariante?: string
  ): Promise<void> {
    try {
      await exportarParaExcel({
        almoxarifado,
        itens,
        inventariante,
        includeResumo: true,
      });
    } catch (error) {
      console.error('Erro no serviço de exportação Excel:', error);
      throw new Error('Não foi possível exportar para Excel');
    }
  }

  /**
   * Exporta relatório para PDF
   */
  static async exportarPDF(
    almoxarifado: string,
    itens: ItemInventario[],
    inventariante?: string
  ): Promise<void> {
    try {
      // Gerar HTML
      const html = gerarHTML({
        almoxarifado,
        itens,
        inventariante,
      });

      // Gerar PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Nome do arquivo
      const nomeArquivo = gerarNomeArquivo('inventario', almoxarifado, 'pdf');
      const novoUri = `${FileSystem.documentDirectory}${nomeArquivo}`;

      // Mover arquivo
      await FileSystem.moveAsync({
        from: uri,
        to: novoUri,
      });

      // Compartilhar
      await compartilharArquivo(novoUri, nomeArquivo);

    } catch (error) {
      console.error('Erro no serviço de exportação PDF:', error);
      throw new Error('Não foi possível exportar para PDF');
    }
  }

  /**
   * Exporta relatório para CSV
   */
  static async exportarCSV(
    almoxarifado: string,
    itens: ItemInventario[],
    inventariante?: string
  ): Promise<void> {
    try {
      await exportarParaCSV({
        almoxarifado,
        itens,
        inventariante,
      });
    } catch (error) {
      console.error('Erro no serviço de exportação CSV:', error);
      throw new Error('Não foi possível exportar para CSV');
    }
  }

  /**
   * Exporta múltiplos relatórios (zip)
   */
  static async exportarMultiplos(
    relatorios: { almoxarifado: string; itens: ItemInventario[] }[]
  ): Promise<void> {
    try {
      // Por enquanto, exporta o primeiro
      if (relatorios.length > 0) {
        await this.exportarExcel(
          relatorios[0].almoxarifado,
          relatorios[0].itens
        );
      }
      
      // TODO: Implementar compressão ZIP
    } catch (error) {
      console.error('Erro ao exportar múltiplos relatórios:', error);
      throw error;
    }
  }

  /**
   * Exporta relatório para impressão
   */
  static async imprimirRelatorio(
    almoxarifado: string,
    itens: ItemInventario[],
    inventariante?: string
  ): Promise<void> {
    try {
      const html = gerarHTML({
        almoxarifado,
        itens,
        inventariante,
      });

      await Print.printAsync({
        html,
      });
    } catch (error) {
      console.error('Erro ao imprimir relatório:', error);
      throw new Error('Não foi possível imprimir o relatório');
    }
  }

  /**
   * Exporta relatório em formato compatível com Firebase
   */
  static prepararParaFirebase(
    almoxarifado: string,
    itens: ItemInventario[],
    inventariante?: string
  ): any {
    return {
      almoxarifado,
      data: new Date().toISOString(),
      inventariante: inventariante || 'Não informado',
      totalItens: itens.length,
      resumo: {
        ok: itens.filter(i => i.diferenca === 0).length,
        sobra: itens.filter(i => i.diferenca > 0).length,
        falta: itens.filter(i => i.diferenca < 0).length,
        aguardando: itens.filter(i => i.totalFisico === 0 && i.saldoSpalm === 0).length,
      },
      itens: itens.map(item => ({
        ...item,
        // Remover campos desnecessários
        observacoes: undefined,
      })),
    };
  }
}