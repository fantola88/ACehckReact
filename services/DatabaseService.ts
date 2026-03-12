// services/DatabaseService.ts
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QueryConstraint,
    Timestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    Inventariante,
    Produto,
    Relatorio
} from '../data/types';

export class DatabaseService {
  // =========== PRODUTOS ===========
  static async getProdutos(almoxarifado?: string): Promise<Produto[]> {
    try {
      const constraints: QueryConstraint[] = [];
      
      if (almoxarifado) {
        constraints.push(where('almox', '==', almoxarifado));
      }
      
      constraints.push(orderBy('nome'));
      
      const q = query(collection(db, 'produtos'), ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Produto));
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  static async getProdutoById(id: string): Promise<Produto | null> {
    try {
      const docRef = doc(db, 'produtos', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Produto;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  }

  static async addProduto(produto: Omit<Produto, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'produtos'), {
        ...produto,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  }

  static async updateProduto(id: string, produto: Partial<Produto>): Promise<void> {
    try {
      const docRef = doc(db, 'produtos', id);
      await updateDoc(docRef, {
        ...produto,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }

  static async deleteProduto(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'produtos', id));
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }

  static async importarProdutos(produtos: Omit<Produto, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<number> {
    try {
      const batch = writeBatch(db);
      const now = Timestamp.now();
      
      produtos.forEach((produto) => {
        const docRef = doc(collection(db, 'produtos'));
        batch.set(docRef, {
          ...produto,
          createdAt: now,
          updatedAt: now
        });
      });
      
      await batch.commit();
      return produtos.length;
    } catch (error) {
      console.error('Erro ao importar produtos:', error);
      throw error;
    }
  }

  // =========== INVENTARIANTES ===========
  static async getInventariantes(): Promise<Inventariante[]> {
    try {
      const q = query(
        collection(db, 'inventariantes'), 
        orderBy('nome')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Inventariante));
    } catch (error) {
      console.error('Erro ao buscar inventariantes:', error);
      throw error;
    }
  }

  static async addInventariante(inventariante: Omit<Inventariante, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'inventariantes'), {
        ...inventariante,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar inventariante:', error);
      throw error;
    }
  }

  static async updateInventariante(id: string, inventariante: Partial<Inventariante>): Promise<void> {
    try {
      const docRef = doc(db, 'inventariantes', id);
      await updateDoc(docRef, {
        ...inventariante,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao atualizar inventariante:', error);
      throw error;
    }
  }

  static async deleteInventariante(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'inventariantes', id));
    } catch (error) {
      console.error('Erro ao deletar inventariante:', error);
      throw error;
    }
  }

  // =========== RELATÓRIOS ===========
  static async getRelatorios(almoxarifado?: string, limitCount: number = 50): Promise<Relatorio[]> {
    try {
      const constraints: QueryConstraint[] = [
        orderBy('dataISO', 'desc'),
        limit(limitCount)
      ];
      
      if (almoxarifado) {
        constraints.unshift(where('almoxarifado', '==', almoxarifado));
      }
      
      const q = query(collection(db, 'relatorios'), ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Relatorio));
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      throw error;
    }
  }

  static async getRelatorioById(id: string): Promise<Relatorio | null> {
    try {
      const docRef = doc(db, 'relatorios', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Relatorio;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      throw error;
    }
  }

  static async saveRelatorio(relatorio: Omit<Relatorio, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'relatorios'), {
        ...relatorio,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      throw error;
    }
  }

  static async updateRelatorio(id: string, relatorio: Partial<Relatorio>): Promise<void> {
    try {
      const docRef = doc(db, 'relatorios', id);
      await updateDoc(docRef, {
        ...relatorio,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao atualizar relatório:', error);
      throw error;
    }
  }

  static async deleteRelatorio(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'relatorios', id));
    } catch (error) {
      console.error('Erro ao deletar relatório:', error);
      throw error;
    }
  }

  // =========== BACKUP E SINCRONIZAÇÃO ===========
  static async exportarDados(): Promise<any> {
    try {
      const [produtos, inventariantes, relatorios] = await Promise.all([
        this.getProdutos(),
        this.getInventariantes(),
        this.getRelatorios()
      ]);
      
      return {
        produtos,
        inventariantes,
        relatorios,
        exportadoEm: new Date().toISOString(),
        versao: '1.0.0'
      };
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  }

  static async importarDados(dados: any): Promise<void> {
    try {
      const batch = writeBatch(db);
      const now = Timestamp.now();
      
      // Importar produtos
      if (dados.produtos?.length) {
        dados.produtos.forEach((produto: any) => {
          const docRef = doc(collection(db, 'produtos'));
          batch.set(docRef, {
            ...produto,
            createdAt: now,
            updatedAt: now
          });
        });
      }
      
      // Importar inventariantes
      if (dados.inventariantes?.length) {
        dados.inventariantes.forEach((inv: any) => {
          const docRef = doc(collection(db, 'inventariantes'));
          batch.set(docRef, {
            ...inv,
            createdAt: now,
            updatedAt: now
          });
        });
      }
      
      // Importar relatórios
      if (dados.relatorios?.length) {
        dados.relatorios.forEach((rel: any) => {
          const docRef = doc(collection(db, 'relatorios'));
          batch.set(docRef, {
            ...rel,
            createdAt: now,
            updatedAt: now
          });
        });
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      throw error;
    }
  }
}