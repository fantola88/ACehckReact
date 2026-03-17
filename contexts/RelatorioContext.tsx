// contexts/RelatorioContext.tsx
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { db } from '../config/firebase';
import type { ItemInventario, Relatorio } from '../data/types';
import { calcularResumo } from '../utils/calculos';
import { AuthContext } from './AuthContext';

interface RelatorioContextData {
  relatorios: Relatorio[];
  loading: boolean;
  error: string | null;
  relatorioAtivo: Relatorio | null;
  getRelatorio: (id: string) => Relatorio | undefined;
  addItem: (relatorioId: string, item: Omit<ItemInventario, 'id'>) => Promise<void>;
  updateItem: (relatorioId: string, itemId: string, item: Partial<ItemInventario>) => Promise<void>;
  removeItem: (relatorioId: string, itemId: string) => Promise<void>;
  criarRelatorio: (titulo: string, almoxarifado: string, inventariante: string) => Promise<string>;
  arquivarRelatorio: (relatorioId: string) => Promise<void>;
  desarquivarRelatorio: (relatorioId: string) => Promise<void>; // NOVA FUNÇÃO
  excluirRelatorio: (relatorioId: string) => Promise<void>;
  duplicarRelatorio: (relatorioId: string, novoTitulo: string) => Promise<string>;
  getResumo: (relatorioId: string) => {
    total: number;
    ok: number;
    sobra: number;
    falta: number;
    aguardando: number;
  };
  podeEditar: (relatorioId: string) => boolean;
}

// Criar o contexto
const RelatorioContext = createContext<RelatorioContextData | undefined>(undefined);

// Hook personalizado
export const useRelatorio = () => {
  const context = useContext(RelatorioContext);
  if (!context) {
    throw new Error('useRelatorio must be used within a RelatorioProvider');
  }
  return context;
};

