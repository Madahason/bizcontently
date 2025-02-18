import { useState, useEffect } from "react";
import type { Voice, EmotionType } from "@/lib/ai/types";

interface VoiceCustomizerProps {
  text: string;
  onGenerate: (audioUrl: string) => void;
  onError: (error: string) => void;
}

export default function VoiceCustomizer({
  text,
  onGenerate,
  onError,
}: VoiceCustomizerProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [emotion, setEmotion] = useState<EmotionType>("neutral");
  const [emotionIntensity, setEmotionIntensity] = useState(50);
  const [wpm, setWpm] = useState(150);
  const [pauseDuration, setPauseDuration] = useState(0.5);
  const [pronunciationOverrides, setPronunciationOverrides] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(
    null
  );

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const response = await fetch("/api/elevenlabs/voices");

      if (!response.ok) {
        throw new Error(`Failed to load voices: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.voices) {
        setVoices(data.voices);
        if (data.voices.length > 0) setSelectedVoice(data.voices[0].voice_id);
      } else {
        throw new Error("No voices found in response");
      }
    } catch (error) {
      console.error("Failed to load voices:", error);
      onError(
        "Failed to load available voices. Please check your API key configuration."
      );
    }
  };

  const handlePronunciationAdd = () => {
    setPronunciationOverrides((prev) => ({
      ...prev,
      "": "", // Add empty entry for user to fill
    }));
  };

  const handlePronunciationUpdate = (
    word: string,
    pronunciation: string,
    oldWord?: string
  ) => {
    setPronunciationOverrides((prev) => {
      const updated = { ...prev };
      if (oldWord) delete updated[oldWord];
      updated[word] = pronunciation;
      return updated;
    });
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/narration/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voiceId: selectedVoice,
          emotion,
          emotionIntensity,
          wpm,
          pauseDuration,
          pronunciationOverrides,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate narration");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Clean up previous audio
      if (previewAudio) {
        URL.revokeObjectURL(previewAudio.src);
        previewAudio.remove();
      }

      // Create new audio element
      const audio = new Audio(url);
      setPreviewAudio(audio);
      onGenerate(url);
    } catch (error) {
      onError("Failed to generate narration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold">Voice Customization</h2>

      {/* Voice Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Voice</label>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {voices.map((voice) => (
            <option key={voice.voice_id} value={voice.voice_id}>
              {voice.name} -{" "}
              {voice.labels?.accent || voice.labels?.age || "Default"}
            </option>
          ))}
        </select>
        {selectedVoice && voices.length > 0 && (
          <div className="mt-2">
            <audio
              controls
              className="w-full"
              src={
                voices.find((v) => v.voice_id === selectedVoice)?.preview_url
              }
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>

      {/* Emotion Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Emotion
        </label>
        <select
          value={emotion}
          onChange={(e) => setEmotion(e.target.value as EmotionType)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="neutral">Neutral</option>
          <option value="enthusiastic">Enthusiastic</option>
          <option value="serious">Serious</option>
          <option value="sympathetic">Sympathetic</option>
        </select>
      </div>

      {/* Emotion Intensity */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Emotion Intensity: {emotionIntensity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={emotionIntensity}
          onChange={(e) => setEmotionIntensity(Number(e.target.value))}
          className="mt-1 block w-full"
        />
      </div>

      {/* Speaking Rate */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Speaking Rate: {wpm} WPM
        </label>
        <input
          type="range"
          min="100"
          max="200"
          value={wpm}
          onChange={(e) => setWpm(Number(e.target.value))}
          className="mt-1 block w-full"
        />
      </div>

      {/* Pause Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Pause Duration: {pauseDuration}s
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={pauseDuration}
          onChange={(e) => setPauseDuration(Number(e.target.value))}
          className="mt-1 block w-full"
        />
      </div>

      {/* Pronunciation Overrides */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Pronunciation Overrides
          </label>
          <button
            onClick={handlePronunciationAdd}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Add Word
          </button>
        </div>
        <div className="space-y-2">
          {Object.entries(pronunciationOverrides).map(
            ([word, pronunciation], index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={word}
                  onChange={(e) =>
                    handlePronunciationUpdate(
                      e.target.value,
                      pronunciation,
                      word
                    )
                  }
                  placeholder="Word"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={pronunciation}
                  onChange={(e) =>
                    handlePronunciationUpdate(word, e.target.value)
                  }
                  placeholder="IPA Pronunciation"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    setPronunciationOverrides((prev) => {
                      const updated = { ...prev };
                      delete updated[word];
                      return updated;
                    });
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? "Generating..." : "Generate Narration"}
      </button>

      {/* Preview Player */}
      {previewAudio && (
        <div className="mt-4">
          <audio controls className="w-full">
            <source src={previewAudio.src} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}
