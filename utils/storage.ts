// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  INVENTARIANTES: '@acheck_inventariantes',
  RELATORIO_PREFIX: '@acheck_relatorio_',
  CONFIG: '@acheck_config',
  USER: '@acheck_user',
  SYNC_QUEUE: '@acheck_sync_queue',
} as const;

export class StorageService {
  // =========== AsyncStorage (dados locais) ===========
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Erro ao salvar no AsyncStorage:', error);
      throw error;
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Erro ao ler do AsyncStorage:', error);
      throw error;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Erro ao remover do AsyncStorage:', error);
      throw error;
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar AsyncStorage:', error);
      throw error;
    }
  }

  // =========== Inventariantes ===========
  static async getInventariantes(): Promise<string[]> {
    const data = await this.getItem<string[]>(STORAGE_KEYS.INVENTARIANTES);
    return data || [];
  }

  static async saveInventariantes(inventariantes: string[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.INVENTARIANTES, inventariantes);
  }

  static async addInventariante(inventariante: string): Promise<void> {
    const inventariantes = await this.getInventariantes();
    if (!inventariantes.includes(inventariante)) {
      inventariantes.push(inventariante);
      inventariantes.sort();
      await this.saveInventariantes(inventariantes);
    }
  }

  static async removeInventariante(inventariante: string): Promise<void> {
    const inventariantes = await this.getInventariantes();
    const index = inventariantes.indexOf(inventariante);
    if (index !== -1) {
      inventariantes.splice(index, 1);
      await this.saveInventariantes(inventariantes);
    }
  }

  // =========== Relatórios por Almoxarifado ===========
  static getRelatorioKey(almoxarifado: string): string {
    return `${STORAGE_KEYS.RELATORIO_PREFIX}${almoxarifado.replace(/\s+/g, '_')}`;
  }

  static async getRelatorio(almoxarifado: string): Promise<any[]> {
    const key = this.getRelatorioKey(almoxarifado);
    const data = await this.getItem<any[]>(key);
    return data || [];
  }

  static async saveRelatorio(almoxarifado: string, relatorio: any[]): Promise<void> {
    const key = this.getRelatorioKey(almoxarifado);
    await this.setItem(key, relatorio);
  }

  static async addItemToRelatorio(almoxarifado: string, item: any): Promise<void> {
    const relatorio = await this.getRelatorio(almoxarifado);
    relatorio.unshift({
      ...item,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    });
    await this.saveRelatorio(almoxarifado, relatorio);
  }

  static async updateItemInRelatorio(almoxarifado: string, itemId: string, updatedItem: any): Promise<void> {
    const relatorio = await this.getRelatorio(almoxarifado);
    const index = relatorio.findIndex(item => item.id === itemId);
    if (index !== -1) {
      relatorio[index] = { ...relatorio[index], ...updatedItem };
      await this.saveRelatorio(almoxarifado, relatorio);
    }
  }

  static async removeItemFromRelatorio(almoxarifado: string, itemId: string): Promise<void> {
    const relatorio = await this.getRelatorio(almoxarifado);
    const index = relatorio.findIndex(item => item.id === itemId);
    if (index !== -1) {
      relatorio.splice(index, 1);
      await this.saveRelatorio(almoxarifado, relatorio);
    }
  }

  static async clearRelatorio(almoxarifado: string): Promise<void> {
    const key = this.getRelatorioKey(almoxarifado);
    await this.removeItem(key);
  }

  // =========== Sistema de Arquivos (para exportação) ===========
  static async saveFile(filename: string, content: string | Blob, mimeType: string): Promise<string> {
    if (Platform.OS === 'web') {
      // Web: download via blob
      const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return url;
    } else {
      // Mobile: salvar no sistema de arquivos
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      if (content instanceof Blob) {
        // Converter Blob para base64
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            await FileSystem.writeAsStringAsync(fileUri, base64.split(',')[1], {
              encoding: FileSystem.EncodingType.Base64,
            });
            resolve(fileUri);
          };
          reader.onerror = reject;
          reader.readAsDataURL(content);
        });
      } else {
        // String content
        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        return fileUri;
      }
    }
  }

  static async shareFile(fileUri: string, filename: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Web: já foi feito download
      return;
    } else {
      // Mobile: compartilhar
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/octet-stream',
          dialogTitle: `Compartilhar ${filename}`,
          UTI: 'public.data',
        });
      } else {
        alert('Compartilhamento não disponível neste dispositivo');
      }
    }
  }

  // =========== Fila de Sincronização ===========
  static async addToSyncQueue(operation: any): Promise<void> {
    const queue = await this.getItem<any[]>(STORAGE_KEYS.SYNC_QUEUE) || [];
    queue.push({
      ...operation,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    });
    await this.setItem(STORAGE_KEYS.SYNC_QUEUE, queue);
  }

  static async getSyncQueue(): Promise<any[]> {
    return await this.getItem<any[]>(STORAGE_KEYS.SYNC_QUEUE) || [];
  }

  static async clearSyncQueue(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.SYNC_QUEUE);
  }

  // =========== Configurações ===========
  static async getConfig(): Promise<any> {
    return await this.getItem(STORAGE_KEYS.CONFIG) || {};
  }

  static async saveConfig(config: any): Promise<void> {
    const currentConfig = await this.getConfig();
    await this.setItem(STORAGE_KEYS.CONFIG, { ...currentConfig, ...config });
  }
}