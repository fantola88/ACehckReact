// app/(auth)/login.tsx
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
  View,
} from 'react-native';

import Button from '../../components/Button';
import Card from '../../components/Card';
import InputField from '../../components/InputField';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../styles/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    const success = await signIn(email, password);
    
    if (success) {
      router.replace('/(tabs)/relatorios');
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
          <Text style={styles.title}>Bem-vindo de volta!</Text>
          <Text style={styles.subtitle2}>Faça login para continuar</Text>

          <InputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            style={styles.input}
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

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não tem uma conta? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Cadastre-se</Text>
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
  loginButton: {
    marginTop: 10,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: colors.gray,
    fontSize: 14,
  },
  registerLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});