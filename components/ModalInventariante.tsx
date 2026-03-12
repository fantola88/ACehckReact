// components/ModalInventariante.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
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
import Button from './Button';
import Card from './Card';
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
    addInventariante,
    updateInventariante,
    deleteInventariante,
    selectInventariante,
  } = useInventariantes();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventariantes, setFilteredInventariantes] = useState<Inventariante[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [setor, setSetor] = useState('');
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
        (inv) =>
          inv.nome.toLowerCase().includes(term) ||
          inv.cargo?.toLowerCase().includes(term) ||
          inv.setor?.toLowerCase().includes(term)
      );
      setFilteredInventariantes(filtered);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setNome('');
    setCargo('');
    setSetor('');
    setErrors({});
  };

  const handleEdit = (inventariante: Inventariante) => {
    setEditingId(inventariante.id || null);
    setNome(inventariante.nome);
    setCargo(inventariante.cargo || '');
    setSetor(inventariante.setor || '');
    setShowForm(true);
  };

  const handleDelete = (inventariante: Inventariante) => {
    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente remover "${inventariante.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              if (inventariante.id) {
                await deleteInventariante(inventariante.id);
              }
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover o inventariante');
            }
          },
        },
      ]
    );
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
    if (!validateForm()) return;

    try {
      if (editingId) {
        await updateInventariante(editingId, {
          nome: nome.trim(),
          cargo: cargo.trim() || undefined,
          setor: setor.trim() || undefined,
        });
        Alert.alert('Sucesso', 'Inventariante atualizado com sucesso!');
      } else {
        await addInventariante({
          nome: nome.trim(),
          cargo: cargo.trim() || undefined,
          setor: setor.trim() || undefined,
        });
        Alert.alert('Sucesso', 'Inventariante adicionado com sucesso!');
      }
      resetForm();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o inventariante');
    }
  };

  const renderInventarianteItem = ({ item }: { item: Inventariante }) => (
    <TouchableOpacity
      style={styles.inventarianteItem}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.inventarianteInfo}>
        <Text style={styles.inventarianteNome}>{item.nome}</Text>
        {(item.cargo || item.setor) && (
          <Text style={styles.inventarianteDetalhe}>
            {[item.cargo, item.setor].filter(Boolean).join(' • ')}
          </Text>
        )}
      </View>
      
      <View style={styles.inventarianteActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderForm = () => (
    <Card style={styles.formCard}>
      <Text style={styles.formTitle}>
        {editingId ? 'Editar Inventariante' : 'Novo Inventariante'}
      </Text>
      
      <InputField
        label="Nome completo"
        value={nome}
        onChangeText={setNome}
        placeholder="Digite o nome..."
        required
        error={errors.nome}
        autoCapitalize="words"
      />
      
      <InputField
        label="Cargo (opcional)"
        value={cargo}
        onChangeText={setCargo}
        placeholder="Ex: Almoxarife, Auditor..."
        autoCapitalize="words"
      />
      
      <InputField
        label="Setor (opcional)"
        value={setor}
        onChangeText={setSetor}
        placeholder="Ex: Almoxarifado Central..."
        autoCapitalize="words"
      />
      
      <View style={styles.formActions}>
        <Button
          title="Cancelar"
          variant="outline"
          size="small"
          onPress={resetForm}
          style={styles.formButton}
        />
        <Button
          title="Salvar"
          variant="primary"
          size="small"
          onPress={handleSubmit}
          style={styles.formButton}
          loading={loading}
        />
      </View>
    </Card>
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
            <Text style={styles.modalTitle}>Gerenciar Inventariantes</Text>
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
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowForm(true)}
              >
                <Ionicons name="add" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Formulário de cadastro/edição */}
            {showForm && renderForm()}

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
                  {!searchTerm && (
                    <TouchableOpacity
                      style={styles.emptyButton}
                      onPress={() => setShowForm(true)}
                    >
                      <Text style={styles.emptyButtonText}>Adicionar primeiro</Text>
                    </TouchableOpacity>
                  )}
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
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.accent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    marginBottom: 16,
    padding: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    maxWidth: 120,
  },
  listContent: {
    paddingBottom: 20,
  },
  inventarianteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.lighterGray,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  inventarianteInfo: {
    flex: 1,
  },
  inventarianteNome: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  inventarianteDetalhe: {
    fontSize: 12,
    color: colors.gray,
  },
  inventarianteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
  },
  editButton: {
    borderColor: colors.primary,
  },
  deleteButton: {
    borderColor: colors.danger,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default ModalInventariante;