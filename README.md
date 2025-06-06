# Vocal Pitch Detector

A real-time vocal pitch detection application built with React and TypeScript. This app analyzes audio input from your microphone and displays the detected musical note, frequency, and accuracy in a beautiful, responsive interface.

## How It Works

The application uses the Web Audio API to:
1. Capture audio from your microphone
2. Analyze the audio signal using autocorrelation for pitch detection
3. Compare detected frequencies against a database of musical note frequencies
4. Display the closest matching note with accuracy percentage

## Supported Notes

The app detects notes across 5 octaves (C2-B6):
- All 12 chromatic notes: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
- Frequency range: ~65Hz to ~1976Hz

## Usage

1. **Grant Microphone Permission**: When you first click "Tap to start", your browser will request microphone access
2. **Start Detection**: Click the microphone button to begin pitch detection
3. **Sing or Play**: Sing a note or play an instrument near your microphone
4. **View Results**: The app will display:
   - The detected note name and octave
   - Frequency in Hz
   - Accuracy percentage (how close you are to perfect pitch)
   - Real-time volume level

## Technical Details

### Pitch Detection Algorithm

The app uses **autocorrelation** for pitch detection:
- Analyzes the audio signal in the time domain
- Finds repeating patterns to determine fundamental frequency
- More accurate than FFT-based methods for monophonic sources

### Audio Settings

- **Sample Rate**: Uses device default (typically 44.1kHz)
- **Buffer Size**: 4096 samples for good frequency resolution
- **Smoothing**: 0.8 for stable readings
- **Audio Constraints**: Disables echo cancellation, noise suppression, and auto gain control for raw audio

### Performance Optimizations

- Uses `requestAnimationFrame` for smooth 60fps updates
- Efficient Float32Array processing
- Optimized autocorrelation algorithm with reasonable period limits

## Tips for Best Results

- **Sing clearly**: Sustained, clear notes work best
- **Avoid background noise**: Use in a quiet environment
- **Proper distance**: Position yourself 6-12 inches from the microphone
- **Single notes**: The app works best with monophonic (single note) input
- **Sufficient volume**: Ensure your voice is loud enough to register


## Getting Started


### Installation

1. Clone the repository:
```bash
git clone [<repository-url>](https://github.com/Ritikchauhan1704/pitchDetector.git)
cd pitchDetector
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Start the development server:
```bash
npm dev
# or
bun dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Dependencies

- **React** (^18.0.0): UI framework
- **TypeScript**: Type safety and better development experience
- **Lucide React**: Beautiful, customizable icons
- **Tailwind CSS**: Utility-first CSS framework for styling
