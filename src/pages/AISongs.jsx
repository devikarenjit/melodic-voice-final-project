import { useEffect, useMemo, useRef, useState } from "react";
import { useOnboarding } from "../context/OnboardingContext";
import { useProgress } from "../context/ProgressContext";
import "./AISongs.css";

/*
  Melodic Voice - AI Songs MVP

  The MVP:
  - Reads the child's difficult sound/word from onboarding.
  - Selects age-appropriate practice words.
  - Creates personalized lyrics.
  - Creates a simple melody in the browser.
  - Speaks the lyrics aloud so young children do not need to read.
*/

const SOUND_WORD_BANK = {
  s: [
    "snake",
    "snail",
    "sun",
    "song",
    "star",
    "school",
    "sock",
    "bus",
    "house",
    "pass",
    "music",
    "dinosaur",
  ],

  z: [
    "zebra",
    "zoo",
    "zip",
    "buzz",
    "lazy",
    "music",
  ],

  m: [
    "moon",
    "monkey",
    "music",
    "mommy",
    "mouse",
    "milk",
    "smile",
    "home",
  ],

  b: [
    "baby",
    "ball",
    "bird",
    "banana",
    "bubble",
    "book",
    "bus",
  ],

  p: [
    "puppy",
    "pizza",
    "panda",
    "pig",
    "pop",
    "happy",
    "hop",
  ],

  t: [
    "tiger",
    "toy",
    "train",
    "tree",
    "top",
    "little",
    "cat",
  ],

  d: [
    "dog",
    "dinosaur",
    "duck",
    "drum",
    "dance",
    "bed",
    "bird",
  ],

  k: [
    "cat",
    "car",
    "cookie",
    "kite",
    "king",
    "duck",
    "book",
  ],

  g: [
    "go",
    "garden",
    "goat",
    "green",
    "giggle",
    "dog",
    "frog",
  ],

  f: [
    "fish",
    "fox",
    "flower",
    "frog",
    "fun",
    "coffee",
    "leaf",
  ],

  l: [
    "lion",
    "ladybug",
    "little",
    "love",
    "look",
    "ball",
    "school",
  ],

  r: [
    "rabbit",
    "rainbow",
    "rocket",
    "robot",
    "rain",
    "car",
    "star",
  ],

  sh: [
    "ship",
    "shell",
    "shark",
    "sheep",
    "shine",
    "fish",
    "brush",
  ],

  ch: [
    "chair",
    "cheese",
    "chicken",
    "cherry",
    "chocolate",
    "beach",
    "lunch",
  ],

  th: [
    "three",
    "thumb",
    "think",
    "thunder",
    "this",
    "bath",
    "mouth",
  ],
};

const LETTER_WORD_BANK = {
  a: ["apple", "ant", "animal", "astronaut", "apple"],
  b: ["ball", "baby", "bird", "banana", "bear"],
  c: ["cat", "car", "cookie", "cake", "cloud"],
  d: ["dog", "duck", "dinosaur", "dance", "drum"],
  e: ["elephant", "egg", "ear", "eagle", "excited"],
  f: ["fish", "fox", "frog", "flower", "fun"],
  g: ["goat", "garden", "gift", "giraffe", "green"],
  h: ["hat", "horse", "house", "happy", "hop"],
  i: ["ice", "igloo", "insect", "island", "inside"],
  j: ["jam", "jelly", "jump", "jungle", "jolly"],
  k: ["kite", "king", "kangaroo", "kitten", "key"],
  l: ["lion", "ladybug", "leaf", "little", "love"],
  m: ["moon", "monkey", "mouse", "music", "moon"],
  n: ["nose", "nest", "night", "noodle", "nice"],
  o: ["octopus", "orange", "ocean", "owl", "open"],
  p: ["puppy", "panda", "pizza", "pig", "play"],
  q: ["queen", "quiet", "quick", "quilt"],
  r: ["rabbit", "rainbow", "rocket", "robot", "rain"],
  s: ["snake", "snail", "sun", "song", "star"],
  t: ["tiger", "train", "tree", "toy", "turtle"],
  u: ["umbrella", "under", "up", "unicorn"],
  v: ["van", "violin", "violet", "very"],
  w: ["whale", "water", "window", "wonder", "wave"],
  x: ["fox", "box", "six", "mix"],
  y: ["yellow", "yo-yo", "yummy", "yarn"],
  z: ["zebra", "zoo", "zip", "buzz"],
};

