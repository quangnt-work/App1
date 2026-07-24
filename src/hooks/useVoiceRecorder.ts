'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { RecordingResult } from '@/lib/types/database';

export function useVoiceRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<RecordingResult | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recording?.url) {
        URL.revokeObjectURL(recording.url);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recording]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Determine best supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const duration = Date.now() - startTimeRef.current;
        setRecording({ blob, url, duration });

        // Release microphone
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      startTimeRef.current = Date.now();
      setRecordingDuration(0);

      // Update duration counter
      timerRef.current = setInterval(() => {
        setRecordingDuration(Date.now() - startTimeRef.current);
      }, 100);

      mediaRecorder.start(250); // Collect data every 250ms
      setIsRecording(true);
      setPermissionDenied(false);
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setPermissionDenied(true);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const clearRecording = useCallback(() => {
    if (recording?.url) {
      URL.revokeObjectURL(recording.url);
    }
    setRecording(null);
    setRecordingDuration(0);
  }, [recording]);

  return {
    isRecording,
    recording,
    recordingDuration,
    permissionDenied,
    startRecording,
    stopRecording,
    clearRecording,
  };
}
