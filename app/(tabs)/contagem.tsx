// app/(tabs)/contagem.tsx
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Componentes
import Button from '../../components/Button';
import Card from '../../components/Card';
import InputField from '../../components/InputField';
import RadioGroup from '../../components/RadioGroup';

// Contexts
import { useInventariantes } from '../../contexts/InventariantesContext';
import { usePreferencias } from '../../contexts/PreferenciasContext';
import { useRelatorio } from '../../contexts/RelatorioContext';

// Hooks
import { useSound } from '../../hooks/useSound';

// Data e Utils
import { getProdutosByAlmox } from '../../data/produtos';
import type { Inventariante, ItemInventario, Produto } from '../../data/types';
import { colors } from '../../styles/colors';
import { calcularContagem, validarCamposContagem } from '../../utils/calculos';

const ALMOXARIFADOS = [
  { label: 'Almoxarifado Central', value: 'Almoxarifado Central' },
  { label: 'Almoxarifado de Alimentícios', value: 'Almoxarifado de Alimentícios' },
  { label: 'Almoxarifado do Serviço Médico', value: 'Almoxarifado do Serviço Médico' },
  { label: 'Almoxarifado de Informática', value: 'Almoxarifado de Informática' },
  { label: 'Almoxarifado de Produtos Gráficos', value: 'Almoxarifado de Produtos Gráficos' },
];

const ITENS_POR_PAGINA = 25;

