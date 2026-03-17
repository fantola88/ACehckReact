// app/(tabs)/itens.tsx
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { FlashList } from '@shopify/flash-list';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  InteractionManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Componentes
import Button from '../../components/Button';
import Card from '../../components/Card';
import InputField from '../../components/InputField';
import { ProdutoItem } from '../../components/ProdutoItem';

// Contexts
import { usePreferencias } from '../../contexts/PreferenciasContext';

// Hooks
import { useSound } from '../../hooks/useSound';

// Data
import { produtos } from '../../data/produtos';
import type { Produto, UnidadeMedida } from '../../data/types';
import { colors } from '../../styles/colors';

// ATUALIZADO: Adicionado SPFR Papéis
const ALMOXARIFADOS = [
  { label: 'Almoxarifado Central', value: 'Almoxarifado Central' },
  { label: 'Almoxarifado de Alimentícios', value: 'Almoxarifado de Alimentícios' },
  { label: 'Almoxarifado do Serviço Médico', value: 'Almoxarifado do Serviço Médico' },
  { label: 'Almoxarifado de Informática', value: 'Almoxarifado de Informática' },
  { label: 'Almoxarifado de Produtos Gráficos', value: 'Almoxarifado de Produtos Gráficos' },
  { label: 'Almoxarifado SAPF Papéis', value: 'Almoxarifado SAPF Papéis' }, // NOVO
];

const UNIDADES_MEDIDA: UnidadeMedida[] = [
  'UNIDADE', 'QUILOGRAMA', 'LITRO', 'CAIXA', 'PACOTE', 
  'FRASCO', 'PEÇA', 'METRO', 'ROLO', 'AMPOLA', 'COMPRIMIDO', 'BISNAGA'
];

