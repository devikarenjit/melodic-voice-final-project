import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  Mic,
  Sparkles,
  Star,
  Volume2,
} from "lucide-react";
import "./SpeechAssessment.css";

const SOUND_WORDS = {
  r: ["rabbit", "rainbow", "rocket", "roar", "river"],
  s: ["sun", "snake", "snow", "star", "sock"],
  l: ["lion", "leaf", "lamp", "lake", "light"],
  sh: ["ship", "shell", "shoe", "shark", "shine"],
  ch: ["chair", "cheese", "chicken", "cherry", "chocolate"],
  th: ["three", "thumb", "thunder", "think", "three"],
  k: ["cat", "cake", "kite", "cookie", "king"],
  g: ["goat", "garden", "green", "globe", "guitar"],
  f: ["fish", "flower", "fox", "fun", "frog"],
  b: ["ball", "baby", "banana", "boat", "blue"],
  p: ["pig", "pizza", "panda", "purple", "pencil"],
  m: ["moon", "monkey", "music", "milk", "mouse"],
  default: ["rabbit", "rainbow", "rocket", "river", "roar"],
};

const SOUND_LABELS = {
  r: "/r/",
  s: "/s/",
  l: "/l/",
  sh: "/sh/",
  ch: "/ch/",
  th: "/th/",
  k: "/k/",
  g: "/g/",
  f: "/f/",
  b: "/b/",
  p: "/p/",
  m: "/m/",
};

function getStoredChild() {
  try {
    const onboarding = JSON.parse(
      localStorage.getItem("melodicVoiceOnboarding") || "{}"
    );

    return (
      onboarding?.childName ||
      onboarding?.name ||
      localStorage.getItem("childName") ||
      "Little Learner"
    );
  } catch {
    return "Little Learner";
  }
}