// Provider
export const RelatorioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatorioAtivo, setRelatorioAtivo] = useState<Relatorio | null>(null);
  
  const { user } = useContext(AuthContext);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Configurar listener para TODOS os relatórios
  useEffect(() => {
    console.log('👤 RelatorioProvider - user mudou:', user?.uid);
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const relatoriosRef = collection(db, 'relatorios');
    const q = query(
      relatoriosRef,
      orderBy('dataCriacao', 'desc')
    );
    
    console.log('📡 Configurando listener para TODOS os relatórios');
    setLoading(true);

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log(`📥 Recebidos ${snapshot.docs.length} relatórios`);
        
        const relatoriosList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            itens: data.itens || [],
            resumo: data.resumo || { ok: 0, sobra: 0, falta: 0, aguardando: 0 }
          } as Relatorio;
        });

        setRelatorios(relatoriosList);
        
        if (user) {
          const ativo = relatoriosList.find(r => 
            r.status === 'em_andamento' && r.userId === user.uid
          );
          setRelatorioAtivo(ativo || null);
        }
        
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('❌ Erro no listener:', error);
        setError('Erro de sincronização');
        setLoading(false);
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.uid]);

  // Função para verificar se o usuário pode editar
  const podeEditar = (relatorioId: string): boolean => {
    if (!user) return false;
    const relatorio = relatorios.find(r => r.id === relatorioId);
    return relatorio?.userId === user.uid;
  };

  const getRelatorio = (id: string): Relatorio | undefined => {
    return relatorios.find(r => r.id === id);
  };

  const criarRelatorio = async (titulo: string, almoxarifado: string, inventariante: string): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');

    const now = new Date();
    const novoRelatorio = {
      titulo,
      almoxarifado,
      inventariante,
      dataCriacao: now.toLocaleDateString('pt-BR'),
      dataISO: now.toISOString(),
      status: 'em_andamento',
      itens: [],
      totalItens: 0,
      resumo: { ok: 0, sobra: 0, falta: 0, aguardando: 0 },
      userId: user.uid,
      userEmail: user.email,
      userDisplayName: user.displayName || inventariante,
    };

    const docRef = await addDoc(collection(db, 'relatorios'), {
      ...novoRelatorio,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  };

  const arquivarRelatorio = async (relatorioId: string) => {
    if (!podeEditar(relatorioId)) {
      Alert.alert('Erro', 'Você não tem permissão para arquivar este relatório');
      return;
    }

    try {
      await updateDoc(doc(db, 'relatorios', relatorioId), {
        status: 'arquivado',
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao arquivar:', error);
      Alert.alert('Erro', 'Não foi possível arquivar');
    }
  };

  // NOVA FUNÇÃO: Desarquivar relatório
  const desarquivarRelatorio = async (relatorioId: string) => {
    if (!podeEditar(relatorioId)) {
      Alert.alert('Erro', 'Você não tem permissão para desarquivar este relatório');
      return;
    }

    try {
      await updateDoc(doc(db, 'relatorios', relatorioId), {
        status: 'em_andamento',
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao desarquivar:', error);
      Alert.alert('Erro', 'Não foi possível desarquivar');
    }
  };

  const excluirRelatorio = async (relatorioId: string) => {
    if (!podeEditar(relatorioId)) {
      Alert.alert('Erro', 'Você não tem permissão para excluir este relatório');
      return;
    }

    Alert.alert(
      'Excluir Relatório',
      'Tem certeza?',
      [
        { text: 'Cancelar' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'relatorios', relatorioId));
            } catch (error) {
              console.error('Erro ao excluir:', error);
              Alert.alert('Erro', 'Não foi possível excluir');
            }
          },
        },
      ]
    );
  };

  const duplicarRelatorio = async (relatorioId: string, novoTitulo: string): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');

    const original = relatorios.find(r => r.id === relatorioId);
    if (!original) throw new Error('Relatório não encontrado');

    const { id, ...dadosOriginal } = original;
    
    const novoRelatorio = {
      ...dadosOriginal,
      titulo: novoTitulo,
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      dataISO: new Date().toISOString(),
      status: 'em_andamento',
      userId: user.uid,
      userEmail: user.email,
      userDisplayName: user.displayName || original.inventariante,
    };

    const docRef = await addDoc(collection(db, 'relatorios'), {
      ...novoRelatorio,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  };

  const addItem = async (relatorioId: string, item: Omit<ItemInventario, 'id'>) => {
    if (!podeEditar(relatorioId)) {
      Alert.alert('Erro', 'Você não tem permissão para adicionar itens neste relatório');
      return;
    }

    try {
      const relatorio = relatorios.find(r => r.id === relatorioId);
      if (!relatorio) return;
      
      if (relatorio.status !== 'em_andamento') {
        Alert.alert('Erro', 'Relatório não está em andamento');
        return;
      }

      const newItem = {
        id: Date.now().toString(),
        ...item,
      };

      const itensAtualizados = [...relatorio.itens, newItem];
      const novoResumo = calcularResumo(itensAtualizados);

      await updateDoc(doc(db, 'relatorios', relatorioId), {
        itens: itensAtualizados,
        totalItens: itensAtualizados.length,
        resumo: novoResumo,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao adicionar:', error);
      Alert.alert('Erro', 'Não foi possível adicionar');
    }
  };

  const updateItem = async (relatorioId: string, itemId: string, item: Partial<ItemInventario>) => {
    if (!podeEditar(relatorioId)) {
      Alert.alert('Erro', 'Você não tem permissão para editar itens neste relatório');
      return;
    }

    try {
      const relatorio = relatorios.find(r => r.id === relatorioId);
      if (!relatorio) return;

      const itensAtualizados = relatorio.itens.map(i =>
        i.id === itemId ? { ...i, ...item } : i
      );

      await updateDoc(doc(db, 'relatorios', relatorioId), {
        itens: itensAtualizados,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', 'Não foi possível atualizar');
    }
  };

  const removeItem = async (relatorioId: string, itemId: string) => {
    if (!podeEditar(relatorioId)) {
      Alert.alert('Erro', 'Você não tem permissão para remover itens deste relatório');
      return;
    }

    try {
      const relatorio = relatorios.find(r => r.id === relatorioId);
      if (!relatorio) return;

      const itensAtualizados = relatorio.itens.filter(i => i.id !== itemId);
      const novoResumo = calcularResumo(itensAtualizados);

      await updateDoc(doc(db, 'relatorios', relatorioId), {
        itens: itensAtualizados,
        totalItens: itensAtualizados.length,
        resumo: novoResumo,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao remover:', error);
      Alert.alert('Erro', 'Não foi possível remover');
    }
  };

  const getResumo = (relatorioId: string) => {
    const relatorio = relatorios.find(r => r.id === relatorioId);
    return relatorio?.resumo || { total: 0, ok: 0, sobra: 0, falta: 0, aguardando: 0 };
  };

  return (
    <RelatorioContext.Provider
      value={{
        relatorios,
        loading,
        error,
        relatorioAtivo,
        getRelatorio,
        addItem,
        updateItem,
        removeItem,
        criarRelatorio,
        arquivarRelatorio,
        desarquivarRelatorio, // ADICIONADO
        excluirRelatorio,
        duplicarRelatorio,
        getResumo,
        podeEditar,
      }}
    >
      {children}
    </RelatorioContext.Provider>
  );
};