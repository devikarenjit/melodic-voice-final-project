import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Mic, Music2, Pause, Play, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import "./SongLesson.css";

const genreTemplates = {
  "Nursery Rhymes": ["{name} sings a gentle tune", "{word} shines beneath the moon"],
  Lullaby: ["Sleep, {name}, the soft stars glow", "Say {word} nice and slow"],
  "Action Songs": ["Clap your hands and say {word}", "{name} sings so strong and proud"],
  "Learning Songs": ["We can learn and say {word}", "{name} sings it every day"],
  "Dance Songs": ["Move with the music, say {word}", "Dance along with {name} today"],
  "Animal Songs": ["The little animals say {word}", "Sing with {name} in the herd"],
  "Space Songs": ["Fly through space and say {word}", "{name} sings beyond the world"],
};

const genreMelodies = {
  "Nursery Rhymes": [261.63, 293.66, 329.63, 293.66, 261.63, 261.63, 293.66, 261.63],
  Lullaby: [392, 349.23, 329.63, 293.66, 261.63, 293.66, 329.63, 261.63],
  "Action Songs": [261.63, 329.63, 392, 523.25, 392, 329.63, 392, 523.25],
  "Learning Songs": [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23],
  "Dance Songs": [329.63, 392, 440, 392, 329.63, 392, 493.88, 440],
  "Animal Songs": [392, 440, 523.25, 440, 392, 349.23, 392, 329.63],
  "Space Songs": [220, 261.63, 329.63, 392, 493.88, 392, 329.63, 261.63],
};

function makeLyrics(name, genre, difficultWords) {
  const words = difficultWords.split(/[\s,]+/).filter(Boolean);
  const word = words[0] || "shine";
  const template = genreTemplates[genre] || genreTemplates["Learning Songs"];
  return template.map((line) => line.replace("{name}", name).replace("{word}", word));
}

export default function SongLesson() {
  const navigate = useNavigate();
  const { data, recordPractice } = useOnboarding();
  const [playing, setPlaying] = useState(false);
  const [listeningAwarded, setListeningAwarded] = useState(false);
  const [singing, setSinging] = useState(false);
  const [singResult, setSingResult] = useState("");
  const audioRef = useRef(null);
  const playbackTimerRef = useRef(null);
  const name = data.firstName || "friend";
  const lyrics = useMemo(() => makeLyrics(name, data.songGenre, data.difficultWords || ""), [name, data.songGenre, data.difficultWords]);
  const targetWords = lyrics.join(" ").toLowerCase().split(/[^a-z]+/).filter(Boolean);

  const stopSong = () => {
    audioRef.current?.close();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
    window.clearTimeout(playbackTimerRef.current);
    playbackTimerRef.current = null;
    setPlaying(false);
  };

  useEffect(() => () => stopSong(), []);

  const speakLyrics = () => {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis is not supported in this browser.");
    return;
  }

  // Stop anything already speaking.
  window.speechSynthesis.cancel();

  const voices = window.speechSynthesis.getVoices();

  // Prefer a friendly English voice when available.
  const preferredVoice =
    voices.find(
      (voice) =>
        voice.lang.startsWith("en") &&
        /female|samantha|aria|zira|google us english/i.test(voice.name)
    ) ||
    voices.find((voice) => voice.lang.startsWith("en")) ||
    voices[0];

  lyrics.forEach((line, index) => {
    const voiceLine = new SpeechSynthesisUtterance(line);

    if (preferredVoice) {
      voiceLine.voice = preferredVoice;
    }

    voiceLine.lang = preferredVoice?.lang || "en-US";
    voiceLine.rate = 0.82;
    voiceLine.pitch = data.songGenre === "Lullaby" ? 1.05 : 1.15;
    voiceLine.volume = 1;

    voiceLine.onstart = () => {
      if (index === 0) {
        setPlaying(true);
      }
    };

    voiceLine.onend = () => {
      if (index === lyrics.length - 1) {
        setPlaying(false);
      }
    };

    voiceLine.onerror = (event) => {
      console.error("Voice playback error:", event);
      setPlaying(false);
    };

    window.speechSynthesis.speak(voiceLine);
  });
};

  const playMusic = () => {
    if (playing) {
      stopSong();
      return;
    }
    speakLyrics();
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      setPlaying(true);
      playbackTimerRef.current = window.setTimeout(() => setPlaying(false), 5000);
      if (!listeningAwarded) {
        recordPractice("song", 10);
        setListeningAwarded(true);
      }
      return;
    }
    const context = new AudioContext();
    audioRef.current = context;
    const notes = genreMelodies[data.songGenre] || genreMelodies["Learning Songs"];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      gain.gain.setValueAtTime(0.0001, context.currentTime + index * 0.28);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + index * 0.28 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + index * 0.28 + 0.25);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + index * 0.28);
      oscillator.stop(context.currentTime + index * 0.28 + 0.26);
    });
    setPlaying(true);
    playbackTimerRef.current = window.setTimeout(() => { stopSong(); }, 5000);
    if (!listeningAwarded) {
      recordPractice("song", 10);
      setListeningAwarded(true);
    }
  };

  const startSinging = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      recordPractice("song", 25);
      setSingResult("Singing practice recorded. Speech scoring is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => { setSinging(true); setSingResult("Listening for your singing..."); };
    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript.toLowerCase();
      const matched = targetWords.filter((word) => spoken.includes(word)).length;
      const accuracy = Math.round((matched / targetWords.length) * 100);
      const points = Math.max(5, Math.round(50 * accuracy / 100));
      recordPractice("song", points);
      setSingResult(`${accuracy}% pronunciation match. You earned ${points} XP!`);
    };
    recognition.onerror = () => setSingResult("We could not hear that clearly. Try again.");
    recognition.onend = () => setSinging(false);
    recognition.start();
  };

  return (
    <main className="song-lesson">
      <button className="back-link" onClick={() => navigate("/")}><ArrowLeft size={17} /> Dashboard</button>
      <section className="song-card">
        <div className="song-heading"><span className="song-icon"><Music2 size={28} /></span><div><span className="song-label">{data.songGenre || "Learning Songs"}</span><h1>{name}&apos;s practice song</h1></div></div>
        <p className="song-intro">Your song includes the words you are learning to say.</p>
        <div className="lyrics" aria-label="Generated song lyrics">{lyrics.map((line) => <p key={line}>{line}</p>)}</div>
        <div className="song-controls"><button className="listen-button" onClick={playMusic}>{playing ? <Pause size={18} /> : <Play size={18} />}{playing ? "Stop song" : "Listen with lyrics"}<small>+10 XP</small></button><button className="sing-button" onClick={startSinging} disabled={singing}><Mic size={18} />{singing ? "Listening..." : "Sing the song"}<small>up to +50 XP</small></button></div>
        <p className="xp-note"><Volume2 size={15} /> The song plays music and speaks each generated lyric line. Listening earns a little XP; singing earns more based on pronunciation.</p>
        {singResult && <p className="sing-result" role="status">{singResult}</p>}
      </section>
    </main>
  );
}
