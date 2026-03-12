// app/relatorio/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

// Data e Utils
import { getProdutosByAlmox } from '../../data/produtos';
import { gerarExcel } from '../../services/excelService';
import { gerarPDF } from '../../services/pdfService';
import { colors } from '../../styles/colors';
import { calcularContagem } from '../../utils/calculos';

export default function RelatorioDetalheScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    relatorios,
    loading: contextLoading,
    arquivarRelatorio,
    excluirRelatorio,
    addItem,
    updateItem,
    removeItem,
  } = useRelatorio();

  const { avisosVisuais } = usePreferencias();
  const { playSuccessSound, playErrorSound } = useSound();
  const [modalExportVisible, setModalExportVisible] = useState(false);

  const [showResumo, setShowResumo] = useState(true);
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');

  // Estados para os itens do almoxarifado
  const [itensAlmoxarifado, setItensAlmoxarifado] = useState([]);
  const [carregandoItens, setCarregandoItens] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState('todos');

  // Modal de contagem
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'novo' | 'editar'>('novo');
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Campos do formulário
  const [qtdPaletes, setQtdPaletes] = useState('0');
  const [cxPorPalete, setCxPorPalete] = useState('0');
  const [cxAvulsas, setCxAvulsas] = useState('0');
  const [unidPorCx, setUnidPorCx] = useState('1');
  const [unidAvulsas, setUnidAvulsas] = useState('0');
  const [avulsosExp, setAvulsosExp] = useState('0');
  const [saldoSpalm, setSaldoSpalm] = useState('0');
  const [totalGeral, setTotalGeral] = useState(0);

  // Qualidade
  const [embStatus, setEmbStatus] = useState('OK');
  const [obsEmb, setObsEmb] = useState('');
  const [showObsEmb, setShowObsEmb] = useState(false);
  const [valStatus, setValStatus] = useState('OK');
  const [obsVal, setObsVal] = useState('');
  const [showObsVal, setShowObsVal] = useState(false);

  // Efeito para encontrar o relatório na lista
  useEffect(() => {
    const encontrado = relatorios.find(r => r.id === id);

    if (encontrado) {
      setRelatorio(encontrado);
      setNovoTitulo(encontrado.titulo);
      setLoading(false);

      // Carregar itens do almoxarifado de forma ASSÍNCRONA
      carregarItensAlmoxarifadoAsync(encontrado.almoxarifado);
    } else if (!contextLoading) {
      const timer = setTimeout(() => {
        const tentarNovamente = relatorios.find(r => r.id === id);
        if (tentarNovamente) {
          setRelatorio(tentarNovamente);
          setNovoTitulo(tentarNovamente.titulo);
          setLoading(false);
          carregarItensAlmoxarifadoAsync(tentarNovamente.almoxarifado);
        } else {
          setLoading(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [id, relatorios, contextLoading]);

  // Função para carregar itens de forma assíncrona
  const carregarItensAlmoxarifadoAsync = useCallback(async (almoxarifado) => {
    setCarregandoItens(true);

    // Usar setTimeout para não bloquear a thread principal
    setTimeout(() => {
      const startTime = Date.now();
      const produtos = getProdutosByAlmox(almoxarifado);
      const endTime = Date.now();

      console.log(`📦 ${produtos.length} itens carregados em ${endTime - startTime}ms`);

      setItensAlmoxarifado(produtos);
      setCarregandoItens(false);
    }, 0);
  }, []);

  // Calcular total
  useEffect(() => {
    calcular();
  }, [qtdPaletes, cxPorPalete, cxAvulsas, unidPorCx, unidAvulsas, avulsosExp]);

  const calcular = useCallback(() => {
    const params = {
      qtdPaletes: parseFloat(qtdPaletes) || 0,
      cxPorPalete: parseFloat(cxPorPalete) || 0,
      cxAvulsas: parseFloat(cxAvulsas) || 0,
      unidPorCx: parseFloat(unidPorCx) || 1,
      unidAvulsas: parseFloat(unidAvulsas) || 0,
      avulsosExp: parseFloat(avulsosExp) || 0,
      saldoSpalm: parseFloat(saldoSpalm) || 0,
    };

    const resultado = calcularContagem(params);
    setTotalGeral(resultado.totalGeral);
  }, [qtdPaletes, cxPorPalete, cxAvulsas, unidPorCx, unidAvulsas, avulsosExp]);

  const handleVoltar = useCallback(() => {
    router.back();
  }, []);

  const handleEditarTitulo = useCallback(() => {
    setEditandoTitulo(true);
  }, []);

  const handleSalvarTitulo = useCallback(async () => {
    if (!novoTitulo.trim()) {
      Alert.alert('Erro', 'O título não pode estar vazio');
      return;
    }

    try {
      // Aqui você precisa implementar a função de atualizar título no contexto
      // await atualizarTituloRelatorio(relatorio.id, novoTitulo);

      setEditandoTitulo(false);
      if (playSuccessSound) await playSuccessSound();
      if (avisosVisuais) Alert.alert('Sucesso', 'Título atualizado!');
    } catch (error) {
      if (playErrorSound) await playErrorSound();
      Alert.alert('Erro', 'Não foi possível atualizar o título');
    }
  }, [novoTitulo, relatorio, playSuccessSound, playErrorSound, avisosVisuais]);

  const handleCancelarEdicao = useCallback(() => {
    setEditandoTitulo(false);
    setNovoTitulo(relatorio.titulo);
  }, [relatorio]);

  const handleExportarExcel = useCallback(async () => {
    setModalExportVisible(false);

    Alert.alert(
      'Exportar Excel',
      'Deseja gerar o relatório em Excel?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Gerar Excel',
          onPress: async () => {
            try {
              setCarregandoItens(true);
              const success = await gerarExcel({
                titulo: relatorio.titulo,
                almoxarifado: relatorio.almoxarifado,
                inventariante: relatorio.inventariante,
                dataCriacao: relatorio.dataCriacao,
                itens: relatorio.itens
              });

              if (success && playSuccessSound) await playSuccessSound();
            } catch (error) {
              console.error('Erro ao exportar Excel:', error);
              if (playErrorSound) await playErrorSound();
              Alert.alert('Erro', 'Não foi possível gerar o Excel');
            } finally {
              setCarregandoItens(false);
            }
          },
        },
      ]
    );
  }, [relatorio, playSuccessSound, playErrorSound]);

  const handleExportarPDF = useCallback(async () => {
    setModalExportVisible(false);

    Alert.alert(
      'Exportar PDF',
      'Deseja gerar o relatório em PDF?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Gerar PDF',
          onPress: async () => {
            try {
              setCarregandoItens(true);
              const success = await gerarPDF({
                titulo: relatorio.titulo,
                almoxarifado: relatorio.almoxarifado,
                inventariante: relatorio.inventariante,
                dataCriacao: relatorio.dataCriacao,
                itens: relatorio.itens
              });

              if (success && playSuccessSound) await playSuccessSound();
            } catch (error) {
              console.error('Erro ao exportar PDF:', error);
              if (playErrorSound) await playErrorSound();
              Alert.alert('Erro', 'Não foi possível gerar o PDF');
            } finally {
              setCarregandoItens(false);
            }
          },
        },
      ]
    );
  }, [relatorio, playSuccessSound, playErrorSound]);

  const handleArquivar = useCallback(() => {
    Alert.alert(
      'Arquivar Relatório',
      'Deseja arquivar este relatório?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Arquivar',
          onPress: async () => {
            await arquivarRelatorio(relatorio.id);
            if (playSuccessSound) await playSuccessSound();
            if (avisosVisuais) Alert.alert('Sucesso', 'Relatório arquivado!');
            router.back();
          },
        },
      ]
    );
  }, [relatorio, arquivarRelatorio, router, playSuccessSound, avisosVisuais]);

  const handleExcluir = useCallback(() => {
    Alert.alert(
      'Excluir Relatório',
      'Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await excluirRelatorio(relatorio.id);
            if (playSuccessSound) await playSuccessSound();
            if (avisosVisuais) Alert.alert('Sucesso', 'Relatório excluído!');
            router.back();
          },
        },
      ]
    );
  }, [relatorio, excluirRelatorio, router, playSuccessSound, avisosVisuais]);

  const handleNovoItem = useCallback((produto) => {
    setSelectedProduto(produto);
    setModalMode('novo');
    setSelectedItemId(null);

    const itemExistente = relatorio?.itens.find(i => i.codigo === produto.cod);
    if (itemExistente) {
      setQtdPaletes(itemExistente.fisico.paletes.toString());
      setCxPorPalete('0');
      setCxAvulsas(itemExistente.fisico.caixas.toString());
      setUnidPorCx('1');
      setUnidAvulsas(itemExistente.fisico.unidades.toString());
      setAvulsosExp('0');
      setSaldoSpalm(itemExistente.spalm.toString());
      setEmbStatus(itemExistente.qualidade.embalagem === 'ok' ? 'OK' : 'AVARIA');
      setObsEmb(itemExistente.qualidade.observacao || '');
      setShowObsEmb(itemExistente.qualidade.embalagem !== 'ok');
      setValStatus(itemExistente.qualidade.validade);
      setObsVal(itemExistente.qualidade.observacao || '');
      setShowObsVal(itemExistente.qualidade.validade !== 'OK');
    } else {
      limparCampos();
    }

    setModalVisible(true);
  }, [relatorio]);

  const handleEditarItem = useCallback((item) => {
    const produto = itensAlmoxarifado.find(p => p.cod === item.codigo);
    setSelectedProduto(produto);
    setModalMode('editar');
    setSelectedItemId(item.id);

    setQtdPaletes(item.fisico.paletes.toString());
    setCxPorPalete('0');
    setCxAvulsas(item.fisico.caixas.toString());
    setUnidPorCx('1');
    setUnidAvulsas(item.fisico.unidades.toString());
    setAvulsosExp('0');
    setSaldoSpalm(item.spalm.toString());
    setEmbStatus(item.qualidade.embalagem === 'ok' ? 'OK' : 'AVARIA');
    setObsEmb(item.qualidade.observacao || '');
    setShowObsEmb(item.qualidade.embalagem !== 'ok');
    setValStatus(item.qualidade.validade);
    setObsVal(item.qualidade.observacao || '');
    setShowObsVal(item.qualidade.validade !== 'OK');

    setModalVisible(true);
  }, [itensAlmoxarifado]);

  const handleRemoverItem = useCallback((produto, itemContado) => {
    if (itemContado) {
      // Se já foi contado, remove do relatório (Firestore)
      Alert.alert(
        'Remover Item',
        `Deseja remover "${produto.nome}" do relatório?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: async () => {
              await removeItem(relatorio.id, itemContado.id);
              if (playSuccessSound) await playSuccessSound();
            },
          },
        ]
      );
    } else {
      // Se NÃO foi contado, remove da lista LOCAL (só desta visualização)
      Alert.alert(
        'Remover Item da Lista',
        `Deseja remover "${produto.nome}" da lista de itens? (Isto só afeta sua visualização atual)`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: async () => {
              // Remove da lista local
              setItensAlmoxarifado(prev => prev.filter(p => p.cod !== produto.cod));
              if (playSuccessSound) await playSuccessSound();
            },
          },
        ]
      );
    }
  }, [relatorio, removeItem, playSuccessSound]);

  const limparCampos = useCallback(() => {
    setQtdPaletes('0');
    setCxPorPalete('0');
    setCxAvulsas('0');
    setUnidPorCx('1');
    setUnidAvulsas('0');
    setAvulsosExp('0');
    setSaldoSpalm('0');
    setEmbStatus('OK');
    setShowObsEmb(false);
    setObsEmb('');
    setValStatus('OK');
    setShowObsVal(false);
    setObsVal('');
  }, []);

  const salvarItem = async () => {
    if (!selectedProduto) return;

    const observacoes = [];
    if (showObsEmb && obsEmb) observacoes.push(`Embalagem: ${obsEmb}`);
    if (showObsVal && obsVal) observacoes.push(`Validade: ${obsVal}`);

    const itemData = {
      codigo: selectedProduto.cod,
      nome: selectedProduto.nome,
      unidade: selectedProduto.unid,
      fisico: {
        paletes: parseFloat(qtdPaletes) || 0,
        caixas: (parseFloat(cxPorPalete) || 0) + (parseFloat(cxAvulsas) || 0),
        unidades: parseFloat(unidAvulsas) || 0,
      },
      spalm: parseFloat(saldoSpalm) || 0,
      qualidade: {
        embalagem: embStatus === 'OK' ? 'ok' : 'danificada',
        validade: valStatus,
        observacao: observacoes.join(' | '),
      },
      observacaoGeral: observacoes.join(' | '),
      dataRegistro: new Date().toISOString(),
      userId: relatorio.userId,
    };

    try {
      if (modalMode === 'novo') {
        await addItem(relatorio.id, itemData);
      } else {
        await updateItem(relatorio.id, selectedItemId, itemData);
      }

      if (playSuccessSound) await playSuccessSound();

      setModalVisible(false);
      limparCampos();
    } catch (error) {
      if (playErrorSound) await playErrorSound();
      Alert.alert('Erro', 'Não foi possível salvar o item');
    }
  };

  const categorias = useMemo(() => [
    { label: 'Todos', value: 'todos' },
    { label: 'Contados', value: 'contados' },
    { label: 'Não Contados', value: 'nao_contados' },
  ], []);

  const itensFiltrados = useMemo(() => {
    if (!itensAlmoxarifado.length || !relatorio) return [];

    return itensAlmoxarifado.filter(produto => {
      const itemContado = relatorio.itens.some(i => i.codigo === produto.cod);

      if (selectedCategoria === 'contados') return itemContado;
      if (selectedCategoria === 'nao_contados') return !itemContado;
      return true;
    });
  }, [itensAlmoxarifado, relatorio, selectedCategoria]);

  // Loading state
  if (loading || contextLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!relatorio) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={styles.errorText}>Relatório não encontrado</Text>
        <Button
          title="Voltar"
          variant="primary"
          onPress={handleVoltar}
          style={styles.errorButton}
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerLeft: () => (
            <TouchableOpacity onPress={handleVoltar} style={{ marginLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        {/* Card de informações com ícones verticais */}
        <Card>
          <View style={styles.cardContent}>
            <View style={styles.infoContainer}>
              {editandoTitulo ? (
                <View style={styles.editTituloContainer}>
                  <TextInput
                    style={styles.editTituloInput}
                    value={novoTitulo}
                    onChangeText={setNovoTitulo}
                    placeholder="Título do relatório"
                  />
                  <View style={styles.editTituloButtons}>
                    <TouchableOpacity onPress={handleSalvarTitulo} style={styles.editTituloButton}>
                      <Ionicons name="checkmark" size={20} color={colors.success} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCancelarEdicao} style={styles.editTituloButton}>
                      <Ionicons name="close" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Text style={styles.titulo}>{relatorio.titulo}</Text>
              )}

              <Text style={styles.subtitulo}>
                {relatorio.almoxarifado} • {relatorio.inventariante}
              </Text>
              <Text style={styles.statusText}>
                Status:{' '}
                <Text style={{ color: relatorio.status === 'em_andamento' ? colors.accent : colors.gray }}>
                  {relatorio.status === 'em_andamento' ? 'Em andamento' : 'Arquivado'}
                </Text>
              </Text>
              <Text style={styles.data}>
                Criado em: {relatorio.dataCriacao}
              </Text>
            </View>

            {/* Ícones verticais à direita */}
            <View style={styles.verticalIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleEditarTitulo}
              >
                <Ionicons name="create-outline" size={22} color={colors.primary} />
              </TouchableOpacity>

              {/* BOTÃO DE DOWNLOAD (abre modal) */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setModalExportVisible(true)}
              >
                <Ionicons name="download-outline" size={22} color={colors.primary} />
              </TouchableOpacity>

              {relatorio.status === 'em_andamento' && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleArquivar}
                >
                  <Ionicons name="archive-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.iconButton, styles.excluirIcon]}
                onPress={handleExcluir}
              >
                <Ionicons name="trash-outline" size={22} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Resumo */}
        {showResumo && (
          <Card variant="relatorio">
            <View style={styles.resumoHeader}>
              <Text style={styles.resumoTitle}>RESUMO</Text>
              <TouchableOpacity onPress={() => setShowResumo(false)}>
                <Ionicons name="chevron-up" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.resumoGrid}>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoValor}>{relatorio.totalItens || 0}</Text>
                <Text style={styles.resumoLabel}>Contados</Text>
              </View>
              <View style={[styles.resumoItem, { backgroundColor: colors.success + '20' }]}>
                <Text style={styles.resumoValor}>{relatorio.resumo?.ok || 0}</Text>
                <Text style={styles.resumoLabel}>OK</Text>
              </View>
              <View style={[styles.resumoItem, { backgroundColor: colors.warning + '20' }]}>
                <Text style={styles.resumoValor}>{relatorio.resumo?.sobra || 0}</Text>
                <Text style={styles.resumoLabel}>Sobra</Text>
              </View>
              <View style={[styles.resumoItem, { backgroundColor: colors.danger + '20' }]}>
                <Text style={styles.resumoValor}>{relatorio.resumo?.falta || 0}</Text>
                <Text style={styles.resumoLabel}>Falta</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: itensAlmoxarifado.length > 0
                        ? `${(relatorio.totalItens / itensAlmoxarifado.length) * 100}%`
                        : '0%',
                      backgroundColor: colors.success
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {carregandoItens ? 'Carregando itens...' : `${relatorio.totalItens} de ${itensAlmoxarifado.length} itens contados`}
              </Text>
            </View>
          </Card>
        )}

        {!showResumo && (
          <TouchableOpacity
            style={styles.showResumoButton}
            onPress={() => setShowResumo(true)}
          >
            <Ionicons name="chevron-down" size={20} color={colors.primary} />
            <Text style={styles.showResumoText}>Mostrar resumo</Text>
          </TouchableOpacity>
        )}

        {/* Filtros - só aparecem se houver itens */}
        {itensAlmoxarifado.length > 0 && (
          <Card>
            <Text style={styles.label}>Filtrar por</Text>
            <View style={styles.filtrosRow}>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.filtroButton,
                    selectedCategoria === cat.value && styles.filtroAtivo
                  ]}
                  onPress={() => setSelectedCategoria(cat.value)}
                >
                  <Text style={selectedCategoria === cat.value ? styles.filtroTextoAtivo : styles.filtroTexto}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Lista de Itens do Almoxarifado */}
        <Text style={styles.listaTitle}>ITENS DO ALMOXARIFADO</Text>

        {carregandoItens ? (
          <Card>
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingMoreText}>Carregando itens...</Text>
            </View>
          </Card>
        ) : (
          itensFiltrados.map((produto) => {
            const itemContado = relatorio.itens.find(i => i.codigo === produto.cod);
            const contado = !!itemContado;

            return (
              <View key={produto.cod} style={[
                styles.itemCard,
                contado && styles.itemCardContado
              ]}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemCodigo}>{produto.cod}</Text>
                    {contado && (
                      <View style={styles.itemContadoBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        <Text style={styles.itemContadoText}>Contado</Text>
                      </View>
                    )}
                  </View>

                  {/* BOTÕES DE AÇÃO - APARECEM EM TODOS OS ITENS */}
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      onPress={() => handleEditarItem(itemContado)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="create-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoverItem(produto, itemContado)}  // <-- CORRIGIDO
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.itemNome}>{produto.nome}</Text>
                <Text style={styles.itemUnidade}>Unidade: {produto.unid}</Text>

                {contado && (
                  <View style={styles.itemDetalhes}>
                    <View style={styles.itemDetalhe}>
                      <Text style={styles.detalheLabel}>Físico:</Text>
                      <Text style={styles.detalheValor}>
                        {itemContado.fisico.paletes > 0 && `${itemContado.fisico.paletes} pal `}
                        {itemContado.fisico.caixas > 0 && `${itemContado.fisico.caixas} cx `}
                        {itemContado.fisico.unidades > 0 && `${itemContado.fisico.unidades} un`}
                      </Text>
                    </View>
                    <View style={styles.itemDetalhe}>
                      <Text style={styles.detalheLabel}>Spalm:</Text>
                      <Text style={styles.detalheValor}>{itemContado.spalm}</Text>
                    </View>
                    <View style={styles.itemDetalhe}>
                      <Text style={styles.detalheLabel}>Dif:</Text>
                      <Text style={[
                        styles.detalheValor,
                        {
                          color: (itemContado.spalm - (itemContado.fisico.paletes * 100 +
                            itemContado.fisico.caixas * 10 + itemContado.fisico.unidades)) > 0
                            ? colors.success : colors.danger
                        }
                      ]}>
                        {itemContado.spalm - (itemContado.fisico.paletes * 100 +
                          itemContado.fisico.caixas * 10 + itemContado.fisico.unidades)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Modal de Exportação */}
      <Modal visible={modalExportVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalExportContent}>
            <Text style={styles.modalExportTitle}>Exportar Relatório</Text>

            <TouchableOpacity
              style={styles.modalExportOption}
              onPress={handleExportarPDF}
            >
              <Ionicons name="document-text-outline" size={28} color={colors.danger} />
              <View style={styles.modalExportOptionText}>
                <Text style={styles.modalExportOptionTitle}>PDF</Text>
                <Text style={styles.modalExportOptionDesc}>Gerar relatório em formato PDF</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalExportOption}
              onPress={handleExportarExcel}
            >
              <Ionicons name="grid-outline" size={28} color={colors.success} />
              <View style={styles.modalExportOptionText}>
                <Text style={styles.modalExportOptionTitle}>Excel</Text>
                <Text style={styles.modalExportOptionDesc}>Gerar relatório em formato Excel (XLSX)</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalExportCancel}
              onPress={() => setModalExportVisible(false)}
            >
              <Text style={styles.modalExportCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Contagem */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'novo' ? 'Nova Contagem' : 'Editar Contagem'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalProduto}>
                {selectedProduto?.cod} - {selectedProduto?.nome}
              </Text>

              <Text style={styles.modalSection}>Contagem Física</Text>

              <View style={styles.modalGrid}>
                <View style={styles.modalGridItem}>
                  <Text style={styles.modalLabel}>Paletes</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={qtdPaletes}
                    onChangeText={setQtdPaletes}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>

                <View style={styles.modalGridItem}>
                  <Text style={styles.modalLabel}>Cx/Palete</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={cxPorPalete}
                    onChangeText={setCxPorPalete}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>

                <View style={styles.modalGridItem}>
                  <Text style={styles.modalLabel}>Cx Avulsas</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={cxAvulsas}
                    onChangeText={setCxAvulsas}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>

                <View style={styles.modalGridItem}>
                  <Text style={styles.modalLabel}>Unid/Cx</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={unidPorCx}
                    onChangeText={setUnidPorCx}
                    keyboardType="numeric"
                    placeholder="1"
                  />
                </View>

                <View style={styles.modalGridItem}>
                  <Text style={styles.modalLabel}>Unid Avulsas</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={unidAvulsas}
                    onChangeText={setUnidAvulsas}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>

                <View style={styles.modalGridItem}>
                  <Text style={styles.modalLabel}>Expedição</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={avulsosExp}
                    onChangeText={setAvulsosExp}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>

              <View style={styles.modalTotal}>
                <Text style={styles.modalTotalLabel}>Total Físico:</Text>
                <Text style={styles.modalTotalValue}>{totalGeral}</Text>
              </View>

              <Text style={styles.modalSection}>Saldo Spalm</Text>
              <TextInput
                style={styles.modalInputFull}
                value={saldoSpalm}
                onChangeText={setSaldoSpalm}
                keyboardType="numeric"
                placeholder="0"
              />

              <Text style={styles.modalSection}>Qualidade</Text>

              <Text style={styles.modalSubLabel}>Embalagem</Text>
              <View style={styles.modalRadioRow}>
                <TouchableOpacity
                  style={[styles.modalRadio, embStatus === 'OK' && styles.modalRadioSelected]}
                  onPress={() => {
                    setEmbStatus('OK');
                    setShowObsEmb(false);
                  }}
                >
                  <Text style={embStatus === 'OK' ? styles.modalRadioTextSelected : styles.modalRadioText}>
                    Conforme
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalRadio, embStatus === 'AVARIA' && styles.modalRadioSelected]}
                  onPress={() => {
                    setEmbStatus('AVARIA');
                    setShowObsEmb(true);
                  }}
                >
                  <Text style={embStatus === 'AVARIA' ? styles.modalRadioTextSelected : styles.modalRadioText}>
                    Avaria
                  </Text>
                </TouchableOpacity>
              </View>

              {showObsEmb && (
                <TextInput
                  style={styles.modalObsInput}
                  value={obsEmb}
                  onChangeText={setObsEmb}
                  placeholder="Descreva a avaria..."
                  multiline
                />
              )}

              <Text style={styles.modalSubLabel}>Validade</Text>
              <View style={styles.modalRadioRow}>
                <TouchableOpacity
                  style={[styles.modalRadio, valStatus === 'OK' && styles.modalRadioSelected]}
                  onPress={() => {
                    setValStatus('OK');
                    setShowObsVal(false);
                  }}
                >
                  <Text style={valStatus === 'OK' ? styles.modalRadioTextSelected : styles.modalRadioText}>
                    Vigente
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalRadio, valStatus === 'VENCIDO' && styles.modalRadioSelected]}
                  onPress={() => {
                    setValStatus('VENCIDO');
                    setShowObsVal(true);
                  }}
                >
                  <Text style={valStatus === 'VENCIDO' ? styles.modalRadioTextSelected : styles.modalRadioText}>
                    Vencido/Próximo
                  </Text>
                </TouchableOpacity>
              </View>

              {showObsVal && (
                <TextInput
                  style={styles.modalObsInput}
                  value={obsVal}
                  onChangeText={setObsVal}
                  placeholder="Informação sobre validade..."
                  multiline
                />
              )}

              <View style={styles.modalButtons}>
                <Button
                  title="Cancelar"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                />
                <Button
                  title="Salvar"
                  onPress={salvarItem}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 12,
    color: colors.danger,
    fontSize: 18,
    fontWeight: '600',
  },
  errorButton: {
    marginTop: 20,
    minWidth: 120,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 13,
    color: colors.gray,
    marginBottom: 2,
  },
  data: {
    fontSize: 12,
    color: colors.gray,
  },
  verticalIcons: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: colors.lightGray,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.lighterGray,
  },
  excluirIcon: {
    backgroundColor: colors.danger + '20',
  },
  editTituloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  editTituloInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: colors.text,
  },
  editTituloButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  editTituloButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.lighterGray,
  },
  resumoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resumoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  resumoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  resumoItem: {
    flex: 1,
    backgroundColor: colors.lighterGray,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  resumoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  resumoLabel: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  showResumoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  showResumoText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
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
  listaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  itemCardContado: {
    borderColor: colors.success,
    backgroundColor: colors.white,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemCodigo: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  itemContadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  itemContadoText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  itemNome: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  itemUnidade: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 8,
  },
  itemDetalhes: {
    backgroundColor: colors.lighterGray,
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  itemDetalhe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detalheLabel: {
    fontSize: 12,
    color: colors.gray,
  },
  detalheValor: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  bottomSpace: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  modalProduto: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 20,
    padding: 10,
    backgroundColor: colors.lighterGray,
    borderRadius: 8,
  },
  modalSection: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 12,
  },
  modalSubLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray,
    marginTop: 12,
    marginBottom: 8,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  modalGridItem: {
    width: '33.33%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 11,
    color: colors.gray,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  modalInputFull: {
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  modalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgSuccess,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  modalTotalLabel: {
    fontSize: 14,
    color: colors.gray,
  },
  modalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
  },
  modalRadioRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  modalRadio: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.lightGray,
    alignItems: 'center',
  },
  modalRadioSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalRadioText: {
    color: colors.text,
    fontWeight: '600',
  },
  modalRadioTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  modalObsInput: {
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  modalButton: {
    flex: 1,
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: colors.gray,
  },
  modalExportContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalExportTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalExportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  modalExportOptionText: {
    marginLeft: 16,
    flex: 1,
  },
  modalExportOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  modalExportOptionDesc: {
    fontSize: 12,
    color: colors.gray,
  },
  modalExportCancel: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  modalExportCancelText: {
    fontSize: 16,
    color: colors.gray,
    fontWeight: '600',
  },
});