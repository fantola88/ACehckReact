// contexts/InventariantesContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import type { Inventariante } from '../data/types';
import { DatabaseService } from '../services/DatabaseService';
import { StorageService } from '../utils/storage';

interface InventariantesContextData {
  inventariantes: Inventariante[];
  loading: boolean;
  error: string | null;
  selectedInventariante: Inventariante | null;
  addInventariante: (inventariante: Omit<Inventariante, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInventariante: (id: string, inventariante: Partial<Inventariante>) => Promise<void>;
  deleteInventariante: (id: string) => Promise<void>;
  selectInventariante: (inventariante: Inventariante | null) => void;
  searchInventariantes: (term: string) => Inventariante[];
  refreshInventariantes: () => Promise<void>;
  syncWithFirebase: () => Promise<void>;
}

const InventariantesContext = createContext<InventariantesContextData>({} as InventariantesContextData);

export const useInventariantes = () => useContext(InventariantesContext);

interface InventariantesProviderProps {
  children: React.ReactNode;
}

export const InventariantesProvider: React.FC<InventariantesProviderProps> = ({ children }) => {
  const [inventariantes, setInventariantes] = useState<Inventariante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInventariante, setSelectedInventariante] = useState<Inventariante | null>(null);

  // Carregar inventariantes ao iniciar
  useEffect(() => {
    loadInventariantes();
  }, []);