export default function ContagemScreen() {
  const router = useRouter();
  const [almoxarifado, setAlmoxarifado] = useState(ALMOXARIFADOS[0].value);
  
  const { inventariantes, selectedInventariante, selectInventariante } = useInventariantes();
  const { relatorioAtivo, addItem } = useRelatorio();
  const { efeitosSonoros, avisosVisuais } = usePreferencias();
  const { playSuccessSound, playErrorSound } = useSound();

  // Estados para Inventariante
  const [inventarianteText, setInventarianteText] = useState('');
  const [showInventarianteList, setShowInventarianteList] = useState(false);
  const [inventariantesFiltrados, setInventariantesFiltrados] = useState<Inventariante[]>([]);
  const [inventarianteFocused, setInventarianteFocused] = useState(false);

  // Estados para Produto
  const [produtoText, setProdutoText] = useState('');
  const [showProdutoList, setShowProdutoList] = useState(false);
  const [produtosFiltrados, setProdutosFiltrados] = useState<any[]>([]);
  const [produtosExibidos, setProdutosExibidos] = useState<any[]>([]);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [produtoFocused, setProdutoFocused] = useState(false);
  const [produtoPage, setProdutoPage] = useState(1);
  
  // Refs para os inputs
  const inventarianteInputRef = useRef<any>(null);
  const produtoInputRef = useRef<any>(null);
  
  // Campos do produto
  const [codSpalm, setCodSpalm] = useState('');
  const [nomeItem, setNomeItem] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('');
  
  // Campos de cálculo
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
  const [situacao, setSituacao] = useState<'AGUARDANDO' | 'OK' | 'SOBRA' | 'FALTA'>('AGUARDANDO');
  
  // Qualidade
  const [embStatus, setEmbStatus] = useState('OK');
  const [obsEmb, setObsEmb] = useState('');
  const [showObsEmb, setShowObsEmb] = useState(false);
  const [valStatus, setValStatus] = useState('OK');
  const [obsVal, setObsVal] = useState('');
  const [showObsVal, setShowObsVal] = useState(false);

  // Verificar se há relatório ativo
  useEffect(() => {
    if (!relatorioAtivo) {
      if (efeitosSonoros) {
        playErrorSound();
      }
      if (avisosVisuais) {
        Alert.alert(
          'Nenhum relatório ativo',
          'Crie um novo relatório na aba "Relatórios" antes de começar a contagem.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/(tabs)/relatorios'),
            },
          ]
        );
      } else {
        router.push('/(tabs)/relatorios');
      }
    }
  }, [relatorioAtivo, efeitosSonoros, avisosVisuais]);

  // Inicializar com inventariante selecionado
  useEffect(() => {
    if (selectedInventariante) {
      setInventarianteText(selectedInventariante.nome);
    }
  }, [selectedInventariante]);

  // Calcular diferenças
  useEffect(() => {
    calcular();
  }, [qtdPaletes, cxPorPalete, cxAvulsas, unidPorCx, unidAvulsas, avulsosExp, saldoSpalm]);

  // FILTRO DE INVENTARIANTE - só mostra quando o input está focado
  useEffect(() => {
    if (inventarianteFocused && inventarianteText.length >= 2) {
      const filtrados = inventariantes.filter(inv => 
        inv.nome.toLowerCase().includes(inventarianteText.toLowerCase()) ||
        inv.cargo?.toLowerCase().includes(inventarianteText.toLowerCase())
      );
      setInventariantesFiltrados(filtrados.slice(0, ITENS_POR_PAGINA));
      setShowInventarianteList(filtrados.length > 0);
    } else {
      setShowInventarianteList(false);
    }
  }, [inventarianteText, inventariantes, inventarianteFocused]);

  // FILTRO DE PRODUTO - só mostra quando o input está focado
  useEffect(() => {
    if (produtoFocused && produtoText.length >= 2) {
      const produtos = getProdutosByAlmox(almoxarifado);
      const filtrados = produtos.filter(p => 
        p.cod.toLowerCase().includes(produtoText.toLowerCase()) ||
        p.nome.toLowerCase().includes(produtoText.toLowerCase())
      );
      setProdutosFiltrados(filtrados);
      setProdutosExibidos(filtrados.slice(0, ITENS_POR_PAGINA));
      setProdutoPage(1);
      setShowProdutoList(filtrados.length > 0);
    } else {
      setShowProdutoList(false);
    }
  }, [produtoText, almoxarifado, produtoFocused]);

  const carregarMaisProdutos = () => {
    const proximaPagina = produtoPage + 1;
    const inicio = produtoPage * ITENS_POR_PAGINA;
    const fim = proximaPagina * ITENS_POR_PAGINA;
    const novosItens = produtosFiltrados.slice(inicio, fim);
    
    if (novosItens.length > 0) {
      setProdutosExibidos(prev => [...prev, ...novosItens]);
      setProdutoPage(proximaPagina);
    }
  };

  const calcular = () => {
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
  };

  const handleSelectInventariante = (inventariante: Inventariante) => {
    setInventarianteText(inventariante.nome);
    selectInventariante(inventariante);
    setShowInventarianteList(false);
    setInventarianteFocused(false);
    inventarianteInputRef.current?.blur();
  };

  const handleSelectProduto = (produto: any) => {
    setSelectedProduto(produto);
    setProdutoText(`${produto.cod} - ${produto.nome}`);
    setCodSpalm(produto.cod);
    setNomeItem(produto.nome);
    setUnidadeMedida(produto.unid);
    setShowProdutoList(false);
    setProdutoFocused(false);
    produtoInputRef.current?.blur();
  };

  const limparCampos = () => {
    setSelectedProduto(null);
    setProdutoText('');
    setCodSpalm('');
    setNomeItem('');
    setUnidadeMedida('');
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

  const salvarNoRelatorio = async () => {
    if (!relatorioAtivo) {
      if (efeitosSonoros) {
        await playErrorSound();
      }
      if (avisosVisuais) {
        Alert.alert('Erro', 'Nenhum relatório ativo');
      }
      router.push('/(tabs)/relatorios');
      return;
    }

    if (!selectedProduto) {
      if (efeitosSonoros) {
        await playErrorSound();
      }
      if (avisosVisuais) {
        Alert.alert('Erro', 'Selecione um produto válido!');
      }
      return;
    }

    if (!inventarianteText) {
      if (efeitosSonoros) {
        await playErrorSound();
      }
      if (avisosVisuais) {
        Alert.alert('Erro', 'Selecione um inventariante!');
      }
      return;
    }

    const erros = validarCamposContagem({
      qtdPaletes: parseFloat(qtdPaletes) || 0,
      cxPorPalete: parseFloat(cxPorPalete) || 0,
      cxAvulsas: parseFloat(cxAvulsas) || 0,
      unidPorCx: parseFloat(unidPorCx) || 1,
      unidAvulsas: parseFloat(unidAvulsas) || 0,
      avulsosExp: parseFloat(avulsosExp) || 0,
      saldoSpalm: parseFloat(saldoSpalm) || 0,
    });

    if (erros.length > 0) {
      if (efeitosSonoros) {
        await playErrorSound();
      }
      if (avisosVisuais) {
        Alert.alert('Erro de validação', erros.join('\n'));
      }
      return;
    }

    const observacoes: { embalagem?: string; validade?: string } = {};
    
    if (showObsEmb && obsEmb) {
      observacoes.embalagem = obsEmb;
    }
    
    if (showObsVal && obsVal) {
      observacoes.validade = obsVal;
    }

    const situacaoTexto = Object.keys(observacoes).length > 0 
      ? Object.values(observacoes).filter(Boolean).join(' / ')
      : 'NORMAL';

    const novoItem: Omit<ItemInventario, 'id'> = {
      codigo: codSpalm,
      nome: nomeItem,
      unidade: unidadeMedida,
      fisico: {
        paletes: parseFloat(qtdPaletes) || 0,
        caixas: (parseFloat(cxPorPalete) || 0) + (parseFloat(cxAvulsas) || 0),
        unidades: parseFloat(unidAvulsas) || 0,
      },
      spalm: parseFloat(saldoSpalm) || 0,
      qualidade: {
        embalagem: embStatus === 'OK' ? 'ok' : 'danificada',
        validade: valStatus,
        observacao: obsEmb || obsVal || '',
      },
      observacaoGeral: situacaoTexto,
      dataRegistro: new Date().toISOString(),
      userId: relatorioAtivo.userId,
    };

    try {
      await addItem(relatorioAtivo.id, novoItem);
      
      if (efeitosSonoros) {
        await playSuccessSound();
      }
      
      if (avisosVisuais) {
        Alert.alert('Sucesso', 'Item adicionado ao relatório!');
      }
      
      limparCampos();
    } catch (error) {
      if (efeitosSonoros) {
        await playErrorSound();
      }
      if (avisosVisuais) {
        Alert.alert('Erro', 'Não foi possível adicionar o item');
      }
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

  const renderProdutoFooter = () => {
    if (produtosExibidos.length < produtosFiltrados.length) {
      return (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={carregarMaisProdutos}
        >
          <Text style={styles.loadMoreText}>Carregar mais...</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Contagem' }} />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >

          {/* Seleção de Almoxarifado */}
          <Card>
            <Text style={styles.sectionTitle}>ALMOXARIFADO</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={almoxarifado}
                onValueChange={(value) => setAlmoxarifado(value)}
                style={styles.picker}
              >
                {ALMOXARIFADOS.map((item) => (
                  <Picker.Item key={item.value} label={item.label} value={item.value} />
                ))}
              </Picker>
            </View>
          </Card>

          {/* Informação do Relatório Ativo */}
          {relatorioAtivo && (
            <Card variant="cadastro" style={styles.relatorioAtivoCard}>
              <View style={styles.relatorioAtivoHeader}>
                <Ionicons name="document-text" size={20} color={colors.accent} />
                <Text style={styles.relatorioAtivoTitulo} numberOfLines={1}>
                  {relatorioAtivo.titulo}
                </Text>
              </View>
              <Text style={styles.relatorioAtivoInfo}>
                {relatorioAtivo.almoxarifado} • {relatorioAtivo.totalItens} itens
              </Text>
            </Card>
          )}

          {/* Card de Inventário */}
          <Card>
            <Text style={styles.sectionTitle}>INVENTARIANTE</Text>
            
            {/* Input de Inventariante com filtro dinâmico */}
            <View style={styles.searchContainer}>
              <TouchableOpacity 
                activeOpacity={1}
                onPress={() => inventarianteInputRef.current?.focus()}
              >
                <InputField
                  ref={inventarianteInputRef}
                  placeholder="Digite o nome do inventariante..."
                  value={inventarianteText}
                  onChangeText={setInventarianteText}
                  onFocus={() => setInventarianteFocused(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      setInventarianteFocused(false);
                      setShowInventarianteList(false);
                    }, 200);
                  }}
                />
              </TouchableOpacity>
              
              {showInventarianteList && (
                <View style={styles.dropdownList}>
                  <FlatList
                    data={inventariantesFiltrados}
                    keyExtractor={(item) => item.id}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleSelectInventariante(item)}
                      >
                        <Text style={styles.dropdownItemTitle}>{item.nome}</Text>
                        {item.cargo && (
                          <Text style={styles.dropdownItemSubtitle}>{item.cargo}</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>

            <Text style={styles.sectionTitle}>SELEÇÃO DE ITEM</Text>
            
            {/* Input de Produto com filtro dinâmico */}
            <View style={styles.searchContainer}>
              <TouchableOpacity 
                activeOpacity={1}
                onPress={() => produtoInputRef.current?.focus()}
              >
                <InputField
                  ref={produtoInputRef}
                  placeholder="Digite código ou descrição do produto..."
                  value={produtoText}
                  onChangeText={setProdutoText}
                  onFocus={() => setProdutoFocused(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      setProdutoFocused(false);
                      setShowProdutoList(false);
                    }, 200);
                  }}
                />
              </TouchableOpacity>
              
              {showProdutoList && (
                <View style={styles.dropdownList}>
                  <FlatList
                    data={produtosExibidos}
                    keyExtractor={(item) => item.cod}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleSelectProduto(item)}
                      >
                        <Text style={styles.dropdownItemTitle}>{item.cod}</Text>
                        <Text style={styles.dropdownItemSubtitle}>{item.nome}</Text>
                      </TouchableOpacity>
                    )}
                    ListFooterComponent={renderProdutoFooter}
                  />
                </View>
              )}
            </View>
            
            <InputField
              label="Unidade de Medida"
              value={unidadeMedida}
              onChangeText={() => {}}
              editable={false}
              style={styles.fieldSpacing}
            />

            <Text style={styles.sectionTitle}>Cálculo de Contagem Física</Text>
            <View style={styles.grid}>
              <View style={styles.gridItemThird}>
                <InputField
                  label="Paletes"
                  value={qtdPaletes}
                  onChangeText={setQtdPaletes}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gridItemThird}>
                <InputField
                  label="Cx/Palete"
                  value={cxPorPalete}
                  onChangeText={setCxPorPalete}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gridItemThird}>
                <InputField
                  label="Cx Avulsas"
                  value={cxAvulsas}
                  onChangeText={setCxAvulsas}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gridItemThird}>
                <InputField
                  label="Unid/Cx"
                  value={unidPorCx}
                  onChangeText={setUnidPorCx}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gridItemThird}>
                <InputField
                  label="Unid Avulsas"
                  value={unidAvulsas}
                  onChangeText={setUnidAvulsas}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gridItemThird}>
                <InputField
                  label="Expedição"
                  value={avulsosExp}
                  onChangeText={setAvulsosExp}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.gridItemFull}>
                <InputField
                  label="Total Físico Contado"
                  value={totalGeral.toFixed(2)}
                  onChangeText={() => {}}
                  editable={false}
                  inputStyle={styles.totalField}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Qualidade</Text>
            
            <RadioGroup
              label="Integridade Embalagem"
              options={[
                { value: 'OK', label: 'Conforme' },
                { value: 'AVARIA', label: 'Avaria' },
              ]}
              value={embStatus}
              onChange={(val) => {
                setEmbStatus(val);
                setShowObsEmb(val === 'AVARIA');
              }}
              showObs={showObsEmb}
              obsValue={obsEmb}
              onObsChange={setObsEmb}
              obsPlaceholder="Ex: Amassado, Rasgado..."
            />
            
            <RadioGroup
              label="Validade"
              options={[
                { value: 'OK', label: 'Vigente' },
                { value: 'VENCIDO', label: 'Vencido/Próximo' },
              ]}
              value={valStatus}
              onChange={(val) => {
                setValStatus(val);
                setShowObsVal(val === 'VENCIDO');
              }}
              showObs={showObsVal}
              obsValue={obsVal}
              onObsChange={setObsVal}
              obsPlaceholder="Informação de validade..."
            />

            <Text style={styles.sectionTitle}>Confronto com Spalm</Text>
            <View style={styles.grid}>
              <View style={styles.gridItemHalf}>
                <InputField
                  label="Saldo em Spalm"
                  value={saldoSpalm}
                  onChangeText={setSaldoSpalm}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.gridItemHalf}>
                <InputField
                  label="Diferença"
                  value={diferenca.toFixed(2)}
                  onChangeText={() => {}}
                  editable={false}
                  inputStyle={{ color: diferenca < 0 ? colors.danger : diferenca > 0 ? colors.warning : colors.success }}
                />
              </View>
              <View style={styles.gridItemFull}>
                <View style={[styles.situacaoBox, { backgroundColor: getSituacaoColor() }]}>
                  <Text style={styles.situacaoText}>{situacao}</Text>
                </View>
              </View>
            </View>
            
            <Button
              title="ADICIONAR AO RELATÓRIO"
              onPress={salvarNoRelatorio}
              style={styles.addButtonFull}
            />
          </Card>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginVertical: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridItemHalf: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  gridItemFull: {
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  gridItemThird: {
    width: '33.33%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  fieldSpacing: {
    marginBottom: 8,
  },
  totalField: {
    backgroundColor: colors.bgSuccess,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
    textAlign: 'center',
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
  relatorioAtivoCard: {
    marginTop: -10,
    marginBottom: 10,
    padding: 12,
  },
  relatorioAtivoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  relatorioAtivoTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    flex: 1,
  },
  relatorioAtivoInfo: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 28,
  },
  addButtonFull: {
    marginTop: 16,
  },
  searchContainer: {
    position: 'relative',
    zIndex: 1000,
    marginBottom: 16,
  },
  dropdownList: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 10,
    maxHeight: 300,
    zIndex: 2000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  dropdownItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  dropdownItemSubtitle: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  loadMoreButton: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: colors.lighterGray,
  },
  loadMoreText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});