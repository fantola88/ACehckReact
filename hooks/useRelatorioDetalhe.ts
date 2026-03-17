// hooks/useRelatorioDetalhe.ts
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

// Data
import { relatoriosService } from '../data/relatoriosService';

// Utils
import { playErrorSound, playSuccessSound } from '../utils/soundUtils';

interface UseRelatorioDetalheProps {
  id: string | string[];
  contagem: any;
  qualidade: any;
}

export const useRelatorioDetalhe = ({ id, contagem, qualidade }: UseRelatorioDetalheProps) => {
  const [relatorio, setRelatorio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [itensAlmoxarifado, setItensAlmoxarifado] = useState<any[]>([]);
  const [carregandoItens, setCarregandoItens] = useState(false);
  
  // Estados do modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'novo' | 'editar'>('novo');
  const [selectedProduto, setSelectedProduto] = useState<any>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Estados de edição do título
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');

  // Ref para mapa de itens contados
  const itensMapRef = useRef<Map<string, boolean>>(new Map());

  // Carrega os dados iniciais
  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carrega o relatório
      const relatorioData = await relatoriosService.getRelatorioById(id as string);
      
      if (!relatorioData) {
        setRelatorio(null);
        return;
      }

      setRelatorio(relatorioData);
      setNovoTitulo(relatorioData.titulo);

      // Para testes, vamos criar uma lista de itens baseada nos itens já contados
      // Em um cenário real, você buscaria do almoxarifadoService
      setCarregandoItens(true);
      
      // Cria uma lista de itens baseada nos itens já contados
      // Isso é apenas para teste - você precisará adaptar para sua necessidade real
      const itensMap = new Map();
      const itensList: any[] = [];
      
      relatorioData.itens?.forEach((item: any) => {
        itensMap.set(item.codigo, true);
        itensList.push({
          cod: item.codigo,
          nome: item.nome,
          unid: item.unid
        });
      });
      
      setItensAlmoxarifado(itensList);
      itensMapRef.current = itensMap;
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      playErrorSound();
    } finally {
      setLoading(false);
      setCarregandoItens(false);
    }
  };

  const handleVoltar = useCallback(() => {
    router.back();
  }, []);

  // Handlers do título
  const handleEditarTitulo = useCallback(() => {
    setEditandoTitulo(true);
  }, []);

  const handleSalvarTitulo = useCallback(async () => {
    if (!relatorio || !novoTitulo.trim()) return;

    try {
      const updated = await relatoriosService.updateRelatorio(relatorio.id, {
        titulo: novoTitulo.trim()
      });
      
      if (updated) {
        setRelatorio((prev: any) => ({ ...prev, titulo: novoTitulo.trim() }));
        setEditandoTitulo(false);
        playSuccessSound();
      }
    } catch (error) {
      console.error('Erro ao salvar título:', error);
      playErrorSound();
    }
  }, [relatorio, novoTitulo]);

  const handleCancelarEdicao = useCallback(() => {
    setEditandoTitulo(false);
    setNovoTitulo(relatorio?.titulo || '');
  }, [relatorio]);

  // Handlers de exportação (placeholders)
  const handleExportarExcel = useCallback(async () => {
    if (!relatorio) return;
    Alert.alert('Info', 'Exportação Excel em desenvolvimento');
  }, [relatorio]);

  const handleExportarPDF = useCallback(async () => {
    if (!relatorio) return;
    Alert.alert('Info', 'Exportação PDF em desenvolvimento');
  }, [relatorio]);

  // Handlers de status
  const handleArquivar = useCallback(() => {
    Alert.alert(
      'Arquivar Relatório',
      'Tem certeza que deseja arquivar este relatório?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Arquivar',
          style: 'default',
          onPress: async () => {
            try {
              if (!relatorio) return;
              
              const updated = await relatoriosService.updateRelatorio(relatorio.id, {
                status: 'arquivado'
              });
              
              if (updated) {
                setRelatorio((prev: any) => ({ ...prev, status: 'arquivado' }));
                playSuccessSound();
              }
            } catch (error) {
              console.error('Erro ao arquivar:', error);
              playErrorSound();
            }
          }
        }
      ]
    );
  }, [relatorio]);

  const handleDesarquivar = useCallback(() => {
    Alert.alert(
      'Desarquivar Relatório',
      'Tem certeza que deseja desarquivar este relatório?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desarquivar',
          style: 'default',
          onPress: async () => {
            try {
              if (!relatorio) return;
              
              const updated = await relatoriosService.updateRelatorio(relatorio.id, {
                status: 'em_andamento'
              });
              
              if (updated) {
                setRelatorio((prev: any) => ({ ...prev, status: 'em_andamento' }));
                playSuccessSound();
              }
            } catch (error) {
              console.error('Erro ao desarquivar:', error);
              playErrorSound();
            }
          }
        }
      ]
    );
  }, [relatorio]);

  const handleExcluir = useCallback(() => {
    Alert.alert(
      'Excluir Relatório',
      'Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!relatorio) return;
              
              const deleted = await relatoriosService.deleteRelatorio(relatorio.id);
              
              if (deleted) {
                playSuccessSound();
                router.back();
              }
            } catch (error) {
              console.error('Erro ao excluir:', error);
              playErrorSound();
            }
          }
        }
      ]
    );
  }, [relatorio]);

  // Handlers de itens
  const handleNovoItem = useCallback((produto: any) => {
    // Reseta os hooks
    contagem.reset();
    qualidade.reset();
    
    setSelectedProduto(produto);
    setSelectedItemId(null);
    setModalMode('novo');
    setModalVisible(true);
  }, [contagem, qualidade]);

  const handleEditarItem = useCallback((item: any) => {
    // Carrega os dados do item no hook de contagem
    contagem.loadFromItem({
      qtdPaletes: item.fisico?.paletes || 0,
      cxPorPalete: item.fisico?.cxPorPalete || 0,
      cxAvulsas: item.fisico?.caixas || 0,
      unidPorCx: item.fisico?.unidPorCx || 1,
      unidAvulsas: item.fisico?.unidades || 0,
      avulsosExp: item.fisico?.expedicao || 0,
      saldoSpalm: item.spalm || 0
    });

    // Carrega os dados de qualidade
    qualidade.loadFromItem(item.qualidade);

    setSelectedProduto({
      cod: item.codigo,
      nome: item.nome,
      unid: item.unid
    });
    
    setSelectedItemId(item.id);
    setModalMode('editar');
    setModalVisible(true);
  }, [contagem, qualidade]);

  const handleRemoverItem = useCallback((produto: any, itemContado: any) => {
    Alert.alert(
      'Remover Item',
      `Deseja remover a contagem do item ${produto.cod}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!relatorio) return;
              
              const itemId = itemContado.id || itemContado.codigo;
              const updated = await relatoriosService.removeItemFromRelatorio(relatorio.id, itemId);
              
              if (updated) {
                // Atualiza o mapa
                itensMapRef.current.delete(produto.cod);
                
                // Atualiza a lista de itens do almoxarifado
                setItensAlmoxarifado(prev => prev.filter(i => i.cod !== produto.cod));
                
                // Recarrega o relatório
                await carregarDados();
                playSuccessSound();
              }
            } catch (error) {
              console.error('Erro ao remover item:', error);
              playErrorSound();
            }
          }
        }
      ]
    );
  }, [relatorio]);

  const salvarItem = useCallback(async () => {
    if (!selectedProduto || !relatorio) return;

    const dadosContagem = contagem.getDados();
    const dadosQualidade = qualidade.getDados();

    const itemData = {
      codigo: selectedProduto.cod,
      nome: selectedProduto.nome,
      unid: selectedProduto.unid,
      fisico: {
        paletes: dadosContagem.qtdPaletes,
        cxPorPalete: dadosContagem.cxPorPalete,
        caixas: dadosContagem.cxAvulsas,
        unidPorCx: dadosContagem.unidPorCx,
        unidades: dadosContagem.unidAvulsas,
        expedicao: dadosContagem.avulsosExp,
      },
      spalm: dadosContagem.saldoSpalm,
      totalFisico: dadosContagem.totalGeral,
      diferenca: dadosContagem.diferenca,
      qualidade: dadosQualidade
    };

    try {
      let success = false;
      
      if (modalMode === 'novo') {
        success = await relatoriosService.addItemToRelatorio(relatorio.id, itemData);
        
        if (success) {
          // Adiciona o item à lista de itens do almoxarifado
          setItensAlmoxarifado(prev => [...prev, {
            cod: selectedProduto.cod,
            nome: selectedProduto.nome,
            unid: selectedProduto.unid
          }]);
          
          itensMapRef.current.set(selectedProduto.cod, true);
        }
      } else {
        success = await relatoriosService.updateItemInRelatorio(
          relatorio.id, 
          selectedItemId || selectedProduto.cod, 
          itemData
        );
      }
      
      if (success) {
        setModalVisible(false);
        contagem.reset();
        qualidade.reset();
        
        // Recarrega os dados
        await carregarDados();
        playSuccessSound();
      }
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      playErrorSound();
    }
  }, [selectedProduto, selectedItemId, modalMode, contagem, qualidade, relatorio]);

  // Efeito para carregar dados quando o modal abrir em modo edição
  useEffect(() => {
    if (modalVisible && modalMode === 'editar' && selectedProduto && relatorio) {
      const itemExistente = relatorio.itens?.find(
        (i: any) => i.codigo === selectedProduto.cod
      );
      
      if (itemExistente) {
        contagem.loadFromItem({
          qtdPaletes: itemExistente.fisico?.paletes || 0,
          cxPorPalete: itemExistente.fisico?.cxPorPalete || 0,
          cxAvulsas: itemExistente.fisico?.caixas || 0,
          unidPorCx: itemExistente.fisico?.unidPorCx || 1,
          unidAvulsas: itemExistente.fisico?.unidades || 0,
          avulsosExp: itemExistente.fisico?.expedicao || 0,
          saldoSpalm: itemExistente.spalm || 0
        });
        
        qualidade.loadFromItem(itemExistente.qualidade);
      }
    }
  }, [modalVisible, modalMode, selectedProduto, relatorio]);

  return {
    // Estados
    relatorio,
    loading,
    itensAlmoxarifado,
    carregandoItens,
    modalVisible,
    setModalVisible,
    modalMode,
    selectedProduto,
    itensMapRef,
    editandoTitulo,
    setEditandoTitulo,
    novoTitulo,
    setNovoTitulo,

    // Handlers
    handleVoltar,
    handleEditarTitulo,
    handleSalvarTitulo,
    handleCancelarEdicao,
    handleExportarExcel,
    handleExportarPDF,
    handleArquivar,
    handleDesarquivar,
    handleExcluir,
    handleNovoItem,
    handleEditarItem,
    handleRemoverItem,
    salvarItem,
  };
};