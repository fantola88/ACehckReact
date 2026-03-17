// app/(tabs)/configuracoes.tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Componentes
import Card from '../../components/Card';

// Contexts e Hooks
import { useAuth } from '../../contexts/AuthContext';
import { usePreferencias } from '../../contexts/PreferenciasContext';
import { useRelatorio } from '../../contexts/RelatorioContext';

// Utils
import { colors } from '../../styles/colors';

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { relatorios } = useRelatorio();
  const { user, logout } = useAuth();
  
  // USAR O CONTEXTO DE PREFERÊNCIAS
  const { 
    efeitosSonoros, 
    avisosVisuais, 
    setEfeitosSonoros, 
    setAvisosVisuais 
  } = usePreferencias();

  // Estatísticas calculadas
  const totalRelatorios = relatorios.length;
  const relatoriosFinalizados = relatorios.filter(r => r.status === 'finalizado').length;
  const relatoriosAndamento = relatorios.filter(r => r.status === 'em_andamento').length;
  const totalItensContados = relatorios.reduce((acc, r) => acc + (r.totalItens || 0), 0);

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Configurações' }} />
      <ScrollView style={styles.container}>
        
        {/* PERFIL DO USUÁRIO */}
        <Card>
          <View style={styles.profileSection}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileIconText}>
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.displayName || 'Usuário'}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        {/* PREFERÊNCIAS */}
        <Card>
          <Text style={styles.sectionTitle}>PREFERÊNCIAS</Text>

          {/* Efeitos Sonoros */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="volume-high" size={22} color={colors.accent} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Efeitos sonoros</Text>
                <Text style={styles.settingDescription}>
                  Sons ao adicionar itens e ações
                </Text>
              </View>
            </View>
            <Switch
              value={efeitosSonoros}
              onValueChange={setEfeitosSonoros}
              trackColor={{ false: colors.lightGray, true: colors.accent }}
              thumbColor={colors.white}
            />
          </View>

          {/* Avisos Visuais */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBg, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="notifications" size={22} color={colors.success} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Avisos visuais</Text>
                <Text style={styles.settingDescription}>
                  Mensagens de confirmação (alertas)
                </Text>
              </View>
            </View>
            <Switch
              value={avisosVisuais}
              onValueChange={setAvisosVisuais}
              trackColor={{ false: colors.lightGray, true: colors.success }}
              thumbColor={colors.white}
            />
          </View>
        </Card>

        {/* SAIR */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.danger} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.gray,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: colors.danger + '40',
  },
  logoutText: {
    fontSize: 16,
    color: colors.danger,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 30,
  },
}); 