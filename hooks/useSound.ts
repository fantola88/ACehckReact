// hooks/useSound.ts
import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';

export function useSound() {
  const successSoundRef = useRef<Audio.Sound | null>(null);
  const errorSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSounds = async () => {
      try {
        console.log('🎵 Carregando sons...');
        
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });

        const { sound: success } = await Audio.Sound.createAsync(
          require('../assets/sounds/success.mp3'),
          { volume: 1.0 }
        );
        
        const { sound: error } = await Audio.Sound.createAsync(
          require('../assets/sounds/error.mp3'),
          { volume: 1.0 }
        );

        if (isMounted) {
          successSoundRef.current = success;
          errorSoundRef.current = error;
          console.log('✅ Sons carregados');
        }
      } catch (error) {
        console.log('❌ Erro ao carregar sons:', error);
      }
    };

    loadSounds();

    return () => {
      isMounted = false;
      if (successSoundRef.current) {
        successSoundRef.current.unloadAsync();
      }
      if (errorSoundRef.current) {
        errorSoundRef.current.unloadAsync();
      }
    };
  }, []);

  const playSuccess = async () => {
    if (!successSoundRef.current) return;
    try {
      await successSoundRef.current.setPositionAsync(0);
      await successSoundRef.current.playAsync();
      console.log('✅ Som de sucesso tocado');
    } catch (error) {
      console.log('❌ Erro ao tocar som de sucesso:', error);
    }
  };

  const playError = async () => {
    if (!errorSoundRef.current) return;
    try {
      await errorSoundRef.current.setPositionAsync(0);
      await errorSoundRef.current.playAsync();
      console.log('✅ Som de erro tocado');
    } catch (error) {
      console.log('❌ Erro ao tocar som de erro:', error);
    }
  };

  return {
    playSuccessSound: playSuccess,
    playErrorSound: playError,
  };
}