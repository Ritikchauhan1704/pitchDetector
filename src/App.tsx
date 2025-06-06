import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Music, Volume2 } from "lucide-react";

type NoteFrequencies = {
  [key: string]: number[];
};

type NoteInfo = {
  note: string;
  octave: number;
  accuracy: number;
};

const App = () => {
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

  const getPitch = useCallback((buffer: Float32Array, sampleRate: number): number => {
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
  }, []);

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
      const pitch = getPitch(dataArray, audioContextRef.current?.sampleRate || 0);

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

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

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

  const getNoteColor = (note: string): string => {
    const colors: { [key: string]: string } = {
      C: "text-blue-300",
      "C#": "text-blue-200",
      D: "text-blue-400",
      "D#": "text-blue-300",
      E: "text-blue-500",
      F: "text-blue-400",
      "F#": "text-blue-300",
      G: "text-blue-600",
      "G#": "text-blue-500",
      A: "text-blue-700",
      "A#": "text-blue-600",
      B: "text-blue-800",
    };
    return colors[note.replace(/\d/, "")] || "text-gray-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Music className="w-16 h-16 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Vocal Pitch Detector</h1>
            <p className="text-blue-200">Sing and see your notes in real-time</p>
          </div>

          <div className="text-center mb-8">
            <div className="bg-black/30 rounded-2xl p-8 mb-6">
              {currentNote ? (
                <div className="space-y-3">
                  <div className={`text-7xl font-bold ${getNoteColor(currentNote)} transition-all duration-300`}>
                    {currentNote}
                  </div>
                  <div className="text-blue-200 text-xl">{frequency} Hz</div>
                </div>
              ) : (
                <div className="text-5xl text-gray-400">
                  {isListening ? "🎵 🎶 🎵" : "---"}
                </div>
              )}
            </div>

            {currentNote && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-blue-200 mb-2">
                  <span>Accuracy</span>
                  <span>{accuracy}%</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-300 ${
                      accuracy > 80 ? "bg-blue-400" : accuracy > 60 ? "bg-blue-500" : "bg-blue-600"
                    }`}
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-center space-x-4">
              <Volume2 className="w-6 h-6 text-blue-300" />
              <div className="flex-1 bg-black/30 rounded-full h-3">
                <div
                  className="h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-200"
                  style={{ width: `${Math.min(100, volume)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                isListening
                  ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/50"
                  : "bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-400/50"
              }`}
            >
              {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
            <p className="text-blue-200 mt-4 text-lg">
              {isListening ? "Tap to stop" : "Tap to start"}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-blue-200 text-sm">
          <p>Sing clearly into your microphone for best results</p>
          <p className="mt-2 opacity-75">Works best with sustained notes</p>
        </div>
      </div>
    </div>
  );
};

export default App;
