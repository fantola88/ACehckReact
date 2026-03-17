// app/relatorio/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
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
import { calcularContagem, validarCamposContagem } from '../../utils/calculos';
import { removerAcentos } from '../../utils/stringUtils';

// Componente de Card do Item memoizado
const ItemCard = memo(({ produto, contado, onPress, onEdit, onDelete }) => {
  return (
    <TouchableOpacity
      style={[styles.itemCard, contado && styles.itemCardContado]}
      onPress={onPress}
      activeOpacity={0.7}
    >
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

        <View style={styles.itemActions}>
          {contado && (
            <TouchableOpacity onPress={onEdit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.itemNome}>{produto.nome}</Text>
      <Text style={styles.itemUnidade}>Unidade: {produto.unid}</Text>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.contado === nextProps.contado && 
         prevProps.produto.cod === nextProps.produto.cod;
});

export default function RelatorioDetalheScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // Contextos
  const {
    relatorios,
    loading: contextLoading,
    arquivarRelatorio,
    desarquivarRelatorio,
    excluirRelatorio,
    addItem,
    updateItem,
    removeItem,
  } = useRelatorio();

  const { avisosVisuais, efeitosSonoros } = usePreferencias();
  const { playSuccessSound, playErrorSound } = useSound();

  // Estados principais
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');

  // Dados
  const [itensAlmoxarifado, setItensAlmoxarifado] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState(null);
  const [pesquisaTexto, setPesquisaTexto] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalExportVisible, setModalExportVisible] = useState(false);
  const [modalMode, setModalMode] = useState('novo');
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
  
  // Resultados
  const [totalGeral, setTotalGeral] = useState(0);
  const [diferenca, setDiferenca] = useState(0);
  const [situacao, setSituacao] = useState('AGUARDANDO');

  // Qualidade
  const [embStatus, setEmbStatus] = useState('OK');
  const [obsEmb, setObsEmb] = useState('');
  const [showObsEmb, setShowObsEmb] = useState(false);
  const [valStatus, setValStatus] = useState('OK');
  const [obsVal, setObsVal] = useState('');
  const [showObsVal, setShowObsVal] = useState(false);

  // Refs para performance
  const itensMapRef = useRef(new Map());
  const listRef = useRef(null);

  // Encontrar relatório
  useEffect(() => {
    const encontrado = relatorios.find(r => r.id === id);
    if (encontrado) {
      setRelatorio(encontrado);
      setNovoTitulo(encontrado.titulo);
      
      // Carregar itens do almoxarifado
      const produtos = getProdutosByAlmox(encontrado.almoxarifado);
      setItensAlmoxarifado(produtos);
      
      // Atualizar mapa de itens contados
      const map = new Map();
      encontrado.itens.forEach(item => map.set(item.codigo, true));
      itensMapRef.current = map;
      
      setLoading(false);
    } else if (!contextLoading) {
      setLoading(false);
    }
  }, [id, relatorios, contextLoading]);

  // Calcular diferenças
  useEffect(() => {
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
    setDiferenca(resultado.diferenca);
    setSituacao(resultado.situacao);
  }, [qtdPaletes, cxPorPalete, cxAvulsas, unidPorCx, unidAvulsas, avulsosExp, saldoSpalm]);

  // Função para filtrar itens
  const getItensFiltrados = useCallback(() => {
    if (!itensAlmoxarifado.length || !relatorio) return [];
    
    let resultados = itensAlmoxarifado;
    
    if (filtroStatus !== null) {
      resultados = resultados.filter(produto => {
        const contado = itensMapRef.current.has(produto.cod);
        return filtroStatus === true ? contado : !contado;
      });
    }
    
    if (pesquisaTexto.trim()) {
      const textoBusca = removerAcentos(pesquisaTexto.toLowerCase().trim());
      resultados = resultados.filter(produto => 
        removerAcentos(produto.cod.toLowerCase()).includes(textoBusca) ||
        removerAcentos(produto.nome.toLowerCase()).includes(textoBusca)
      );
    }
    
    return resultados;
  }, [itensAlmoxarifado, relatorio, filtroStatus, pesquisaTexto]);

  // Handlers
  const handleVoltar = () => router.back();

  const handleExportarPDF = async () => {
    setModalExportVisible(false);
    try {
      await gerarPDF({
        titulo: relatorio.titulo,
        almoxarifado: relatorio.almoxarifado,
        inventariante: relatorio.inventariante,
        dataCriacao: relatorio.dataCriacao,
        itens: relatorio.itens
      });
      if (playSuccessSound) await playSuccessSound();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o PDF');
    }
  };

  const handleExportarExcel = async () => {
    setModalExportVisible(false);
    try {
      await gerarExcel({
        titulo: relatorio.titulo,
        almoxarifado: relatorio.almoxarifado,
        inventariante: relatorio.inventariante,
        dataCriacao: relatorio.dataCriacao,
        itens: relatorio.itens
      });
      if (playSuccessSound) await playSuccessSound();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o Excel');
    }
  };

  const handleSalvarTitulo = async () => {
    if (!novoTitulo.trim()) {
      Alert.alert('Erro', 'O título não pode estar vazio');
      return;
    }
    setEditandoTitulo(false);
    if (playSuccessSound) await playSuccessSound();
  };

  const handleContarItem = (produto) => {
    setSelectedProduto(produto);
    setModalMode('novo');
    setSelectedItemId(null);

    const itemExistente = relatorio?.itens.find(i => i.codigo === produto.cod);
    if (itemExistente) {
      setQtdPaletes(itemExistente.fisico.paletes?.toString() || '0');
      setCxPorPalete(itemExistente.fisico.caixasPorPalete?.toString() || '0');
      setCxAvulsas(itemExistente.fisico.caixas?.toString() || '0');
      setUnidPorCx(itemExistente.fisico.unidadesPorCaixa?.toString() || '1');
      setUnidAvulsas(itemExistente.fisico.unidades?.toString() || '0');
      setAvulsosExp('0');
      setSaldoSpalm(itemExistente.spalm?.toString() || '0');
      setEmbStatus(itemExistente.qualidade?.embalagem === 'ok' ? 'OK' : 'AVARIA');
      setObsEmb(itemExistente.qualidade?.observacao || '');
      setShowObsEmb(itemExistente.qualidade?.embalagem !== 'ok');
      setValStatus(itemExistente.qualidade?.validade || 'OK');
      setObsVal(itemExistente.qualidade?.observacao || '');
      setShowObsVal(itemExistente.qualidade?.validade !== 'OK');
    } else {
      limparCampos();
    }

    setModalVisible(true);
  };

  const handleEditarItem = (item) => {
    const produto = itensAlmoxarifado.find(p => p.cod === item.codigo);
    if (!produto) return;
    
    setSelectedProduto(produto);
    setModalMode('editar');
    setSelectedItemId(item.id);

    setQtdPaletes(item.fisico.paletes?.toString() || '0');
    setCxPorPalete(item.fisico.caixasPorPalete?.toString() || '0');
    setCxAvulsas(item.fisico.caixas?.toString() || '0');
    setUnidPorCx(item.fisico.unidadesPorCaixa?.toString() || '1');
    setUnidAvulsas(item.fisico.unidades?.toString() || '0');
    setAvulsosExp('0');
    setSaldoSpalm(item.spalm?.toString() || '0');
    setEmbStatus(item.qualidade?.embalagem === 'ok' ? 'OK' : 'AVARIA');
    setObsEmb(item.qualidade?.observacao || '');
    setShowObsEmb(item.qualidade?.embalagem !== 'ok');
    setValStatus(item.qualidade?.validade || 'OK');
    setObsVal(item.qualidade?.observacao || '');
    setShowObsVal(item.qualidade?.validade !== 'OK');

    setModalVisible(true);
  };

  const handleRemoverItem = (produto, itemContado) => {
    if (!itemContado) return;
    
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
  };

  const limparCampos = () => {
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
  };

  const salvarItem = async () => {
    if (!selectedProduto) return;

    const params = {
      qtdPaletes: parseFloat(qtdPaletes) || 0,
      cxPorPalete: parseFloat(cxPorPalete) || 0,
      cxAvulsas: parseFloat(cxAvulsas) || 0,
      unidPorCx: parseFloat(unidPorCx) || 1,
      unidAvulsas: parseFloat(unidAvulsas) || 0,
      avulsosExp: parseFloat(avulsosExp) || 0,
      saldoSpalm: parseFloat(saldoSpalm) || 0,
    };

    const erros = validarCamposContagem(params);
    if (erros.length > 0) {
      Alert.alert('Erro de validação', erros.join('\n'));
      return;
    }

    const observacoes = [];
    if (showObsEmb && obsEmb) observacoes.push(`Embalagem: ${obsEmb}`);
    if (showObsVal && obsVal) observacoes.push(`Validade: ${obsVal}`);

    const totalFisicoReal = 
      (params.qtdPaletes * params.cxPorPalete * params.unidPorCx) + 
      (params.cxAvulsas * params.unidPorCx) + 
      params.unidAvulsas;

    const itemData = {
      codigo: selectedProduto.cod,
      nome: selectedProduto.nome,
      unidade: selectedProduto.unid,
      fisico: {
        paletes: params.qtdPaletes,
        caixasPorPalete: params.cxPorPalete,
        caixas: params.cxAvulsas,
        unidadesPorCaixa: params.unidPorCx,
        unidades: params.unidAvulsas,
        total: totalFisicoReal,
      },
      spalm: params.saldoSpalm,
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
        const itemExistente = relatorio.itens.find(i => i.codigo === selectedProduto.cod);
        if (itemExistente) {
          await updateItem(relatorio.id, itemExistente.id, itemData);
        } else {
          await addItem(relatorio.id, itemData);
        }
      } else {
        await updateItem(relatorio.id, selectedItemId, itemData);
      }

      // Atualizar o mapa
      itensMapRef.current.set(selectedProduto.cod, true);
      
      if (playSuccessSound) await playSuccessSound();
      setModalVisible(false);
      limparCampos();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o item');
    }
  };

  const getSituacaoColor = () => {
    switch (situacao) {
      case 'OK': return colors.success;
      case 'SOBRA': return colors.warning;
      case 'FALTA': return colors.danger;
      default: return colors.gray;
    }
  };

  const toggleFiltro = (valor) => {
    setFiltroStatus(prev => prev === valor ? null : valor);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const renderItem = useCallback(({ item }) => {
    const contado = itensMapRef.current.has(item.cod);
    const itemContado = contado ? relatorio.itens.find(i => i.codigo === item.cod) : null;
    
    return (
      <ItemCard
        produto={item}
        contado={contado}
        onPress={() => handleContarItem(item)}
        onEdit={() => handleEditarItem(itemContado)}
        onDelete={() => handleRemoverItem(item, itemContado)}
      />
    );
  }, [relatorio]);

  const keyExtractor = useCallback((item) => item.cod, []);

  const getItemLayout = useCallback((data, index) => ({
    length: 120,
    offset: 120 * index,
    index,
  }), []);

  const ListHeaderComponent = useCallback(() => (
    <>
      {/* Card de informações */}
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
                  <TouchableOpacity onPress={() => setEditandoTitulo(false)} style={styles.editTituloButton}>
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

          {/* Ícones verticais */}
          <View style={styles.verticalIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setEditandoTitulo(true)}>
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setModalExportVisible(true)}>
              <Ionicons name="download-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
            {relatorio.status === 'em_andamento' ? (
              <TouchableOpacity style={styles.iconButton} onPress={() => arquivarRelatorio(relatorio.id)}>
                <Ionicons name="archive-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.iconButton} onPress={() => desarquivarRelatorio(relatorio.id)}>
                <Ionicons name="refresh-outline" size={22} color={colors.success} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.iconButton, styles.excluirIcon]} onPress={() => excluirRelatorio(relatorio.id)}>
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de Pesquisa */}
        {itensAlmoxarifado.length > 0 && (
          <View style={styles.pesquisaContainer}>
            <View style={styles.pesquisaInputWrapper}>
              <Ionicons name="search-outline" size={18} color={colors.gray} style={styles.pesquisaIcon} />
              <TextInput
                style={styles.pesquisaInput}
                placeholder="Pesquisar por código ou item..."
                placeholderTextColor={colors.lightGray}
                value={pesquisaTexto}
                onChangeText={setPesquisaTexto}
              />
              {pesquisaTexto.length > 0 && (
                <TouchableOpacity onPress={() => setPesquisaTexto('')} style={styles.pesquisaLimpar}>
                  <Ionicons name="close-circle" size={16} color={colors.gray} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Filtros */}
        {itensAlmoxarifado.length > 0 && (
          <View style={styles.filtrosContainer}>
            <Text style={styles.filtrosLabel}>Filtrar:</Text>
            <View style={styles.filtrosRow}>
              <TouchableOpacity
                style={[styles.filtroChip, filtroStatus === true && styles.filtroChipAtivo]}
                onPress={() => toggleFiltro(true)}
              >
                <Text style={[styles.filtroChipText, filtroStatus === true && styles.filtroChipTextAtivo]}>
                  Contados
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filtroChip, filtroStatus === false && styles.filtroChipAtivo]}
                onPress={() => toggleFiltro(false)}
              >
                <Text style={[styles.filtroChipText, filtroStatus === false && styles.filtroChipTextAtivo]}>
                  Não Contados
                </Text>
              </TouchableOpacity>
              {filtroStatus !== null && (
                <TouchableOpacity style={styles.filtroLimpar} onPress={() => setFiltroStatus(null)}>
                  <Ionicons name="close-circle" size={18} color={colors.gray} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </Card>

      <Text style={styles.listaTitle}>
        ITENS DO ALMOXARIFADO 
        {filtroStatus !== null && (
          <Text style={styles.listaSubtitle}>
            {' '}({filtroStatus === true ? 'Contados' : 'Não Contados'})
          </Text>
        )}
        {pesquisaTexto.length > 0 && (
          <Text style={styles.listaSubtitle}>
            {' '}• Pesquisa: "{pesquisaTexto}"
          </Text>
        )}
      </Text>
    </>
  ), [relatorio, editandoTitulo, novoTitulo, itensAlmoxarifado, filtroStatus, pesquisaTexto]);

  const ListEmptyComponent = useCallback(() => (
    <Card>
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={48} color={colors.lightGray} />
        <Text style={styles.emptyText}>
          {pesquisaTexto.length > 0
            ? 'Nenhum item encontrado para a pesquisa'
            : filtroStatus === null 
              ? 'Nenhum item encontrado' 
              : filtroStatus === true 
                ? 'Nenhum item contado' 
                : 'Nenhum item não contado'}
        </Text>
      </View>
    </Card>
  ), [pesquisaTexto, filtroStatus]);

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
        <Button title="Voltar" variant="primary" onPress={handleVoltar} style={styles.errorButton} />
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
      
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          data={getItensFiltrados()}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Modal de Exportação */}
      <Modal visible={modalExportVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalExportContent}>
            <Text style={styles.modalExportTitle}>Exportar Relatório</Text>

            <TouchableOpacity style={styles.modalExportOption} onPress={handleExportarPDF}>
              <Ionicons name="document-text-outline" size={28} color={colors.danger} />
              <View style={styles.modalExportOptionText}>
                <Text style={styles.modalExportOptionTitle}>PDF</Text>
                <Text style={styles.modalExportOptionDesc}>Gerar relatório em formato PDF</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalExportOption} onPress={handleExportarExcel}>
              <Ionicons name="grid-outline" size={28} color={colors.success} />
              <View style={styles.modalExportOptionText}>
                <Text style={styles.modalExportOptionTitle}>Excel</Text>
                <Text style={styles.modalExportOptionDesc}>Gerar relatório em formato Excel</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalExportCancel} onPress={() => setModalExportVisible(false)}>
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

              <Text style={styles.modalSection}>Confronto com Spalm</Text>
              <View style={styles.modalGrid}>
                <View style={styles.modalGridItem}>
                  <Text style={styles.modalLabel}>Diferença</Text>
                  <TextInput
                    style={[styles.modalInput, { color: diferenca < 0 ? colors.danger : diferenca > 0 ? colors.warning : colors.success }]}
                    value={diferenca.toFixed(2)}
                    editable={false}
                  />
                </View>
                <View style={styles.modalGridItemFull}>
                  <View style={[styles.situacaoBox, { backgroundColor: getSituacaoColor() }]}>
                    <Text style={styles.situacaoText}>{situacao}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <Button title="Cancelar" variant="outline" onPress={() => setModalVisible(false)} style={styles.modalButton} />
                <Button title="Salvar" onPress={salvarItem} style={styles.modalButton} />
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
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  
  // Card de informações
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
  
  // Pesquisa
  pesquisaContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  pesquisaInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
  },
  pesquisaIcon: {
    marginRight: 8,
  },
  pesquisaInput: {
    flex: 1,
    height: 45,
    fontSize: 14,
    color: colors.text,
  },
  pesquisaLimpar: {
    padding: 6,
  },
  
  // Filtros
  filtrosContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  filtrosLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filtrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filtroChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  filtroChipAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filtroChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  filtroChipTextAtivo: {
    color: colors.white,
  },
  filtroLimpar: {
    padding: 4,
  },
  
  // Lista
  listaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  listaSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
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
  },
  
  // Empty
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 8,
  },
  
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modal de Contagem
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
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
  modalGridItemFull: {
    width: '100%',
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
  situacaoBox: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  situacaoText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
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
  
  // Modal de Exportação
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