export default function ItensScreen() {
  const [selectedAlmox, setSelectedAlmox] = useState(ALMOXARIFADOS[0].value);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Preferências
  const { efeitosSonoros, avisosVisuais } = usePreferencias();
  const { playSuccessSound, playErrorSound } = useSound();
  
  // Refs para controle
  const listRef = useRef<FlashList<Produto>>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const allProdutosRef = useRef<Produto[]>([]);

  // Form states
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [unidade, setUnidade] = useState<UnidadeMedida>('UNIDADE');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Carregar dados iniciais de forma otimizada
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      loadInitialData();
    });
  }, []);

  const loadInitialData = () => {
    setLoading(true);
    
    // Processar em chunks para não travar a UI
    const chunkSize = 500;
    const chunks: Produto[][] = [];
    
    for (let i = 0; i < produtos.length; i += chunkSize) {
      chunks.push(produtos.slice(i, i + chunkSize));
    }
    
    let processedCount = 0;
    
    const processNextChunk = () => {
      if (processedCount < chunks.length) {
        const chunk = chunks[processedCount];
        allProdutosRef.current = [...allProdutosRef.current, ...chunk];
        processedCount++;
        
        // Usar requestAnimationFrame para não bloquear a UI
        requestAnimationFrame(processNextChunk);
      } else {
        // Fim do processamento
        filterByAlmoxarifado(selectedAlmox);
        setLoading(false);
      }
    };
    
    processNextChunk();
  };

  // Filtrar por almoxarifado (otimizado)
  const filterByAlmoxarifado = useCallback((almox: string) => {
    const filtered = allProdutosRef.current.filter(p => p.almox === almox);
    setFilteredProdutos(filtered);
  }, []);

  // Filtrar por termo de busca (com debounce)
  const filterBySearchTerm = useCallback((term: string) => {
    if (!term) {
      filterByAlmoxarifado(selectedAlmox);
      return;
    }
    
    const termLower = term.toLowerCase();
    const filtered = allProdutosRef.current.filter(
      p => p.almox === selectedAlmox && (
        p.cod.toLowerCase().includes(termLower) ||
        p.nome.toLowerCase().includes(termLower)
      )
    );
    
    setFilteredProdutos(filtered);
  }, [selectedAlmox]);

  // Handle mudança de almoxarifado
  const handleAlmoxChange = useCallback((value: string) => {
    setSelectedAlmox(value);
    
    // Usar setTimeout para não bloquear a animação do picker
    setTimeout(() => {
      filterByAlmoxarifado(value);
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, 10);
  }, [filterByAlmoxarifado]);

  // Handle busca com debounce
  const handleSearchChange = useCallback((text: string) => {
    setSearchTerm(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      filterBySearchTerm(text);
    }, 300);
  }, [filterBySearchTerm]);

  // Memoizar a lista de produtos para evitar recálculos
  const memoizedProdutos = useMemo(() => filteredProdutos, [filteredProdutos]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setCodigo('');
    setNome('');
    setUnidade('UNIDADE');
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!codigo.trim()) {
      newErrors.codigo = 'Código é obrigatório';
    }
    if (!nome.trim()) {
      newErrors.nome = 'Descrição é obrigatória';
    }
    
    const exists = allProdutosRef.current.some(
      p => p.cod === codigo && p.almox === selectedAlmox && p.cod !== editingId
    );
    
    if (exists) {
      newErrors.codigo = 'Código já cadastrado neste almoxarifado';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      if (efeitosSonoros) {
        await playErrorSound();
      }
      return;
    }

    setIsProcessing(true);
    
    // Usar InteractionManager para processar após animações
    InteractionManager.runAfterInteractions(async () => {
      const novoProduto: Produto = {
        almox: selectedAlmox,
        cod: codigo.toUpperCase(),
        nome: nome.toUpperCase(),
        unid: unidade,
      };

      if (editingId) {
        // Modo edição
        const index = allProdutosRef.current.findIndex(
          p => p.cod === editingId && p.almox === selectedAlmox
        );
        if (index !== -1) {
          allProdutosRef.current[index] = novoProduto;
          
          // Atualizar também no array original produtos (se necessário)
          const originalIndex = produtos.findIndex(
            p => p.cod === editingId && p.almox === selectedAlmox
          );
          if (originalIndex !== -1) {
            produtos[originalIndex] = novoProduto;
          }
        }
      } else {
        // Modo novo
        allProdutosRef.current.push(novoProduto);
        produtos.push(novoProduto);
      }
      
      // Recarregar lista
      filterByAlmoxarifado(selectedAlmox);
      
      if (efeitosSonoros) {
        await playSuccessSound();
      }
      
      if (avisosVisuais) {
        Alert.alert('Sucesso', editingId ? 'Produto atualizado!' : 'Produto cadastrado!');
      }
      
      resetForm();
      setIsProcessing(false);
      
      // Scroll para o topo
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  };

  const handleEdit = useCallback((produto: Produto) => {
    setEditingId(produto.cod);
    setCodigo(produto.cod);
    setNome(produto.nome);
    setUnidade(produto.unid);
    setShowForm(true);
    
    // Pequeno delay para garantir que o formulário renderizou
    setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);
  }, []);

  const handleDelete = useCallback((produto: Produto) => {
    Alert.alert(
      'Confirmar exclusão',
      `Remover "${produto.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            // Remover da referência
            const index = allProdutosRef.current.findIndex(
              p => p.cod === produto.cod && p.almox === produto.almox
            );
            if (index !== -1) {
              allProdutosRef.current.splice(index, 1);
              
              // Remover do array original produtos
              const originalIndex = produtos.findIndex(
                p => p.cod === produto.cod && p.almox === produto.almox
              );
              if (originalIndex !== -1) {
                produtos.splice(originalIndex, 1);
              }
              
              filterByAlmoxarifado(selectedAlmox);
              
              if (efeitosSonoros) {
                await playSuccessSound();
              }
              
              if (avisosVisuais) {
                Alert.alert('Sucesso', 'Produto removido!');
              }
            }
          },
        },
      ]
    );
  }, [selectedAlmox, filterByAlmoxarifado, efeitosSonoros, avisosVisuais]);

  const renderHeader = () => (
    <>
      {/* Filtros */}
      <Card>
        <Text style={styles.label}>Almoxarifado</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedAlmox}
            onValueChange={handleAlmoxChange}
            style={styles.picker}
          >
            {ALMOXARIFADOS.map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <InputField
              placeholder="Pesquisar por código ou descrição..."
              value={searchTerm}
              onChangeText={handleSearchChange}
            />
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
            disabled={isProcessing}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Formulário de Cadastro */}
      {showForm && (
        <Card variant="cadastro">
          <Text style={styles.formTitle}>
            {editingId ? 'Editar Produto' : 'Novo Produto'}
          </Text>

          <InputField
            label="Código Spalm"
            value={codigo}
            onChangeText={setCodigo}
            placeholder="00.00.00.0000-0"
            error={errors.codigo}
            required
            autoCapitalize="characters"
          />

          <InputField
            label="Descrição"
            value={nome}
            onChangeText={setNome}
            placeholder="Nome do produto"
            error={errors.nome}
            required
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Unidade de Medida</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={unidade}
              onValueChange={(value) => setUnidade(value as UnidadeMedida)}
              style={styles.picker}
            >
              {UNIDADES_MEDIDA.map((unid) => (
                <Picker.Item key={unid} label={unid} value={unid} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Almoxarifado</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedAlmox}
              onValueChange={handleAlmoxChange}
              style={styles.picker}
            >
              {ALMOXARIFADOS.map((item) => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))}
            </Picker>
          </View>

          <View style={styles.formActions}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={resetForm}
              style={styles.formButton}
              disabled={isProcessing}
            />
            <Button
              title="Salvar"
              variant="primary"
              onPress={handleSubmit}
              style={styles.formButton}
              loading={isProcessing}
            />
          </View>
        </Card>
      )}

      {/* Header da Lista */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          Produtos ({filteredProdutos.length})
        </Text>
      </View>
    </>
  );

  const renderEmptyComponent = () => (
    <Card>
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={60} color={colors.lightGray} />
        <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
        <Text style={styles.emptyText}>
          {searchTerm
            ? 'Tente outro termo de busca'
            : 'Clique no botão + para adicionar produtos'}
        </Text>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando produtos...</Text>
        <Text style={styles.loadingSubtext}>Isso pode levar alguns segundos</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Gerenciar Itens' }} />
      <View style={styles.container}>
        <FlashList
          ref={listRef}
          data={memoizedProdutos}
          keyExtractor={(item) => `${item.almox}-${item.cod}`}
          renderItem={({ item }) => (
            <ProdutoItem
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          estimatedItemSize={100}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          drawDistance={500}
          overrideItemLayout={(layout, item, index) => {
            layout.size = 100; // Altura estimada de cada item
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  loadingText: {
    marginTop: 12,
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    color: colors.gray,
    fontSize: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: colors.accent,
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  formButton: {
    flex: 1,
    maxWidth: 120,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: colors.lightGray,
    textAlign: 'center',
    marginTop: 4,
  },
});