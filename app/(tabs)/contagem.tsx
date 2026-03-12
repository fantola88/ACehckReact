// app/(tabs)/contagem.tsx
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
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
import type { Inventariante, ItemInventario, Produto, Relatorio } from '../../data/types';
import { colors } from '../../styles/colors';
import { calcularContagem, validarCamposContagem } from '../../utils/calculos';
import { removerAcentos } from '../../utils/stringUtils';

const ALMOXARIFADOS = [
  { label: 'Almoxarifado Central', value: 'Almoxarifado Central' },
  { label: 'Almoxarifado de Alimentícios', value: 'Almoxarifado de Alimentícios' },
  { label: 'Almoxarifado do Serviço Médico', value: 'Almoxarifado do Serviço Médico' },
  { label: 'Almoxarifado de Informática', value: 'Almoxarifado de Informática' },
  { label: 'Almoxarifado de Produtos Gráficos', value: 'Almoxarifado de Produtos Gráficos' },
];

export default function ContagemScreen() {
  const router = useRouter();
  const [almoxarifado, setAlmoxarifado] = useState(ALMOXARIFADOS[0].value);
  
  const { inventariantes, selectedInventariante, selectInventariante } = useInventariantes();
  const { relatorios, relatorioAtivo, addItem } = useRelatorio();
  const { efeitosSonoros, avisosVisuais } = usePreferencias();
  const { playSuccessSound, playErrorSound } = useSound();

  // Estado para o relatório selecionado
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<Relatorio | null>(null);
  const [showRelatorioSelector, setShowRelatorioSelector] = useState(false);

  // Estados para Inventariante
  const [inventarianteText, setInventarianteText] = useState('');
  const [showInventarianteList, setShowInventarianteList] = useState(false);
  const [inventariantesFiltrados, setInventariantesFiltrados] = useState<Inventariante[]>([]);

  // Estados para Produto
  const [produtoText, setProdutoText] = useState('');
  const [showProdutoList, setShowProdutoList] = useState(false);
  const [produtosFiltrados, setProdutosFiltrados] = useState<any[]>([]);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  
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

  // Inicializar com o relatório ativo se existir
  useEffect(() => {
    if (relatorioAtivo && !relatorioSelecionado) {
      setRelatorioSelecionado(relatorioAtivo);
    }
  }, [relatorioAtivo]);

  // Filtrar apenas relatórios em andamento para seleção
  const relatoriosEmAndamento = relatorios.filter(r => r.status === 'em_andamento');

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

  // FILTRO DE INVENTARIANTE - SEM ACENTOS
  const filtrarInventariantes = (texto: string) => {
    if (texto.length === 0) {
      setInventariantesFiltrados([]);
      setShowInventarianteList(false);
      return;
    }
    
    const textoBusca = removerAcentos(texto.toLowerCase());
    
    const filtrados = inventariantes.filter(inv => {
      const nome = removerAcentos(inv.nome.toLowerCase());
      const cargo = inv.cargo ? removerAcentos(inv.cargo.toLowerCase()) : '';
      
      return nome.includes(textoBusca) || cargo.includes(textoBusca);
    });
    
    setInventariantesFiltrados(filtrados.slice(0, 25));
    setShowInventarianteList(filtrados.length > 0);
  };

  // FILTRO DE PRODUTO - SEM ACENTOS
  const filtrarProdutos = (texto: string) => {
    if (texto.length === 0) {
      setProdutosFiltrados([]);
      setShowProdutoList(false);
      return;
    }
    
    const textoBusca = removerAcentos(texto.toLowerCase());
    
    const produtos = getProdutosByAlmox(almoxarifado);
    const filtrados = produtos.filter(p => {
      const codigo = removerAcentos(p.cod.toLowerCase());
      const nome = removerAcentos(p.nome.toLowerCase());
      
      return codigo.includes(textoBusca) || nome.includes(textoBusca);
    });
    
    setProdutosFiltrados(filtrados.slice(0, 25));
    setShowProdutoList(filtrados.length > 0);
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
  };

  const handleSelectProduto = (produto: any) => {
    setSelectedProduto(produto);
    setProdutoText(`${produto.cod} - ${produto.nome}`);
    setCodSpalm(produto.cod);
    setNomeItem(produto.nome);
    setUnidadeMedida(produto.unid);
    setShowProdutoList(false);
  };

  const handleSelectRelatorio = (relatorio: Relatorio) => {
    setRelatorioSelecionado(relatorio);
    setShowRelatorioSelector(false);
    
    if (avisosVisuais) {
      Alert.alert('Relatório selecionado', `Contagem será adicionada ao relatório: ${relatorio.titulo}`);
    }
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
    if (!relatorioSelecionado) {
      if (efeitosSonoros) {
        await playErrorSound();
      }
      Alert.alert(
        'Nenhum relatório selecionado',
        'Selecione um relatório para adicionar a contagem.',
        [
          {
            text: 'OK',
            onPress: () => setShowRelatorioSelector(true),
          },
        ]
      );
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
      userId: relatorioSelecionado.userId,
    };

    try {
      await addItem(relatorioSelecionado.id, novoItem);
      
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

  return (
    <>
      <Stack.Screen options={{ title: 'Inventário' }} />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

          {/* Seleção de Relatório */}
          <Card>
            <Text style={styles.sectionTitle}>RELATÓRIO</Text>
            
            <TouchableOpacity
              style={styles.relatorioSelector}
              onPress={() => setShowRelatorioSelector(true)}
            >
              <View style={styles.relatorioSelectorContent}>
                <Ionicons name="document-text-outline" size={24} color={colors.primary} />
                <View style={styles.relatorioSelectorText}>
                  <Text style={styles.relatorioSelectorLabel}>
                    {relatorioSelecionado ? relatorioSelecionado.titulo : 'Selecione um relatório'}
                  </Text>
                  {relatorioSelecionado && (
                    <Text style={styles.relatorioSelectorSubtitle}>
                      {relatorioSelecionado.almoxarifado} • {relatorioSelecionado.totalItens} itens
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-down" size={20} color={colors.gray} />
              </View>
            </TouchableOpacity>

            {relatorioSelecionado && relatorioSelecionado.status !== 'em_andamento' && (
              <Text style={styles.warningText}>
                ⚠️ Este relatório não está em andamento. Você não poderá adicionar itens.
              </Text>
            )}
          </Card>

          {/* Card de Inventário */}
          <Card>
            <Text style={styles.sectionTitle}>INVENTARIANTE</Text>
            
            {/* Input de Inventariante com filtro dinâmico */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Digite o nome do inventariante..."
                placeholderTextColor={colors.lightGray}
                value={inventarianteText}
                onChangeText={(text) => {
                  setInventarianteText(text);
                  filtrarInventariantes(text);
                }}
                onFocus={() => {
                  if (inventarianteText.length > 0) {
                    filtrarInventariantes(inventarianteText);
                  }
                }}
              />
              
              {showInventarianteList && (
                <View style={styles.dropdownList}>
                  {inventariantesFiltrados.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.dropdownItem}
                      onPress={() => handleSelectInventariante(item)}
                    >
                      <Text style={styles.dropdownItemTitle}>{item.nome}</Text>
                      {item.cargo && (
                        <Text style={styles.dropdownItemSubtitle}>{item.cargo}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <Text style={styles.sectionTitle}>SELEÇÃO DE ITEM</Text>
            
            {/* Input de Produto com filtro dinâmico */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Digite código ou descrição do produto..."
                placeholderTextColor={colors.lightGray}
                value={produtoText}
                onChangeText={(text) => {
                  setProdutoText(text);
                  filtrarProdutos(text);
                }}
                onFocus={() => {
                  if (produtoText.length > 0) {
                    filtrarProdutos(produtoText);
                  }
                }}
              />
              
              {showProdutoList && (
                <View style={styles.dropdownList}>
                  {produtosFiltrados.map((item) => (
                    <TouchableOpacity
                      key={item.cod}
                      style={styles.dropdownItem}
                      onPress={() => handleSelectProduto(item)}
                    >
                      <Text style={styles.dropdownItemTitle}>{item.cod}</Text>
                      <Text style={styles.dropdownItemSubtitle}>{item.nome}</Text>
                    </TouchableOpacity>
                  ))}
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
              disabled={relatorioSelecionado?.status !== 'em_andamento'}
            />
          </Card>
        </ScrollView>
      </View>

      {/* Modal de Seleção de Relatório */}
      <Modal visible={showRelatorioSelector} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Relatório</Text>
              <TouchableOpacity onPress={() => setShowRelatorioSelector(false)}>
                <Ionicons name="close" size={24} color={colors.gray} />
              </TouchableOpacity>
            </View>

            {relatoriosEmAndamento.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color={colors.lightGray} />
                <Text style={styles.emptyTitle}>Nenhum relatório em andamento</Text>
                <Text style={styles.emptyText}>
                  Crie um novo relatório na aba "Relatórios"
                </Text>
                <Button
                  title="Ir para Relatórios"
                  variant="primary"
                  onPress={() => {
                    setShowRelatorioSelector(false);
                    router.push('/(tabs)/relatorios');
                  }}
                  style={styles.emptyButton}
                />
              </View>
            ) : (
              <FlatList
                data={relatoriosEmAndamento}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.relatorioItem}
                    onPress={() => handleSelectRelatorio(item)}
                  >
                    <View style={styles.relatorioItemHeader}>
                      <Ionicons name="document-text" size={20} color={colors.primary} />
                      <Text style={styles.relatorioItemTitulo}>{item.titulo}</Text>
                    </View>
                    <Text style={styles.relatorioItemInfo}>
                      {item.almoxarifado} • {item.totalItens} itens
                    </Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </View>
      </Modal>
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
  addButtonFull: {
    marginTop: 16,
  },
  searchContainer: {
    position: 'relative',
    zIndex: 1000,
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: colors.white,
    color: colors.text,
  },
  dropdownList: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 10,
    maxHeight: 200,
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
  relatorioSelector: {
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 10,
    backgroundColor: colors.white,
    padding: 12,
  },
  relatorioSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  relatorioSelectorText: {
    flex: 1,
  },
  relatorioSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  relatorioSelectorSubtitle: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  warningText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 8,
    fontStyle: 'italic',
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
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  relatorioItem: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  relatorioItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  relatorioItemTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  relatorioItemInfo: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 28,
  },
  separator: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
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
  emptyButton: {
    marginTop: 20,
    minWidth: 200,
  },
});