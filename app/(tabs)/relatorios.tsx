// app/(tabs)/relatorios.tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Componentes
import Button from '../../components/Button';
import Card from '../../components/Card';

// Contexts
import { usePreferencias } from '../../contexts/PreferenciasContext';
import { useRelatorio } from '../../contexts/RelatorioContext';

// Hooks
import { useSound } from '../../hooks/useSound';

// Firebase
import { auth } from '../../config/firebase';

// Utils
import { colors } from '../../styles/colors';

export default function RelatoriosScreen() {
  const router = useRouter();
  const {
    relatorios,
    criarRelatorio,
    arquivarRelatorio,
    excluirRelatorio,
    duplicarRelatorio,
    podeEditar,
  } = useRelatorio();

  // Preferências
  const { efeitosSonoros, avisosVisuais } = usePreferencias();
  const { playSuccessSound, playErrorSound } = useSound();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAlmox, setSelectedAlmox] = useState('Almoxarifado Central');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'em_andamento' | 'arquivado'>('todos');

  const user = auth.currentUser;

  // Função para gerar o título automaticamente
  const gerarTituloRelatorio = (almoxarifado: string) => {
    const dataAtual = new Date();
    const dia = dataAtual.getDate().toString().padStart(2, '0');
    const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataAtual.getFullYear().toString().slice(-2);
    
    // Extrair apenas o tipo do almoxarifado
    let tipo = almoxarifado.replace('Almoxarifado de ', '').replace('Almoxarifado ', '');
    
    return `Inventário ${tipo} ${dia}/${mes}/${ano}`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCriarRelatorio = async () => {
    const nomeInventariante = user?.displayName || user?.email?.split('@')[0] || 'Usuário';
    const titulo = gerarTituloRelatorio(selectedAlmox);

    try {
      const id = await criarRelatorio(titulo, selectedAlmox, nomeInventariante);
      
      if (efeitosSonoros) {
        await playSuccessSound();
      }
      
      if (avisosVisuais) {
        Alert.alert('Sucesso', 'Inventário criado com sucesso!');
      }
      
      setModalVisible(false);
      
      setTimeout(() => {
        router.push(`/relatorio/${id}`);
      }, 500);
      
    } catch (error) {
      if (efeitosSonoros) {
        await playErrorSound();
      }
      if (avisosVisuais) {
        Alert.alert('Erro', 'Não foi possível criar o inventário');
      }
    }
  };

  const handleArquivarRelatorio = async (id: string) => {
    try {
      await arquivarRelatorio(id);
      if (efeitosSonoros) {
        await playSuccessSound();
      }
      if (avisosVisuais) {
        Alert.alert('Sucesso', 'Relatório arquivado!');
      }
    } catch (error) {
      if (efeitosSonoros) {
        await playErrorSound();
      }
      if (avisosVisuais) {
        Alert.alert('Erro', 'Não foi possível arquivar');
      }
    }
  };

  const handleDuplicarRelatorio = async (id: string, novoTitulo: string) => {
    try {
      await duplicarRelatorio(id, novoTitulo);
      if (efeitosSonoros) {
        await playSuccessSound();
      }
      if (avisosVisuais) {
        Alert.alert('Sucesso', 'Relatório duplicado!');
      }
    } catch (error) {
      if (efeitosSonoros) {
        await playErrorSound();
      }
      if (avisosVisuais) {
        Alert.alert('Erro', 'Não foi possível duplicar');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_andamento': return colors.accent;
      case 'arquivado': return colors.gray;
      default: return colors.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'em_andamento': return 'Em andamento';
      case 'arquivado': return 'Arquivado';
      default: return status;
    }
  };

  const relatoriosFiltrados = relatorios.filter(r => {
    if (filtroStatus === 'todos') return true;
    return r.status === filtroStatus;
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Inventários' }} />
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Botão Novo Inventário */}
        <Card>
          <TouchableOpacity
            style={styles.novoButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle" size={24} color={colors.white} />
            <Text style={styles.novoButtonText}>NOVO INVENTÁRIO</Text>
          </TouchableOpacity>
        </Card>

        {/* Filtros */}
        <Card>
          <Text style={styles.label}>Status</Text>
          <View style={styles.filtrosRow}>
            <TouchableOpacity
              style={[styles.filtroButton, filtroStatus === 'todos' && styles.filtroAtivo]}
              onPress={() => setFiltroStatus('todos')}
            >
              <Text style={filtroStatus === 'todos' ? styles.filtroTextoAtivo : styles.filtroTexto}>
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filtroButton, filtroStatus === 'em_andamento' && styles.filtroAtivo]}
              onPress={() => setFiltroStatus('em_andamento')}
            >
              <Text style={filtroStatus === 'em_andamento' ? styles.filtroTextoAtivo : styles.filtroTexto}>
                Em andamento
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filtroButton, filtroStatus === 'arquivado' && styles.filtroAtivo]}
              onPress={() => setFiltroStatus('arquivado')}
            >
              <Text style={filtroStatus === 'arquivado' ? styles.filtroTextoAtivo : styles.filtroTexto}>
                Arquivados
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Lista de Relatórios */}
        {relatoriosFiltrados.length === 0 ? (
          <Card>
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={80} color={colors.lightGray} />
              <Text style={styles.emptyTitle}>Nenhum inventário encontrado</Text>
              <Text style={styles.emptyText}>
                Clique em "NOVO INVENTÁRIO" para começar
              </Text>
            </View>
          </Card>
        ) : (
          relatoriosFiltrados.map((relatorio) => {
            const usuarioPodeEditar = podeEditar(relatorio.id);
            
            return (
              <Card key={relatorio.id} variant={relatorio.status === 'em_andamento' ? 'cadastro' : 'default'}>
                <TouchableOpacity
                  onPress={() => router.push(`/relatorio/${relatorio.id}`)}
                  style={styles.relatorioItem}
                >
                  <View style={styles.relatorioHeader}>
                    <Text style={styles.relatorioTitulo}>{relatorio.titulo}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(relatorio.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(relatorio.status)}</Text>
                    </View>
                  </View>

                  <Text style={styles.relatorioSubtitulo}>
                    {relatorio.almoxarifado} • {relatorio.inventariante}
                  </Text>

                  {/* Mostrar quem criou */}
                  <Text style={styles.relatorioCriadoPor}>
                    Criado por: {relatorio.userDisplayName || relatorio.inventariante}
                    {relatorio.userId === user?.uid && ' (você)'}
                  </Text>

                  <View style={styles.relatorioInfo}>
                    <Text style={styles.relatorioData}>
                      {relatorio.dataCriacao}
                    </Text>
                    <Text style={styles.relatorioItens}>
                      {relatorio.totalItens} itens
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Ações - só aparecem para o proprietário e NÃO para relatórios em andamento */}
                {usuarioPodeEditar && relatorio.status !== 'em_andamento' && (
                  <View style={styles.relatorioAcoes}>
                    <TouchableOpacity
                      style={styles.acaoButton}
                      onPress={() => router.push(`/relatorio/${relatorio.id}`)}
                    >
                      <Ionicons name="eye-outline" size={20} color={colors.primary} />
                      <Text style={styles.acaoTexto}>Ver</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.acaoButton}
                      onPress={() => {
                        Alert.alert(
                          'Duplicar Inventário',
                          'Digite o título do novo inventário',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                              text: 'Criar',
                              onPress: async (novoTitulo) => {
                                if (novoTitulo) {
                                  await handleDuplicarRelatorio(relatorio.id, novoTitulo);
                                }
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Ionicons name="copy-outline" size={20} color={colors.primary} />
                      <Text style={styles.acaoTexto}>Duplicar</Text>
                    </TouchableOpacity>

                    {/* Botão Arquivar removido - só aparece na tela de detalhe */}

                    <TouchableOpacity
                      style={[styles.acaoButton, styles.acaoExcluir]}
                      onPress={() => excluirRelatorio(relatorio.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                      <Text style={[styles.acaoTexto, { color: colors.danger }]}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            );
          })
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Modal Novo Inventário */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Inventário</Text>

            <Text style={styles.modalLabel}>Almoxarifado</Text>
            <View style={styles.modalPicker}>
              {[
                'Almoxarifado Central', 
                'Almoxarifado de Alimentícios', 
                'Almoxarifado do Serviço Médico', 
                'Almoxarifado de Informática', 
                'Almoxarifado de Produtos Gráficos',
                'Almoxarifado SAPF Papéis'
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.modalOption,
                    selectedAlmox === item && styles.modalOptionSelected,
                  ]}
                  onPress={() => setSelectedAlmox(item)}
                >
                  <Text style={selectedAlmox === item ? styles.modalOptionTextSelected : styles.modalOptionText}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBotoes}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => {
                  setModalVisible(false);
                }}
                style={styles.modalBotao}
              />
              <Button
                title="Criar"
                onPress={handleCriarRelatorio}
                style={styles.modalBotao}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 12,
  },
  novoButton: {
    backgroundColor: colors.accent,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  novoButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filtrosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filtroButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  filtroAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filtroTexto: {
    color: colors.gray,
    fontSize: 12,
  },
  filtroTextoAtivo: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  relatorioItem: {
    padding: 12,
  },
  relatorioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  relatorioTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  relatorioSubtitulo: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 2,
  },
  relatorioCriadoPor: {
    fontSize: 10,
    color: colors.gray,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  relatorioInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  relatorioData: {
    fontSize: 11,
    color: colors.gray,
  },
  relatorioItens: {
    fontSize: 11,
    color: colors.gray,
  },
  relatorioAcoes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 8,
    marginTop: 8,
  },
  acaoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  acaoTexto: {
    fontSize: 12,
    color: colors.primary,
  },
  acaoExcluir: {},
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.lightGray,
    textAlign: 'center',
    marginTop: 8,
  },
  bottomSpace: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 6,
  },
  modalPicker: {
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 8,
    marginBottom: 6,
  },
  modalOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalOptionText: {
    color: colors.text,
  },
  modalOptionTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  modalBotoes: {
    flexDirection: 'row',
    gap: 8,
  },
  modalBotao: {
    flex: 1,
  },
});