  // Função para garantir que o usuário atual esteja na lista
  const ensureCurrentUserInList = async (firebaseData: Inventariante[]): Promise<Inventariante[]> => {
    const currentUser = auth.currentUser;
    
    if (!currentUser) return firebaseData;

    // Verificar se o usuário atual já existe na lista
    const userExists = firebaseData.some(inv => 
      inv.email === currentUser.email || inv.uid === currentUser.uid
    );

    if (!userExists) {
      // Criar novo inventariante baseado no usuário atual
      const novoInventariante = {
        nome: currentUser.displayName || 'Usuário',
        email: currentUser.email || '',
        cargo: 'Usuário',
        setor: 'Sistema',
        uid: currentUser.uid,
      };

      try {
        // Salvar no Firebase
        const newId = await DatabaseService.addInventariante(novoInventariante);
        
        const novoInventarianteCompleto: Inventariante = {
          id: newId,
          ...novoInventariante,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return [...firebaseData, novoInventarianteCompleto];
      } catch (error) {
        console.error('Erro ao adicionar usuário atual como inventariante:', error);
        
        // Se falhar no Firebase, adicionar localmente
        const novoInventarianteLocal: Inventariante = {
          id: `local_${Date.now()}`,
          ...novoInventariante,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        return [...firebaseData, novoInventarianteLocal];
      }
    }

    return firebaseData;
  };

  const loadInventariantes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Tentar carregar do Firebase primeiro
      try {
        let firebaseData = await DatabaseService.getInventariantes();
        
        // Garantir que o usuário atual está na lista
        firebaseData = await ensureCurrentUserInList(firebaseData);
        
        if (firebaseData.length > 0) {
          setInventariantes(firebaseData);
          // Salvar localmente como backup
          await StorageService.saveInventariantes(firebaseData.map(i => i.nome));
          return;
        }
      } catch (firebaseError) {
        console.log('Erro ao carregar do Firebase, usando dados locais:', firebaseError);
      }
      
      // Fallback para dados locais
      const localData = await StorageService.getInventariantes();
      const localInventariantes: Inventariante[] = localData.map((nome, index) => ({
        id: `local_${index}`,
        nome: nome,
      }));
      
      // Adicionar usuário atual se não existir nos dados locais
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userExists = localInventariantes.some(inv => inv.nome === currentUser.displayName);
        if (!userExists) {
          localInventariantes.push({
            id: `local_user_${Date.now()}`,
            nome: currentUser.displayName || 'Usuário',
            email: currentUser.email || '',
            cargo: 'Usuário',
            setor: 'Sistema',
            uid: currentUser.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      
      setInventariantes(localInventariantes);
      
    } catch (err) {
      setError('Erro ao carregar inventariantes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addInventariante = async (inventariante: Omit<Inventariante, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      
      // Verificar se já existe um inventariante com mesmo email/uid
      const exists = inventariantes.some(inv => 
        (inventariante.email && inv.email === inventariante.email) ||
        (inventariante.uid && inv.uid === inventariante.uid)
      );

      if (exists) {
        throw new Error('Já existe um inventariante com este email');
      }
      
      // Tentar salvar no Firebase
      let newId: string;
      try {
        newId = await DatabaseService.addInventariante(inventariante);
      } catch (firebaseError) {
        console.log('Erro ao salvar no Firebase, salvando localmente:', firebaseError);
        newId = `local_${Date.now()}`;
        // Adicionar à fila de sincronização
        await StorageService.addToSyncQueue({
          type: 'ADD_INVENTARIANTE',
          data: inventariante,
          timestamp: new Date().toISOString(),
        });
      }
      
      const newInventariante: Inventariante = {
        id: newId,
        ...inventariante,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setInventariantes(prev => [...prev, newInventariante].sort((a, b) => 
        a.nome.localeCompare(b.nome)
      ));
      
      // Salvar localmente
      await StorageService.addInventariante(inventariante.nome);
      
    } catch (err) {
      setError('Erro ao adicionar inventariante');
      console.error(err);
      throw err;
    }
  };

  const updateInventariante = async (id: string, inventariante: Partial<Inventariante>) => {
    try {
      setError(null);
      
      // Tentar atualizar no Firebase
      try {
        await DatabaseService.updateInventariante(id, inventariante);
      } catch (firebaseError) {
        console.log('Erro ao atualizar no Firebase, atualizando localmente:', firebaseError);
        // Adicionar à fila de sincronização
        await StorageService.addToSyncQueue({
          type: 'UPDATE_INVENTARIANTE',
          id,
          data: inventariante,
          timestamp: new Date().toISOString(),
        });
      }
      
      setInventariantes(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...inventariante, updatedAt: new Date() }
            : item
        ).sort((a, b) => a.nome.localeCompare(b.nome))
      );
      
      // Atualizar selecionado se for o mesmo
      if (selectedInventariante?.id === id) {
        setSelectedInventariante(prev => prev ? { ...prev, ...inventariante } : null);
      }
      
      // Atualizar storage local
      const nomes = inventariantes.map(i => i.nome);
      if (inventariante.nome) {
        const index = nomes.findIndex(n => n === selectedInventariante?.nome);
        if (index !== -1) {
          nomes[index] = inventariante.nome;
          await StorageService.saveInventariantes(nomes);
        }
      }
      
    } catch (err) {
      setError('Erro ao atualizar inventariante');
      console.error(err);
      throw err;
    }
  };

  const deleteInventariante = async (id: string) => {
    try {
      setError(null);
      
      // Verificar se é o usuário atual
      const inventariante = inventariantes.find(inv => inv.id === id);
      const currentUser = auth.currentUser;
      
      if (inventariante?.uid && inventariante.uid === currentUser?.uid) {
        throw new Error('Não é possível remover seu próprio usuário');
      }
      
      // Tentar deletar no Firebase
      try {
        await DatabaseService.deleteInventariante(id);
      } catch (firebaseError) {
        console.log('Erro ao deletar no Firebase, deletando localmente:', firebaseError);
        // Adicionar à fila de sincronização
        await StorageService.addToSyncQueue({
          type: 'DELETE_INVENTARIANTE',
          id,
          timestamp: new Date().toISOString(),
        });
      }
      
      const deletedInventariante = inventariantes.find(i => i.id === id);
      
      setInventariantes(prev => prev.filter(item => item.id !== id));
      
      // Remover do storage local
      if (deletedInventariante) {
        await StorageService.removeInventariante(deletedInventariante.nome);
      }
      
      // Limpar selecionado se for o mesmo
      if (selectedInventariante?.id === id) {
        setSelectedInventariante(null);
      }
      
    } catch (err) {
      setError('Erro ao deletar inventariante');
      console.error(err);
      throw err;
    }
  };

  const selectInventariante = (inventariante: Inventariante | null) => {
    setSelectedInventariante(inventariante);
  };

  const searchInventariantes = (term: string): Inventariante[] => {
    if (!term.trim()) return inventariantes;
    
    const searchTerm = term.toLowerCase().trim();
    return inventariantes.filter(inv => 
      inv.nome.toLowerCase().includes(searchTerm) ||
      inv.cargo?.toLowerCase().includes(searchTerm) ||
      inv.setor?.toLowerCase().includes(searchTerm) ||
      inv.email?.toLowerCase().includes(searchTerm)
    );
  };

  const refreshInventariantes = async () => {
    await loadInventariantes();
  };

  const syncWithFirebase = async () => {
    try {
      setLoading(true);
      
      // Pegar fila de sincronização
      const queue = await StorageService.getSyncQueue();
      
      for (const operation of queue) {
        try {
          switch (operation.type) {
            case 'ADD_INVENTARIANTE':
              await DatabaseService.addInventariante(operation.data);
              break;
            case 'UPDATE_INVENTARIANTE':
              await DatabaseService.updateInventariante(operation.id, operation.data);
              break;
            case 'DELETE_INVENTARIANTE':
              await DatabaseService.deleteInventariante(operation.id);
              break;
          }
        } catch (error) {
          console.error(`Erro ao sincronizar operação ${operation.type}:`, error);
        }
      }
      
      // Limpar fila após sincronização
      await StorageService.clearSyncQueue();
      
      // Recarregar dados
      await loadInventariantes();
      
    } catch (err) {
      setError('Erro ao sincronizar com Firebase');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <InventariantesContext.Provider
      value={{
        inventariantes,
        loading,
        error,
        selectedInventariante,
        addInventariante,
        updateInventariante,
        deleteInventariante,
        selectInventariante,
        searchInventariantes,
        refreshInventariantes,
        syncWithFirebase,
      }}
    >
      {children}
    </InventariantesContext.Provider>
  );
};