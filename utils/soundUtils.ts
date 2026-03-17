// utils/soundUtils.ts
import { Audio } from 'expo-av';

// Variáveis globais para manter as referências dos sons
let successSound: Audio.Sound | null = null;
let errorSound: Audio.Sound | null = null;
let soundsLoaded = false;
let loadingPromise: Promise<void> | null = null;

// Função para carregar os sons (executada uma única vez)
const loadSounds = async () => {
  if (soundsLoaded) return;
  
  // Se já estiver carregando, aguarda a promise existente
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      console.log('🎵 Carregando sons...');
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });

      // Tenta carregar os sons
      try {
        const { sound: success } = await Audio.Sound.createAsync(
          require('../assets/sounds/success.mp3'),
          { volume: 1.0 }
        );
        successSound = success;
      } catch (error) {
        console.log('⚠️ Arquivo success.mp3 não encontrado, criando som alternativo');
        successSound = null;
      }

      try {
        const { sound: error } = await Audio.Sound.createAsync(
          require('../assets/sounds/error.mp3'),
          { volume: 1.0 }
        );
        errorSound = error;
      } catch (error) {
        console.log('⚠️ Arquivo error.mp3 não encontrado, criando som alternativo');
        errorSound = null;
      }

      soundsLoaded = true;
      console.log('✅ Sons processados');
    } catch (error) {
      console.log('❌ Erro ao configurar áudio:', error);
      soundsLoaded = false;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
};

// Função para criar um beep simples via Web Audio API (fallback)
const playBeep = (type: 'success' | 'error') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'success') {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    } else {
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  } catch (error) {
    console.log('⚠️ Não foi possível criar beep:', error);
  }
};

// Função para tocar som de sucesso
export const playSuccessSound = async () => {
  try {
    await loadSounds();
    
    if (successSound) {
      await successSound.setPositionAsync(0);
      await successSound.playAsync();
      console.log('✅ Som de sucesso tocado');
    } else {
      // Fallback: beep via Web Audio API
      playBeep('success');
    }
  } catch (error) {
    console.log('❌ Erro ao tocar som de sucesso:', error);
    // Fallback em caso de erro
    playBeep('success');
  }
};

// Função para tocar som de erro
export const playErrorSound = async () => {
  try {
    await loadSounds();
    
    if (errorSound) {
      await errorSound.setPositionAsync(0);
      await errorSound.playAsync();
      console.log('✅ Som de erro tocado');
    } else {
      // Fallback: beep via Web Audio API
      playBeep('error');
    }
  } catch (error) {
    console.log('❌ Erro ao tocar som de erro:', error);
    // Fallback em caso de erro
    playBeep('error');
  }
};

// Função para limpar recursos (opcional)
export const cleanupSounds = async () => {
  try {
    if (successSound) {
      await successSound.unloadAsync();
      successSound = null;
    }
    if (errorSound) {
      await errorSound.unloadAsync();
      errorSound = null;
    }
    soundsLoaded = false;
    console.log('✅ Sons limpos');
  } catch (error) {
    console.log('❌ Erro ao limpar sons:', error);
  }
};