const GENRE_STYLES = {
  "Nursery Rhymes": {
    bpm: 92,
    wave: "sine",
    mood: "gentle",
  },

  Lullaby: {
    bpm: 68,
    wave: "sine",
    mood: "calm",
  },

  "Action Songs": {
    bpm: 118,
    wave: "triangle",
    mood: "energetic",
  },

  "Learning Songs": {
    bpm: 100,
    wave: "sine",
    mood: "bright",
  },

  "Dance Songs": {
    bpm: 112,
    wave: "triangle",
    mood: "playful",
  },

  "Animal Songs": {
    bpm: 105,
    wave: "square",
    mood: "playful",
  },

  "Space Songs": {
    bpm: 88,
    wave: "sine",
    mood: "magical",
  },
};

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getFirstValue(value) {
  if (!value) return "";

  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return String(value)
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)[0] || "";
}

/*
  Find the main speech challenge.
*/
function getPracticeChallenge(data) {
  const difficultSounds = Array.isArray(data?.difficultSounds)
    ? data.difficultSounds
    : [];

  const firstSound = difficultSounds.find(Boolean);

  if (firstSound) {
    return normalize(firstSound);
  }

  const difficultWord = getFirstValue(data?.difficultWords);

  if (difficultWord) {
    return difficultWord;
  }

  return "s";
}

/*
  Select practice words based on the child's challenge.
*/
function getPracticeWords(challenge) {
  const normalizedChallenge = normalize(challenge);

  // Exact sound match.
  if (SOUND_WORD_BANK[normalizedChallenge]) {
    return SOUND_WORD_BANK[normalizedChallenge];
  }

  // Exact letter match.
  if (
    normalizedChallenge.length === 1 &&
    LETTER_WORD_BANK[normalizedChallenge]
  ) {
    return LETTER_WORD_BANK[normalizedChallenge];
  }

  // If the challenge is a word, find words containing its first letter.
  const firstLetter = normalizedChallenge.charAt(0);

  if (LETTER_WORD_BANK[firstLetter]) {
    return LETTER_WORD_BANK[firstLetter];
  }

  return SOUND_WORD_BANK.s;
}

/*
  Pick a small group of words for the song.
*/
function selectWords(words) {
  const uniqueWords = [...new Set(words)];

  return uniqueWords.slice(0, 6);
}

/*
  Create lyrics according to the selected genre.
*/
function createLyrics({
  challenge,
  words,
  genre,
  childName,
}) {
  const name = childName || "friend";

  const word1 = words[0] || challenge;
  const word2 = words[1] || word1;
  const word3 = words[2] || word1;
  const word4 = words[3] || word2;

  if (genre === "Lullaby") {
    return [
      `Goodnight ${word1}, soft and slow`,
      `${name}, close your eyes and let dreams grow`,
      `${word2} and ${word3}, shining bright`,
      `Sing your special sounds tonight`,
    ];
  }

  if (genre === "Animal Songs") {
    return [
      `A little ${word1} comes to play`,
      `A little ${word2} sings today`,
      `${word3} and ${word4}, sing along`,
      `${name} is singing a happy song`,
    ];
  }

  if (genre === "Action Songs") {
    return [
      `${word1}, ${word1}, jump up high`,
      `${word2}, ${word2}, touch the sky`,
      `Clap for ${word3}, stomp for ${word4}`,
      `Sing with ${name} once more!`,
    ];
  }

  if (genre === "Dance Songs") {
    return [
      `${word1}, ${word2}, dance with me`,
      `${word3}, ${word4}, one, two, three`,
      `Turn around and sing along`,
      `${name} is dancing to the song`,
    ];
  }

  if (genre === "Space Songs") {
    return [
      `${word1} is flying like a star`,
      `${word2} is travelling very far`,
      `${word3} is shining in the night`,
      `${name} sings and takes flight`,
    ];
  }

  if (genre === "Nursery Rhymes") {
    return [
      `${word1}, ${word1}, sing with me`,
      `${word2} sounds happy as can be`,
      `${word3}, ${word4}, here we go`,
      `${name} sings them nice and slow`,
    ];
  }

  // Learning Songs
  return [
    `${word1}, ${word1}, sing with me`,
    `${word2}, ${word2}, one, two, three`,
    `${word3}, ${word4}, say them strong`,
    `${name} is learning through a song`,
  ];
}

