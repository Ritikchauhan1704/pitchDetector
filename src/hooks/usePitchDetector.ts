import { useState, useRef, useCallback, useEffect } from "react";
import type { NoteFrequencies, NoteInfo } from "../types/types";

const usePitchDetector = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [currentNote, setCurrentNote] = useState<string>("");
  const [frequency, setFrequency] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);

  const noteFrequencies: NoteFrequencies = {
    C: [65.41, 130.81, 261.63, 523.25, 1046.5],
    "C#": [69.3, 138.59, 277.18, 554.37, 1108.73],
    D: [73.42, 146.83, 293.66, 587.33, 1174.66],
    "D#": [77.78, 155.56, 311.13, 622.25, 1244.51],
    E: [82.41, 164.81, 329.63, 659.25, 1318.51],
    F: [87.31, 174.61, 349.23, 698.46, 1396.91],
    "F#": [92.5, 185.0, 369.99, 739.99, 1479.98],
    G: [98.0, 196.0, 392.0, 783.99, 1567.98],
    "G#": [103.83, 207.65, 415.3, 830.61, 1661.22],
    A: [110.0, 220.0, 440.0, 880.0, 1760.0],
    "A#": [116.54, 233.08, 466.16, 932.33, 1864.66],
    B: [123.47, 246.94, 493.88, 987.77, 1975.53],
  };

  const getClosestNote = (freq: number): NoteInfo => {
    let closestNote = "";
    let closestDistance = Infinity;
    let octave = 0;
    let accuracyPercent = 0;

    for (const [note, frequencies] of Object.entries(noteFrequencies)) {
      frequencies.forEach((noteFreq, index) => {
        const distance = Math.abs(freq - noteFreq);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestNote = note;
          octave = index + 2;
          const maxDistance = noteFreq * 0.1;
          accuracyPercent = Math.max(0, 100 - (distance / maxDistance) * 100);
        }
      });
    }

    return { note: closestNote, octave, accuracy: Math.round(accuracyPercent) };
  };

  const getPitch = useCallback(
    (buffer: Float32Array, sampleRate: number): number => {
      const threshold = 0.2;
      const minPeriod = Math.floor(sampleRate / 1000);
      const maxPeriod = Math.floor(sampleRate / 80);

      let bestCorrelation = 0;
      let bestPeriod = 0;

      for (let period = minPeriod; period < maxPeriod; period++) {
        let correlation = 0;

        for (let i = 0; i < buffer.length - period; i++) {
          correlation += buffer[i] * buffer[i + period];
        }

        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestPeriod = period;
        }
      }

      if (bestCorrelation > threshold) {
        return sampleRate / bestPeriod;
      }
      return 0;
    },
    []
  );

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const volumePercent = Math.min(100, rms * 1000);
    setVolume(volumePercent);

    if (volumePercent > 5) {
      const pitch = getPitch(
        dataArray,
        audioContextRef.current?.sampleRate || 0
      );

      if (pitch > 80 && pitch < 1000) {
        const { note, octave, accuracy } = getClosestNote(pitch);
        setCurrentNote(`${note}${octave}`);
        setFrequency(Math.round(pitch * 10) / 10);
        setAccuracy(accuracy);
      }
    } else {
      setCurrentNote("");
      setFrequency(0);
      setAccuracy(0);
    }

    animationRef.current = requestAnimationFrame(analyzeAudio);
  }, [getPitch]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 4096;
      analyserRef.current.smoothingTimeConstant = 0.8;

      microphoneRef.current.connect(analyserRef.current);

      setIsListening(true);
      analyzeAudio();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Please allow microphone access to use the pitch detector.");
    }
  };

  const stopListening = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsListening(false);
    setCurrentNote("");
    setFrequency(0);
    setAccuracy(0);
    setVolume(0);
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return {
    isListening,
    currentNote,
    frequency,
    accuracy,
    volume,
    startListening,
    stopListening,
  };
};

export default usePitchDetector;
