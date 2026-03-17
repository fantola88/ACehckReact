// components/ModalInventariante.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useInventariantes } from '../contexts/InventariantesContext';
import type { Inventariante } from '../data/types';
import { colors } from '../styles/colors';
import InputField from './InputField';

interface ModalInventarianteProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: (inventariante: Inventariante) => void;
}

export const ModalInventariante: React.FC<ModalInventarianteProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const {
    inventariantes,
    loading,
    updateInventariante,
    selectInventariante,
  } = useInventariantes();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventariantes, setFilteredInventariantes] = useState<Inventariante[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [nome, setNome] = useState('');
  const [errors, setErrors] = useState<{ nome?: string }>({});

  useEffect(() => {
    if (visible) {
      filterInventariantes();
    } else {
      resetForm();
    }
  }, [visible, inventariantes, searchTerm]);

  const filterInventariantes = () => {
    if (!searchTerm.trim()) {
      setFilteredInventariantes(inventariantes);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = inventariantes.filter(
        (inv) => inv.nome.toLowerCase().includes(term)
      );
      setFilteredInventariantes(filtered);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setNome('');
    setErrors({});
  };

  const handleEdit = (inventariante: Inventariante) => {
    setEditingId(inventariante.id || null);
    setNome(inventariante.nome);
  };

  const handleSelect = (inventariante: Inventariante) => {
    selectInventariante(inventariante);
    if (onSelect) {
      onSelect(inventariante);
    }
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: { nome?: string } = {};
    
    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !editingId) return;

    try {
      await updateInventariante(editingId, {
        nome: nome.trim(),
      });
      resetForm();
    } catch (error) {
      // Silently fail - no alert needed
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const renderInventarianteItem = ({ item }: { item: Inventariante }) => (
    <View style={styles.inventarianteItem}>
      {editingId === item.id ? (
        // Modo edição
        <View style={styles.editContainer}>
          <InputField
            value={nome}
            onChangeText={setNome}
            placeholder="Digite o nome..."
            autoCapitalize="words"
            error={errors.nome}
            style={styles.editInput}
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Ionicons 
                name="checkmark" 
                size={20} 
                color={colors.white} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelEdit}
            >
              <Ionicons 
                name="close" 
                size={20} 
                color={colors.white} 
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Modo visualização
        <>
          <TouchableOpacity
            style={styles.inventarianteInfo}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.inventarianteNome}>{item.nome}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Inventariantes</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Barra de pesquisa */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color={colors.gray} />
                <InputField
                  placeholder="Pesquisar inventariantes..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  style={styles.searchInput}
                />
              </View>
            </View>

            {/* Lista de inventariantes */}
            <FlatList
              data={filteredInventariantes}
              keyExtractor={(item) => item.id || item.nome}
              renderItem={renderInventarianteItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={50} color={colors.lightGray} />
                  <Text style={styles.emptyText}>
                    {searchTerm
                      ? 'Nenhum inventariante encontrado'
                      : 'Nenhum inventariante cadastrado'}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: colors.primary,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  inventarianteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.lighterGray,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.lightGray,
    minHeight: 64,
  },
  inventarianteInfo: {
    flex: 1,
    paddingVertical: 8,
  },
  inventarianteNome: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: colors.success,
  },
  cancelButton: {
    backgroundColor: colors.danger,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ModalInventariante;