/*
  Create a simple melody.
*/
function createNoteSequence(genre) {
  const baseNotes = {
    "Nursery Rhymes": [
      261.63,
      293.66,
      329.63,
      392.0,
      329.63,
      293.66,
      261.63,
      261.63,
    ],

    Lullaby: [
      261.63,
      329.63,
      392.0,
      329.63,
      293.66,
      261.63,
      293.66,
      261.63,
    ],

    "Action Songs": [
      261.63,
      329.63,
      392.0,
      523.25,
      392.0,
      329.63,
      392.0,
      523.25,
    ],

    "Learning Songs": [
      261.63,
      293.66,
      329.63,
      392.0,
      329.63,
      293.66,
      261.63,
      329.63,
    ],

    "Dance Songs": [
      261.63,
      329.63,
      392.0,
      440.0,
      392.0,
      329.63,
      392.0,
      523.25,
    ],

    "Animal Songs": [
      261.63,
      329.63,
      392.0,
      329.63,
      261.63,
      293.66,
      329.63,
      392.0,
    ],

    "Space Songs": [
      220.0,
      261.63,
      293.66,
      329.63,
      392.0,
      329.63,
      293.66,
      261.63,
    ],
  };

  return baseNotes[genre] || baseNotes["Learning Songs"];
}

