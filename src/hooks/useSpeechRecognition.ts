'use client';

import { useRef, useState, useCallback } from 'react';
import type { SpeechResult } from '@/lib/types/database';

// Extend Window for webkit prefix
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function useSpeechRecognition(lang: string = 'ru-RU') {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<SpeechResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  });

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError(
        'Trình duyệt không hỗ trợ nhận diện giọng nói. Hãy dùng Google Chrome.'
      );
      return;
    }

    // Clean up previous instance
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const speechResult = event.results[0][0];
      setResult({
        transcript: speechResult.transcript,
        confidence: speechResult.confidence,
      });
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let message = 'Lỗi nhận diện giọng nói';
      switch (event.error) {
        case 'no-speech':
          message = 'Không nghe thấy giọng nói. Hãy thử lại.';
          break;
        case 'audio-capture':
          message = 'Không tìm thấy microphone. Hãy kiểm tra thiết bị.';
          break;
        case 'not-allowed':
          message = 'Quyền truy cập microphone bị từ chối.';
          break;
        case 'network':
          message = 'Lỗi mạng. Hãy kiểm tra kết nối internet.';
          break;
        default:
          message = `Lỗi: ${event.error}`;
      }
      setError(message);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setResult(null);
    setError(null);

    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      setError('Không thể bắt đầu nhận diện giọng nói.');
      setIsListening(false);
    }
  }, [lang, isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isListening,
    result,
    error,
    isSupported,
    startListening,
    stopListening,
    reset,
  };
}
