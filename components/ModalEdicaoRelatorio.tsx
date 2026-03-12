// components/ModalEdicaoRelatorio.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import type { ItemInventario } from '../data/types';
import { colors } from '../styles/colors';
import Button from './Button';
import Card from './Card';
import InputField from './InputField';
import RadioGroup from './RadioGroup';

interface ModalEdicaoRelatorioProps {
  visible: boolean;
  item: ItemInventario | null;
  onClose: () => void;
  onSave: (itemId: string, updatedItem: Partial<ItemInventario>) => void;
}

export const ModalEdicaoRelatorio: React.FC<ModalEdicaoRelatorioProps> = ({
  visible,
  item,
  onClose,
  onSave,
}) => {
  // Estados do formulário
  const [totalFisico, setTotalFisico] = useState('');
  const [saldoSpalm, setSaldoSpalm] = useState('');
  const [diferenca, setDiferenca] = useState(0);
  
  // Qualidade
  const [embStatus, setEmbStatus] = useState('OK');
  const [obsEmb, setObsEmb] = useState('');
  const [showObsEmb, setShowObsEmb] = useState(false);
  const [valStatus, setValStatus] = useState('OK');
  const [obsVal, setObsVal] = useState('');
  const [showObsVal, setShowObsVal] = useState(false);
  
  const [situacao, setSituacao] = useState('');

  useEffect(() => {
    if (item) {
      // Extrair dados do item
      setTotalFisico(item.totalFisico.toString());
      setSaldoSpalm(item.saldoSpalm.toString());
      setDiferenca(item.diferenca);
      setSituacao(item.situacao);

      // Extrair qualidade
      const qualidadeParts = item.qualidade.split(' | ');
      const embPart = qualidadeParts[0]?.replace('E:', '') || 'OK';
      const valPart = qualidadeParts[1]?.replace('V:', '') || 'OK';
      
      setEmbStatus(embPart);
      setShowObsEmb(embPart === 'AVARIA');
      setValStatus(valPart);
      setShowObsVal(valPart === 'VENCIDO');

      // Extrair observações
      if (item.observacoes) {
        setObsEmb(item.observacoes.embalagem || '');
        setObsVal(item.observacoes.validade || '');
      }
    }
  }, [item]);

  useEffect(() => {
    calcularDiferenca();
  }, [totalFisico, saldoSpalm]);

  const calcularDiferenca = () => {
    const total = parseFloat(totalFisico) || 0;
    const saldo = parseFloat(saldoSpalm) || 0;
    setDiferenca(total - saldo);
  };

  const handleSave = () => {
    if (!item) return;

    // Montar qualidade
    const qualidade = `E:${embStatus} | V:${valStatus}`;

    // Montar situação
    const observacoes = [];
    if (showObsEmb && obsEmb) observacoes.push(obsEmb);
    if (showObsVal && obsVal) observacoes.push(obsVal);
    
    const situacaoTexto = observacoes.length > 0 
      ? observacoes.join(' / ')
      : situacao || 'NORMAL';

    const updatedItem: Partial<ItemInventario> = {
      totalFisico: parseFloat(totalFisico) || 0,
      saldoSpalm: parseFloat(saldoSpalm) || 0,
      diferenca: parseFloat(diferenca.toFixed(2)),
      qualidade,
      situacao: situacaoTexto,
      observacoes: {
        embalagem: showObsEmb ? obsEmb : undefined,
        validade: showObsVal ? obsVal : undefined,
      },
    };

    onSave(item.id, updatedItem);
  };

  const getDiferencaColor = () => {
    if (diferenca === 0) return colors.success;
    if (diferenca > 0) return colors.warning;
    return colors.danger;
  };

  if (!item) return null;

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
            <Text style={styles.modalTitle}>Editar Item</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Informações do produto */}
            <Card style={styles.infoCard}>
              <Text style={styles.infoLabel}>Código</Text>
              <Text style={styles.infoValue}>{item.codigo}</Text>
              
              <Text style={styles.infoLabel}>Item</Text>
              <Text style={styles.infoValue}>{item.item}</Text>
              
              <Text style={styles.infoLabel}>Unidade</Text>
              <Text style={styles.infoValue}>{item.unidade}</Text>
            </Card>

            {/* Campos de edição */}
            <Card>
              <Text style={styles.sectionTitle}>Confronto com Spalm</Text>
              
              <View style={styles.grid}>
                <View style={styles.gridItemHalf}>
                  <InputField
                    label="Total Físico"
                    value={totalFisico}
                    onChangeText={setTotalFisico}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.gridItemHalf}>
                  <InputField
                    label="Saldo Spalm"
                    value={saldoSpalm}
                    onChangeText={setSaldoSpalm}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.gridItemFull}>
                  <View style={[styles.diferencaBox, { backgroundColor: getDiferencaColor() }]}>
                    <Text style={styles.diferencaLabel}>Diferença</Text>
                    <Text style={styles.diferencaValue}>
                      {diferenca > 0 ? '+' : ''}{diferenca.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* Qualidade */}
            <Card>
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
            </Card>

            {/* Situação */}
            <Card>
              <Text style={styles.sectionTitle}>Situação</Text>
              
              <InputField
                label="Observações"
                value={situacao}
                onChangeText={setSituacao}
                placeholder="Observações adicionais..."
                multiline
                numberOfLines={3}
              />
            </Card>

            {/* Data */}
            <Card>
              <Text style={styles.infoLabel}>Data do registro</Text>
              <Text style={styles.infoValue}>{item.data}</Text>
            </Card>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={onClose}
              style={styles.footerButton}
            />
            <Button
              title="Salvar"
              variant="primary"
              onPress={handleSave}
              style={styles.footerButton}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    width: '95%',
    maxWidth: 500,
    maxHeight: '90%',
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
    padding: 12,
    maxHeight: '70%',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: colors.lightGray,
    gap: 8,
  },
  footerButton: {
    flex: 1,
    maxWidth: 120,
  },
  infoCard: {
    marginBottom: 8,
    padding: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray,
    marginTop: 8,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
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
  diferencaBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  diferencaLabel: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  diferencaValue: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ModalEdicaoRelatorio;