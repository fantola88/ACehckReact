// components/RelatorioTable.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ItemInventario } from '../data/types';
import { colors } from '../styles/colors';

interface RelatorioTableProps {
  itens: ItemInventario[];
  almoxarifado: string;
  onEdit?: (item: ItemInventario) => void;
  onDelete?: (itemId: string) => void;
  onClear?: () => void;
  onExport?: (format: 'excel' | 'pdf') => void;
  showActions?: boolean;
}

export const RelatorioTable: React.FC<RelatorioTableProps> = ({
  itens,
  almoxarifado,
  onEdit,
  onDelete,
  onClear,
  onExport,
  showActions = true,
}) => {
  const { user } = useAuth();

  const getSituacaoColor = (diferenca: number, totalFisico: number, saldoSpalm: number) => {
    if (totalFisico === 0 && saldoSpalm === 0) return colors.gray;
    if (diferenca === 0) return colors.success;
    if (diferenca > 0) return colors.warning;
    return colors.danger;
  };

  const getSituacaoText = (diferenca: number, totalFisico: number, saldoSpalm: number) => {
    if (totalFisico === 0 && saldoSpalm === 0) return 'AGUARDANDO';
    if (diferenca === 0) return 'OK';
    if (diferenca > 0) return 'SOBRA';
    return 'FALTA';
  };

  const handleDelete = (item: ItemInventario) => {
    // Verificar se o usuário é o dono
    if (item.userId !== user?.uid) {
      Alert.alert('Erro', 'Você só pode excluir seus próprios itens');
      return;
    }

    Alert.alert(
      'Confirmar exclusão',
      'Deseja realmente remover este item?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => onDelete?.(item.id),
        },
      ]
    );
  };

  const handleEdit = (item: ItemInventario) => {
    // Verificar se o usuário é o dono
    if (item.userId !== user?.uid) {
      Alert.alert('Erro', 'Você só pode editar seus próprios itens');
      return;
    }
    onEdit?.(item);
  };

  if (itens.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={60} color={colors.lightGray} />
        <Text style={styles.emptyTitle}>Nenhum item no relatório</Text>
        <Text style={styles.emptyText}>
          Adicione itens através do formulário de inventário
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RELATÓRIO DE AUDITORIA</Text>
        <Text style={styles.subtitle}>
          {almoxarifado} • {itens.length} {itens.length === 1 ? 'item' : 'itens'}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={[styles.headerCell, styles.cellCodigo]}>
              <Text style={styles.headerText}>CÓDIGO</Text>
            </View>
            <View style={[styles.headerCell, styles.cellItem]}>
              <Text style={styles.headerText}>ITEM</Text>
            </View>
            <View style={[styles.headerCell, styles.cellUnid]}>
              <Text style={styles.headerText}>UNID</Text>
            </View>
            <View style={[styles.headerCell, styles.cellNumero]}>
              <Text style={styles.headerText}>FÍSICO</Text>
            </View>
            <View style={[styles.headerCell, styles.cellNumero]}>
              <Text style={styles.headerText}>SPALM</Text>
            </View>
            <View style={[styles.headerCell, styles.cellNumero]}>
              <Text style={styles.headerText}>DIF</Text>
            </View>
            <View style={[styles.headerCell, styles.cellQualidade]}>
              <Text style={styles.headerText}>QUALIDADE</Text>
            </View>
            <View style={[styles.headerCell, styles.cellSituacao]}>
              <Text style={styles.headerText}>SITUAÇÃO</Text>
            </View>
            <View style={[styles.headerCell, styles.cellData]}>
              <Text style={styles.headerText}>DATA</Text>
            </View>
            <View style={[styles.headerCell, styles.cellUsuario]}>
              <Text style={styles.headerText}>USUÁRIO</Text>
            </View>
            {showActions && (
              <View style={[styles.headerCell, styles.cellAcoes]}>
                <Text style={styles.headerText}>AÇÕES</Text>
              </View>
            )}
          </View>

          {itens.map((item) => {
            const isOwner = item.userId === user?.uid;
            
            return (
              <View key={item.id} style={styles.tableRow}>
                <View style={[styles.cell, styles.cellCodigo]}>
                  <Text style={styles.codigoText}>{item.codigo}</Text>
                </View>
                <View style={[styles.cell, styles.cellItem]}>
                  <Text style={styles.itemText} numberOfLines={2}>
                    {item.item}
                  </Text>
                </View>
                <View style={[styles.cell, styles.cellUnid]}>
                  <Text style={styles.cellText}>{item.unidade}</Text>
                </View>
                <View style={[styles.cell, styles.cellNumero]}>
                  <Text style={[styles.cellText, styles.numeroText]}>
                    {item.totalFisico}
                  </Text>
                </View>
                <View style={[styles.cell, styles.cellNumero]}>
                  <Text style={[styles.cellText, styles.numeroText]}>
                    {item.saldoSpalm}
                  </Text>
                </View>
                <View style={[styles.cell, styles.cellNumero]}>
                  <Text style={[
                    styles.cellText,
                    styles.numeroText,
                    { color: getSituacaoColor(item.diferenca, item.totalFisico, item.saldoSpalm) }
                  ]}>
                    {item.diferenca > 0 ? `+${item.diferenca}` : item.diferenca}
                  </Text>
                </View>
                <View style={[styles.cell, styles.cellQualidade]}>
                  <Text style={styles.cellText}>{item.qualidade}</Text>
                </View>
                <View style={[styles.cell, styles.cellSituacao]}>
                  <View style={[
                    styles.situacaoBadge,
                    { backgroundColor: getSituacaoColor(item.diferenca, item.totalFisico, item.saldoSpalm) }
                  ]}>
                    <Text style={styles.situacaoText}>
                      {getSituacaoText(item.diferenca, item.totalFisico, item.saldoSpalm)}
                    </Text>
                  </View>
                </View>
                <View style={[styles.cell, styles.cellData]}>
                  <Text style={styles.cellText}>{item.data}</Text>
                </View>
                <View style={[styles.cell, styles.cellUsuario]}>
                  <Text style={styles.userEmailText} numberOfLines={1}>
                    {item.userEmail?.split('@')[0] || 'Sistema'}
                  </Text>
                </View>
                {showActions && (
                  <View style={[styles.cell, styles.cellAcoes]}>
                    <View style={styles.actionButtons}>
                      {onEdit && (
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            styles.editButton,
                            !isOwner && styles.actionButtonDisabled
                          ]}
                          onPress={() => handleEdit(item)}
                          disabled={!isOwner}
                        >
                          <Ionicons 
                            name="create-outline" 
                            size={16} 
                            color={isOwner ? colors.white : colors.gray} 
                          />
                        </TouchableOpacity>
                      )}
                      {onDelete && (
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            styles.deleteButton,
                            !isOwner && styles.actionButtonDisabled
                          ]}
                          onPress={() => handleDelete(item)}
                          disabled={!isOwner}
                        >
                          <Ionicons 
                            name="trash-outline" 
                            size={16} 
                            color={isOwner ? colors.white : colors.gray} 
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 12,
    marginVertical: 10,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  table: {
    minWidth: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  headerCell: {
    justifyContent: 'center',
  },
  headerText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  cell: {
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 11,
    color: colors.text,
    textAlign: 'center',
  },
  codigoText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  itemText: {
    fontSize: 11,
    color: colors.text,
    textAlign: 'left',
  },
  numeroText: {
    fontWeight: '600',
    textAlign: 'right',
  },
  userEmailText: {
    fontSize: 10,
    color: colors.gray,
    textAlign: 'center',
  },
  cellCodigo: {
    width: 100,
    paddingHorizontal: 4,
  },
  cellItem: {
    width: 200,
    paddingHorizontal: 8,
  },
  cellUnid: {
    width: 60,
    paddingHorizontal: 4,
  },
  cellNumero: {
    width: 70,
    paddingHorizontal: 4,
  },
  cellQualidade: {
    width: 100,
    paddingHorizontal: 4,
  },
  cellSituacao: {
    width: 100,
    paddingHorizontal: 4,
  },
  cellData: {
    width: 80,
    paddingHorizontal: 4,
  },
  cellUsuario: {
    width: 80,
    paddingHorizontal: 4,
  },
  cellAcoes: {
    width: 80,
    paddingHorizontal: 4,
  },
  situacaoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  situacaoText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  actionButtonDisabled: {
    backgroundColor: colors.lightGray,
    opacity: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: colors.white,
    borderRadius: 18,
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

export default RelatorioTable;