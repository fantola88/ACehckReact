// app/(auth)/register.tsx
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import Button from '../../components/Button';
import Card from '../../components/Card';
import InputField from '../../components/InputField';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../styles/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    nome?: string;
    email?: string;
    cargo?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    // Cargo é opcional, não validar

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const success = await signUp(email, password, nome, cargo || undefined);
    
    if (success) {
      // Aguarda um momento para o Firebase atualizar o estado
      setTimeout(() => {
        router.replace('/(tabs)/contagem');
      }, 500);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>
            A<Text style={styles.logoAccent}>Check</Text>
          </Text>
          <Text style={styles.subtitle}>Gestão de Inventário</Text>
        </View>

        {/* Formulário */}
        <Card style={styles.card}>
          <Text style={styles.title}>Criar nova conta</Text>
          <Text style={styles.subtitle2}>Preencha os dados abaixo</Text>

          <InputField
            label="Nome completo"
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome"
            error={errors.nome}
            style={styles.input}
            autoCapitalize="words"
            required
          />

          <InputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            style={styles.input}
            required
          />

          <InputField
            label="Cargo (opcional)"
            value={cargo}
            onChangeText={setCargo}
            placeholder="Ex: Almoxarife, Coordenador, Auditor..."
            error={errors.cargo}
            style={styles.input}
            autoCapitalize="words"
          />

          <View style={styles.passwordContainer}>
            <InputField
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              error={errors.password}
              style={styles.input}
              required
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color={colors.gray}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <InputField
              label="Confirmar senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry={!showConfirmPassword}
              error={errors.confirmPassword}
              style={styles.input}
              required
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={24}
                color={colors.gray}
              />
            </TouchableOpacity>
          </View>

          <Button
            title="Criar conta"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem uma conta? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Faça login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.primary,
  },
  logoAccent: {
    color: colors.accent,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    marginTop: -5,
  },
  card: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle2: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 35,
    zIndex: 10,
  },
  registerButton: {
    marginTop: 10,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: colors.gray,
    fontSize: 14,
  },
  loginLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});