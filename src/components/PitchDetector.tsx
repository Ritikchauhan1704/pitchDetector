import { Mic, MicOff, Music, Volume2 } from "lucide-react";
import usePitchDetector from "../hooks/usePitchDetector";

const PitchDetector = () => {
  const {
    isListening,
    currentNote,
    frequency,
    accuracy,
    volume,
    startListening,
    stopListening,
  } = usePitchDetector();

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
            <h1 className="text-4xl font-bold text-white mb-2">
              Vocal Pitch Detector
            </h1>
            <p className="text-blue-200">
              Sing and see your notes in real-time
            </p>
          </div>

          <div className="text-center mb-8">
            <div className="bg-black/30 rounded-2xl p-8 mb-6">
              {currentNote ? (
                <div className="space-y-3">
                  <div
                    className={`text-7xl font-bold ${getNoteColor(
                      currentNote
                    )} transition-all duration-300`}
                  >
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
                      accuracy > 80
                        ? "bg-blue-400"
                        : accuracy > 60
                        ? "bg-blue-500"
                        : "bg-blue-600"
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
            <div className="flex justify-center">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                  isListening
                    ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/50"
                    : "bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-400/50"
                }`}
              >
                {isListening ? (
                  <MicOff className="w-10 h-10" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </button>
            </div>
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

export default PitchDetector;