function getStoredSound() {
  try {
    const onboarding = JSON.parse(
      localStorage.getItem("melodicVoiceOnboarding") || "{}"
    );

    const value =
      onboarding?.practiceSound ||
      onboarding?.speechSound ||
      onboarding?.targetSound ||
      onboarding?.sound ||
      localStorage.getItem("practiceSound") ||
      "r";

    return String(value).toLowerCase().replace(/\//g, "").trim();
  } catch {
    return "r";
  }
}

export default function SpeechAssessment() {
  const navigate = useNavigate();

  const childName = getStoredChild();
  const storedSound = getStoredSound();

  const [selectedSound, setSelectedSound] = useState(storedSound);
  const [started, setStarted] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [results, setResults] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState(
    "Let's warm up your speaking superpower!"
  );

  const words = useMemo(() => {
    return SOUND_WORDS[selectedSound] || SOUND_WORDS.default;
  }, [selectedSound]);

  const soundLabel = SOUND_LABELS[selectedSound] || `/${selectedSound}/`;

  const currentWord = words[currentWordIndex];

  const totalXP = Object.values(results).reduce(
    (total, result) => total + result.xp,
    0
  );

  const correctCount = Object.values(results).filter(
    (result) => result.correct
  ).length;

  const handleSelectSound = (sound) => {
    setSelectedSound(sound);
    setStarted(false);
    setCurrentWordIndex(0);
    setResults({});
    setMessage("Great choice! Let's practise this sound.");
  };

  const speakWord = () => {
    if (!("speechSynthesis" in window)) {
      setMessage(`Say "${currentWord}" out loud when you're ready!`);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.rate = 0.75;
    utterance.pitch = 1.15;

    window.speechSynthesis.speak(utterance);
  };

  const practiceWord = () => {
    if (isListening) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const fallbackResult = {
        correct: true,
        xp: 25,
      };

      setResults((previous) => ({
        ...previous,
        [currentWord]: fallbackResult,
      }));

      setMessage(`Amazing! You practised "${currentWord}" 🎉`);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setMessage(`I'm listening... say "${currentWord}"!`);

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript
        .toLowerCase()
        .replace(/[.,!?]/g, "")
        .trim();

      const target = currentWord.toLowerCase();

      const correct =
        spoken === target ||
        spoken.includes(target) ||
        target.includes(spoken);

      const xp = correct ? 25 : 10;

      setResults((previous) => ({
        ...previous,
        [currentWord]: {
          correct,
          xp,
          spoken,
        },
      }));

      if (correct) {
        setMessage(`Fantastic! You said "${currentWord}" correctly! ⭐ +25 XP`);
      } else {
        setMessage(
          `Nice try! You said "${spoken || "something"}". Keep practising! 💪 +10 XP`
        );
      }

      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);

      setMessage(
        `That's okay! Try saying "${currentWord}" again when you're ready.`
      );
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const nextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((index) => index + 1);
      setMessage("Ready for the next word? 🌟");
    } else {
      setMessage("You practised all your words! Amazing job! 🎉");
    }
  };

  const finishAssessment = () => {
    const speechProfile = {
      sound: selectedSound,
      soundLabel,
      practiceWords: words,
      completedWords: Object.keys(results),
      correctWords: Object.entries(results)
        .filter(([, result]) => result.correct)
        .map(([word]) => word),
      xp: totalXP,
      completedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "melodicVoiceSpeechProfile",
      JSON.stringify(speechProfile)
    );

    navigate("/dashboard");
  };

  return (
    <div className="speech-page">
      <header className="speech-header">
        <Link to="/" className="speech-logo" aria-label="Go to Melodic Voice home">
          <span className="speech-logo-icon">🎵</span>
          <span>Melodic Voice</span>
        </Link>

        <Link to="/dashboard" className="home-button">
          <Home size={17} />
          <span>Home</span>
        </Link>
      </header>

      <main className="speech-main">
        <div className="speech-breadcrumb">
          <Link to="/dashboard">
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </div>

        <section className="speech-hero">
          <div className="hero-sparkle sparkle-one">✦</div>
          <div className="hero-sparkle sparkle-two">✧</div>

          <div className="hero-icon">
            <Mic size={34} strokeWidth={2.4} />
          </div>

          <div className="hero-badge">
            <Sparkles size={15} />
            SPEECH PRACTICE
          </div>

          <h1>
            Let's discover your
            <span> speaking superpower!</span>
          </h1>

          <p>
            Hi {childName}! We'll practise a few fun words together.
            There are no wrong answers — every try makes you stronger.
          </p>

          <div className="hero-stars">
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
          </div>
        </section>

        <section className="speech-card target-card">
          <div className="section-heading">
            <div className="section-icon purple">
              <Sparkles size={22} />
            </div>

            <div>
              <span className="small-label">STEP 1</span>
              <h2>Choose your practice sound</h2>
              <p>Pick the sound you want to practise today.</p>
            </div>
          </div>

          <div className="sound-grid">
            {Object.keys(SOUND_LABELS).map((sound) => (
              <button
                key={sound}
                type="button"
                className={`sound-option ${
                  selectedSound === sound ? "selected" : ""
                }`}
                onClick={() => handleSelectSound(sound)}
              >
                <span>{SOUND_LABELS[sound]}</span>
                {selectedSound === sound && (
                  <Check className="sound-check" size={18} />
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="speech-card practice-card">
          <div className="section-heading">
            <div className="section-icon orange">
              <Mic size={22} />
            </div>

            <div>
              <span className="small-label">STEP 2</span>
              <h2>Try some words</h2>
              <p>
                Listen first, then say each word. You earn XP for every try!
              </p>
            </div>
          </div>

          {!started ? (
            <div className="start-area">
              <div className="target-bubble">
                <span>Today's sound</span>
                <strong>{soundLabel}</strong>
              </div>

              <div className="character-face">🧒🎤</div>

              <h3>Ready to practise?</h3>

              <p>
                We'll try words like{" "}
                <strong>{words.slice(0, 3).join(", ")}</strong>.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setStarted(true);
                  setMessage(`Let's practise "${currentWord}"!`);
                }}
              >
                <Mic size={20} />
                Start Speaking
                <ArrowRight size={19} />
              </button>
            </div>
          ) : (
            <div className="word-practice-area">
              <div className="progress-row">
                <div>
                  <strong>Word {currentWordIndex + 1}</strong>
                  <span> of {words.length}</span>
                </div>

                <div className="xp-counter">
                  <Star size={16} fill="currentColor" />
                  {totalXP} XP
                </div>
              </div>

              <div className="word-progress">
                {words.map((word, index) => (
                  <div
                    key={word}
                    className={`progress-dot ${
                      index <= currentWordIndex ? "active" : ""
                    } ${results[word] ? "completed" : ""}`}
                  />
                ))}
              </div>

              <div className="word-stage">
                <div className="word-number">
                  {currentWordIndex + 1}
                </div>

                <div className="word-emoji">
                  {["🐰", "🌈", "🚀", "🦁", "🌊"][currentWordIndex]}
                </div>

                <h3>{currentWord}</h3>

                <div className="word-sound">
                  Practising {soundLabel}
                </div>

                <div className="word-actions">
                  <button
                    type="button"
                    className="hear-button"
                    onClick={speakWord}
                  >
                    <Volume2 size={20} />
                    Hear Word
                  </button>

                  <button
                    type="button"
                    className={`say-button ${
                      isListening ? "listening" : ""
                    }`}
                    onClick={practiceWord}
                    disabled={isListening}
                  >
                    <Mic size={20} />
                    {isListening ? "Listening..." : "Say It"}
                  </button>
                </div>

                {results[currentWord] && (
                  <div
                    className={`word-result ${
                      results[currentWord].correct ? "correct" : "try-again"
                    }`}
                  >
                    {results[currentWord].correct ? (
                      <>
                        <span className="result-icon">🎉</span>
                        <div>
                          <strong>Great speaking!</strong>
                          <span>Correct word bonus +15 XP</span>
                        </div>
                        <b>+25 XP</b>
                      </>
                    ) : (
                      <>
                        <span className="result-icon">💪</span>
                        <div>
                          <strong>Nice try!</strong>
                          <span>Keep practising — you earned XP!</span>
                        </div>
                        <b>+10 XP</b>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="practice-message">{message}</div>

              <div className="practice-navigation">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={currentWordIndex === 0}
                  onClick={() =>
                    setCurrentWordIndex((index) => Math.max(0, index - 1))
                  }
                >
                  <ArrowLeft size={18} />
                  Previous
                </button>

                {currentWordIndex < words.length - 1 ? (
                  <button
                    type="button"
                    className="primary-button small"
                    onClick={nextWord}
                  >
                    Next Word
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="primary-button small"
                    onClick={finishAssessment}
                  >
                    Finish Practice
                    <Check size={18} />
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="speech-card ai-card">
          <div className="ai-icon">✨</div>

          <div>
            <span className="small-label">WHAT HAPPENS NEXT?</span>
            <h2>Your practice powers Melodic Voice</h2>

            <p>
              Your practice sound and words can be used to create personalised
              <strong> AI Stories</strong> and <strong> AI Songs</strong>.
              The words will appear naturally in activities made for you.
            </p>

            <div className="ai-flow">
              <div>
                <span>🎤</span>
                <b>Your sound</b>
              </div>

              <ArrowRight size={18} />

              <div>
                <span>✨</span>
                <b>AI creates</b>
              </div>

              <ArrowRight size={18} />

              <div>
                <span>🎵</span>
                <b>Have fun!</b>
              </div>
            </div>
          </div>
        </section>

        <section className="parent-note">
          <span>👨‍👩‍👧</span>
          <div>
            <strong>For parents</strong>
            <p>
              This activity is designed for encouraging speech practice. It is
              not a clinical diagnosis or medical assessment.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}