export default function AISongs() {
  const { data } = useOnboarding();
  const { listenToSong, singSong } = useProgress();

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [hasSung, setHasSung] = useState(false);

  const audioContextRef = useRef(null);
  const timersRef = useRef([]);

  const childName = data?.firstName || "friend";

  const genre = data?.songGenre || "Learning Songs";

  const challenge = useMemo(
    () => getPracticeChallenge(data),
    [data]
  );

  const practiceWords = useMemo(
    () => selectWords(getPracticeWords(challenge)),
    [challenge]
  );

  const style =
    GENRE_STYLES[genre] || GENRE_STYLES["Learning Songs"];

  const lyrics = useMemo(
    () =>
      createLyrics({
        challenge,
        words: practiceWords,
        genre,
        childName,
      }),
    [challenge, practiceWords, genre, childName]
  );

  /*
    Clean up audio when leaving the page.
  */
  useEffect(() => {
    return () => {
      stopSong();
    };
  }, []);

  function stopSong() {
    timersRef.current.forEach((timer) => {
      clearTimeout(timer);
    });

    timersRef.current = [];

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setIsPlaying(false);
  }

  function playNote(
    context,
    frequency,
    startTime,
    duration,
    wave
  ) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(
      frequency,
      startTime
    );

    gain.gain.setValueAtTime(0.0001, startTime);

    gain.gain.exponentialRampToValueAtTime(
      0.18,
      startTime + 0.03
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      startTime + duration
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.05);
  }

  /*
    Speak one line at a time.
    This is important because a 3-year-old may not be able
    to read the lyrics.
  */
  function speakLyrics(beat) {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    lyrics.forEach((line, index) => {
      const utterance =
        new SpeechSynthesisUtterance(line);

      if (genre === "Lullaby") {
        utterance.rate = 0.68;
      } else if (genre === "Action Songs") {
        utterance.rate = 0.95;
      } else if (genre === "Dance Songs") {
        utterance.rate = 0.9;
      } else {
        utterance.rate = 0.8;
      }

      utterance.pitch = 1.15;
      utterance.volume = 1;

      /*
        Each lyric line starts after four beats.
      */
      const delay = index * beat * 4 * 1000;

      const timer = setTimeout(() => {
        if (isPlaying) {
          window.speechSynthesis.speak(utterance);
        }
      }, delay);

      timersRef.current.push(timer);
    });
  }

  function playSong() {
    if (isPlaying) {
      stopSong();
      return;
    }

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    /*
      If Web Audio is unavailable, still speak the song.
    */
    if (!AudioContext) {
      speakLyricsOnly();
      return;
    }

    const context = new AudioContext();

    audioContextRef.current = context;

    if (context.state === "suspended") {
      context.resume();
    }

    setIsPlaying(true);

    const beat = 60 / style.bpm;

    const notes = createNoteSequence(genre);

    notes.forEach((frequency, index) => {
      playNote(
        context,
        frequency,
        context.currentTime + index * beat,
        beat * 0.8,
        style.wave
      );
    });

    /*
      Start the spoken lyrics.
    */
    speakLyrics(beat);

    /*
      Keep the song long enough for all four lyric lines.
    */
    const totalDuration =
      Math.max(notes.length * beat, beat * 16) + 2;

    const finishTimer = setTimeout(() => {
      setIsPlaying(false);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      if (audioContextRef.current) {
        audioContextRef.current
          .close()
          .catch(() => {});

        audioContextRef.current = null;
      }
    }, totalDuration * 1000);

    timersRef.current.push(finishTimer);

    /*
      Award +10 XP only once for listening.
    */
    if (!hasListened) {
      setHasListened(true);
      listenToSong();
    }
  }

  function speakLyricsOnly() {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        lyrics.join(". ")
      );

    utterance.rate = 0.8;
    utterance.pitch = 1.15;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);

    if (!hasListened) {
      setHasListened(true);
      listenToSong();
    }
  }

  function handleSing() {
    if (!hasListened || hasSung) {
      return;
    }

    singSong();
    setHasSung(true);
  }

  return (
    <div className="ai-songs">
      <header className="songs-header">
        <div className="songs-music-icon">
          🎵
        </div>

        <h1>Your AI Song</h1>

        <p>
          A personalized song created for
          your speech practice.
        </p>
      </header>

      <section className="personalized-song-card">

        <div className="song-badge">
          ✨ MADE FOR {childName.toUpperCase()}
        </div>

        <h2>
          Practice the "{challenge}" sound
        </h2>

        <p className="song-description">
          {genre} • Personalized for your
          learning journey
        </p>

        {/* Practice words */}
        <div className="practice-words-section">
          <h3>🎯 Today's Practice Words</h3>

          <div className="practice-word-list">
            {practiceWords.map((word) => (
              <span
                className="practice-word"
                key={word}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Song visual */}
        <div className="song-player-visual">
          <div
            className={`sound-bars ${
              isPlaying ? "active" : ""
            }`}
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="music-note">
            {isPlaying ? "🎶" : "🎵"}
          </div>

          <p>
            {isPlaying
              ? "Listen to your song..."
              : "Your song is ready!"}
          </p>
        </div>

        {/* Lyrics for parent */}
        <details className="parent-lyrics">
          <summary>
            👨‍👩‍👧 Parent: View Song Words
          </summary>

          <div className="lyrics-box">
            {lyrics.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </details>

        {/* Main controls */}
        <div className="song-actions">

          <button
            type="button"
            className={`listen-button ${
              isPlaying ? "playing" : ""
            }`}
            onClick={playSong}
          >
            {isPlaying
              ? "⏹ Stop Song"
              : "▶ Hear My Song"}
          </button>

          <div className="xp-note">
            🎧 Listening to the song =
            <strong> +10 XP</strong>
          </div>

          <button
            type="button"
            className={`sing-button ${
              hasSung ? "completed" : ""
            }`}
            onClick={handleSing}
            disabled={!hasListened || hasSung}
          >
            {hasSung
              ? "✓ Song Sung +20 XP"
              : "🎤 Now Sing It"}
          </button>

          {!hasListened && (
            <p className="listen-first-message">
              🎧 Listen to the song first.
              Then you can sing along!
            </p>
          )}

          {hasSung && (
            <p className="success-message">
              🌟 Amazing, {childName}!
              You earned 20 XP for singing!
            </p>
          )}

        </div>
      </section>
    </div>
  );
}