// contexts/AuthContext.tsx
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { auth, db } from '../config/firebase';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, nome: string, cargo?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Criar e exportar o contexto
export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 Auth state changed:', user?.email || 'Nenhum usuário');
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: any) {
      let mensagem = 'Erro ao fazer login';
      switch (error.code) {
        case 'auth/user-not-found':
          mensagem = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          mensagem = 'Senha incorreta';
          break;
        case 'auth/invalid-email':
          mensagem = 'Email inválido';
          break;
        case 'auth/invalid-credential':
          mensagem = 'Email ou senha inválidos';
          break;
      }
      Alert.alert('Erro', mensagem);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome: string, cargo: string = 'Usuário'): Promise<boolean> => {
    try {
      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: nome
      });
      
      const inventarianteRef = doc(collection(db, 'inventariantes'));
      await setDoc(inventarianteRef, {
        nome: nome,
        email: email,
        cargo: cargo,
        uid: userCredential.user.uid,
        createdAt: Timestamp.now(),
      });
      
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      return true;
      
    } catch (error: any) {
      let mensagem = 'Erro ao criar conta';
      switch (error.code) {
        case 'auth/email-already-in-use':
          mensagem = 'Este email já está em uso';
          break;
        case 'auth/invalid-email':
          mensagem = 'Email inválido';
          break;
        case 'auth/weak-password':
          mensagem = 'A senha deve ter pelo menos 6 caracteres';
          break;
      }
      Alert.alert('Erro', mensagem);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};