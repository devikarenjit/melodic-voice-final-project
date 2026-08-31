import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
} from "react-router-dom";
import {
  useOnboarding,
} from "../context/OnboardingContext";
import {
  useProgress,
} from "../context/ProgressContext";
import "./AISongs.css";

/*
============================================================
MELODIC VOICE - AI SONGS
============================================================

This version supports MULTIPLE speech targets.

Example:

"x and m"

The app will practise both:

X:
fox, box, six, mix

M:
moon, monkey, mouse, music

The lyrics use words from BOTH groups.
============================================================
*/


/* ==========================================================
   WORD BANKS
   ========================================================== */

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
    "mouse",
    "music",
    "milk",
    "mommy",
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


/* ==========================================================
   LETTER WORD BANK
   ========================================================== */

const LETTER_WORD_BANK = {
  a: [
    "apple",
    "ant",
    "animal",
    "astronaut",
  ],

  b: [
    "ball",
    "baby",
    "bird",
    "banana",
    "bear",
  ],

  c: [
    "cat",
    "car",
    "cookie",
    "cake",
    "cloud",
  ],

  d: [
    "dog",
    "duck",
    "dinosaur",
    "dance",
    "drum",
  ],

  e: [
    "elephant",
    "egg",
    "ear",
    "eagle",
    "excited",
  ],

  f: [
    "fish",
    "fox",
    "frog",
    "flower",
    "fun",
  ],

  g: [
    "goat",
    "garden",
    "gift",
    "giraffe",
    "green",
  ],

  h: [
    "hat",
    "horse",
    "house",
    "happy",
    "hop",
  ],

  i: [
    "ice",
    "igloo",
    "insect",
    "island",
    "inside",
  ],

  j: [
    "jam",
    "jelly",
    "jump",
    "jungle",
    "jolly",
  ],

  k: [
    "kite",
    "king",
    "kangaroo",
    "kitten",
    "key",
  ],

  l: [
    "lion",
    "ladybug",
    "leaf",
    "little",
    "love",
  ],

  m: [
    "moon",
    "monkey",
    "mouse",
    "music",
  ],

  n: [
    "nose",
    "nest",
    "night",
    "noodle",
    "nice",
  ],

  o: [
    "octopus",
    "orange",
    "ocean",
    "owl",
    "open",
  ],

  p: [
    "puppy",
    "panda",
    "pizza",
    "pig",
    "play",
  ],

  q: [
    "queen",
    "quiet",
    "quick",
    "quilt",
  ],

  r: [
    "rabbit",
    "rainbow",
    "rocket",
    "robot",
    "rain",
  ],

  s: [
    "snake",
    "snail",
    "sun",
    "song",
    "star",
  ],

  t: [
    "tiger",
    "train",
    "tree",
    "toy",
    "turtle",
  ],

  u: [
    "umbrella",
    "under",
    "up",
    "unicorn",
  ],

  v: [
    "van",
    "violin",
    "violet",
    "very",
  ],

  w: [
    "whale",
    "water",
    "window",
    "wonder",
    "wave",
  ],

  x: [
    "fox",
    "box",
    "six",
    "mix",
  ],

  y: [
    "yellow",
    "yo-yo",
    "yummy",
    "yarn",
  ],

  z: [
    "zebra",
    "zoo",
    "zip",
    "buzz",
  ],
};


/* ==========================================================
   GENRES
   ========================================================== */

const GENRE_STYLES = {
  "Nursery Rhymes": {
    bpm: 92,
    wave: "sine",
  },

  Lullaby: {
    bpm: 68,
    wave: "sine",
  },

  "Action Songs": {
    bpm: 118,
    wave: "triangle",
  },

  "Learning Songs": {
    bpm: 100,
    wave: "sine",
  },

  "Dance Songs": {
    bpm: 112,
    wave: "triangle",
  },

  "Animal Songs": {
    bpm: 105,
    wave: "square",
  },

  "Space Songs": {
    bpm: 88,
    wave: "sine",
  },
};


/* ==========================================================
   HELPERS
   ========================================================== */

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}


/*
Convert:

"x and m"
"x & m"
"x, m"
"x; m"

into:

["x", "m"]
*/

function getTargets(value) {
  if (!value) {
    return [];
  }

  const text = String(value)
    .toLowerCase()
    .replace(/\band\b/g, ",")
    .replace(/&/g, ",")
    .replace(/\//g, ",")
    .replace(/;/g, ",")
    .replace(/\+/g, ",");

  return [
    ...new Set(
      text
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ];
}


/* ==========================================================
   GET CHILD'S SPEECH TARGETS
   ========================================================== */

function getPracticeTargets(data) {
  const candidateValues = [
    data?.difficultSounds,
    data?.difficultWords,
    data?.speechSound,
    data?.practiceSound,
  ];

  for (const value of candidateValues) {
    if (Array.isArray(value)) {
      const targets = value
        .flatMap((item) => getTargets(item))
        .filter(Boolean);

      if (targets.length > 0) {
        return [...new Set(targets)];
      }
    }

    const targets = getTargets(value);

    if (targets.length > 0) {
      return [...new Set(targets)];
    }
  }

  return ["x", "m"];
}


/* ==========================================================
   GET WORDS FOR ONE TARGET
   ========================================================== */

function getWordsForTarget(target) {
  const clean =
    normalize(target);

  /*
   Sound bank.
  */

  if (SOUND_WORD_BANK[clean]) {
    return SOUND_WORD_BANK[clean];
  }


  /*
   Letter bank.
  */

  if (
    clean.length === 1 &&
    LETTER_WORD_BANK[clean]
  ) {
    return LETTER_WORD_BANK[clean];
  }


  /*
   If a whole word was supplied,
   use its first letter.
  */

  const firstLetter =
    clean.charAt(0);

  if (
    LETTER_WORD_BANK[firstLetter]
  ) {
    return LETTER_WORD_BANK[
      firstLetter
    ];
  }


  return [];
}


/* ==========================================================
   GET WORDS FOR ALL TARGETS
   ========================================================== */

function getPracticeWords(targets) {
  const words = [];

  targets.forEach((target) => {
    const targetWords =
      getWordsForTarget(target);

    /*
     Take several words from each
     target so ALL targets are represented.
    */

    targetWords
      .slice(0, 4)
      .forEach((word) => {
        if (!words.includes(word)) {
          words.push(word);
        }
      });
  });


  return words.slice(0, 8);
}


/* ==========================================================
   CREATE LYRICS USING ALL TARGETS
   ========================================================== */

function createLyrics({
  targets,
  words,
  genre,
  childName,
  seed,
}) {
  const name =
    childName || "friend";

  /*
   Separate words by target.
  */

  const targetGroups =
    targets.map((target) => ({
      target,
      words:
        getWordsForTarget(target)
          .filter((word) =>
            words.includes(word)
          )
          .slice(0, 4),
    }));


  /*
   If we have two targets,
   explicitly bring both into
   the song.
  */

  if (targetGroups.length >= 2) {
    const first =
      targetGroups[0];

    const second =
      targetGroups[1];

    const a =
      first.words[0] ||
      first.target;

    const b =
      first.words[1] ||
      first.target;

    const c =
      second.words[0] ||
      second.target;

    const d =
      second.words[1] ||
      second.target;

    const e =
      first.words[2] ||
      a;

    const f =
      second.words[2] ||
      c;


    if (genre === "Lullaby") {
      return [
        `${a} and ${c}, softly glow`,
        `${name}, close your eyes and dream slow`,
        `${b} and ${d}, floating in the night`,
        `${e} and ${f}, shining bright`,
        `${name} sings a gentle song`,
        `Sleepy stars will sing along`,
      ];
    }


    if (genre === "Action Songs") {
      return [
        `${a} and ${c}, jump up high`,
        `${b} and ${d}, touch the sky`,
        `Clap for ${e}, stomp for ${f}`,
        `${name} sings and dances too`,
        `Turn around and shout hooray`,
        `We can practise words today`,
      ];
    }


    if (genre === "Space Songs") {
      return [
        `${a} and ${c} are flying far`,
        `${b} and ${d} are space stars`,
        `${e} is zooming through the night`,
        `${f} is glowing with delight`,
        `${name} travels past the moon`,
        `Singing our practice tune`,
      ];
    }


    /*
     Default / nursery / learning.
    */

    return [
      `${a} and ${c}, come sing with me`,
      `${b} and ${d}, happy as can be`,
      `${e} and ${f}, clap along`,
      `${name} is singing a happy song`,
      `Move and smile, come dance today`,
      `Say our special words and play`,
    ];
  }


  /*
   Single-target version.
  */

  const group =
    targetGroups[0] || {
      target: targets[0] || "s",
      words,
    };

  const [
    a = group.target,
    b = a,
    c = b,
    d = c,
    e = d,
    f = e,
  ] = group.words;


  return [
    `${a}, ${a}, sing with me`,
    `${b}, ${b}, happy as can be`,
    `${c} and ${d}, clap along`,
    `${e} and ${f}, sing our song`,
    `${name} is smiling bright today`,
    `Practising words while we play`,
  ];
}


/* ==========================================================
   MELODY
   ========================================================== */

function createNoteSequence(
  genre,
  seed = 0
) {
  const baseMelodies = {
    "Nursery Rhymes": [
      261.63,
      329.63,
      392.0,
      523.25,
      392.0,
      329.63,
      293.66,
      392.0,
      329.63,
      261.63,
      293.66,
      329.63,
    ],

    Lullaby: [
      261.63,
      329.63,
      392.0,
      440.0,
      392.0,
      349.23,
      329.63,
      293.66,
      329.63,
      349.23,
      392.0,
      440.0,
    ],

    "Action Songs": [
      261.63,
      392.0,
      523.25,
      659.25,
      523.25,
      392.0,
      329.63,
      392.0,
      523.25,
      659.25,
      523.25,
      392.0,
    ],

    "Learning Songs": [
      261.63,
      293.66,
      329.63,
      392.0,
      440.0,
      392.0,
      329.63,
      293.66,
      261.63,
      329.63,
      392.0,
      440.0,
    ],

    "Dance Songs": [
      293.66,
      392.0,
      493.88,
      587.33,
      493.88,
      392.0,
      329.63,
      392.0,
      493.88,
      587.33,
      523.25,
      392.0,
    ],

    "Animal Songs": [
      261.63,
      349.23,
      392.0,
      493.88,
      392.0,
      349.23,
      329.63,
      293.66,
      329.63,
      392.0,
      493.88,
      392.0,
    ],

    "Space Songs": [
      220.0,
      261.63,
      329.63,
      392.0,
      493.88,
      392.0,
      329.63,
      293.66,
      329.63,
      392.0,
      440.0,
      392.0,
    ],
  };

  const melody =
    baseMelodies[genre] ||
    baseMelodies["Learning Songs"];

  const rotation =
    Math.abs(seed) % melody.length;

  const shifted =
    melody
      .slice(rotation)
      .concat(melody.slice(0, rotation));

  return shifted.map((note, index) => {
    const offset =
      (seed % 5) * (index % 2 === 0 ? 1.0 : 0.5);
    return note * (1 + offset / 100);
  });
}

function createSongArrangement(genre, seed = 0) {
  const melody = createNoteSequence(genre, seed);
  const harmonyRoot = melody[0] || 261.63;

  const bass = melody.map((note, index) => {
    if (index % 2 === 0) return note / 2;
    return note / 3;
  });

  const xylophone = melody.map((note, index) => {
    const octaveLift = index % 2 === 0 ? 1.5 : 2.0;
    return note * octaveLift;
  });

  const violin = melody.map((note, index) => {
    const variation = (index % 3) * 7;
    return (note + variation) * 0.8;
  });

  const chords = melody.map((note, index) => {
    const root = note;
    return [
      root,
      root * 1.25,
      root * 1.5,
    ];
  });

  return {
    melody,
    bass,
    xylophone,
    violin,
    chords,
    padRoot: harmonyRoot,
  };
}

/* ==========================================================
   PLAY NOTE
   ========================================================== */

function playNote(
  context,
  frequency,
  startTime,
  duration,
  wave,
  volume = 0.12,
  options = {}
) {
  const {
    attack = 0.04,
    release = 0.12,
    vibrato = 0,
    detune = 0,
    secondWave = "sine",
    secondRatio = 1.5,
    secondVolume = 0.4,
  } = options;

  const primaryOscillator =
    context.createOscillator();
  const harmonyOscillator =
    context.createOscillator();
  const gain =
    context.createGain();

  primaryOscillator.type = wave;
  harmonyOscillator.type = secondWave;

  primaryOscillator.detune.value = detune;
  harmonyOscillator.detune.value = detune * 0.5;

  primaryOscillator.frequency.setValueAtTime(
    frequency,
    startTime
  );
  harmonyOscillator.frequency.setValueAtTime(
    frequency * secondRatio,
    startTime
  );

  const maxGain = volume;

  gain.gain.setValueAtTime(
    0.0001,
    startTime
  );
  gain.gain.exponentialRampToValueAtTime(
    maxGain,
    startTime + attack
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime + duration + release
  );

  if (vibrato > 0) {
    const vibratoOsc = context.createOscillator();
    const vibratoGain = context.createGain();

    vibratoOsc.type = "sine";
    vibratoOsc.frequency.value = vibrato;
    vibratoGain.gain.value = 6;

    vibratoOsc.connect(vibratoGain);
    vibratoGain.connect(primaryOscillator.frequency);
    vibratoGain.connect(harmonyOscillator.frequency);

    vibratoOsc.start(startTime);
    vibratoOsc.stop(startTime + duration);
  }

  primaryOscillator.connect(gain);
  harmonyOscillator.connect(gain);

  gain.connect(
    context.destination
  );

  primaryOscillator.start(startTime);
  harmonyOscillator.start(startTime);

  primaryOscillator.stop(
    startTime + duration
  );
  harmonyOscillator.stop(
    startTime + duration
  );

  if (secondVolume < 1) {
    const secondaryGain = context.createGain();
    secondaryGain.gain.value = secondVolume;
    harmonyOscillator.connect(secondaryGain);
    secondaryGain.connect(context.destination);
  }
}


/* ==========================================================
   MAIN COMPONENT
   ========================================================== */

export default function AISongs() {
  const { data } =
    useOnboarding();

  const {
    listenToSong,
    singSong,
  } = useProgress();


  const [isPlaying, setIsPlaying] =
    useState(false);

  const [hasListened, setHasListened] =
    useState(false);

  const [hasSung, setHasSung] =
    useState(false);

  const [songSeed, setSongSeed] =
    useState(0);

  const [isRecording, setIsRecording] =
    useState(false);

  const [recordingError, setRecordingError] =
    useState("");


  const audioContextRef =
    useRef(null);

  const timersRef =
    useRef([]);

  const mediaRecorderRef =
    useRef(null);

  const audioChunksRef =
    useRef([]);


  /*
   * Child information.
   */

  const childName =
    data?.firstName ||
    data?.childName ||
    "friend";

  const genre =
    data?.songGenre ||
    "Learning Songs";


  /*
   * MULTIPLE TARGETS.
   */

  const targets =
    useMemo(
      () =>
        getPracticeTargets(data),
      [data]
    );


  /*
   * PRACTICE WORDS FOR ALL TARGETS.
   */

  const practiceWords =
    useMemo(
      () =>
        getPracticeWords(
          targets
        ),
      [targets]
    );


  const style =
    GENRE_STYLES[genre] ||
    GENRE_STYLES[
      "Learning Songs"
    ];


  /*
   * Lyrics now use all target groups.
   */

  const lyrics =
    useMemo(
      () =>
        createLyrics({
          targets,
          words: practiceWords,
          genre,
          childName,
          seed: songSeed,
        }),
      [
        targets,
        practiceWords,
        genre,
        childName,
        songSeed,
      ]
    );


  /*
   * Display target.
   */

  const targetLabel =
    targets.join(" and ");


  /* ========================================================
     STOP SONG
     ======================================================== */

  function stopSong() {
    timersRef.current.forEach(
      (timer) =>
        clearTimeout(timer)
    );

    timersRef.current = [];

    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    if (
      audioContextRef.current
    ) {
      audioContextRef.current
        .close()
        .catch(() => {});

      audioContextRef.current =
        null;
    }

    setIsPlaying(false);
  }


  /* ========================================================
     SPEAK LYRICS
     ======================================================== */

  function speakLyrics() {
    if (
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        lyrics.join(". ")
      );

    utterance.rate = 0.72;
    utterance.pitch = 1.1;
    utterance.volume = 1.4;

    /*
     * Tell the browser to use English.
     */

    utterance.lang =
      data?.primaryLanguage ===
      "Malayalam"
        ? "ml-IN"
        : "en-US";


    /*
     * Try to select a natural
     * sounding voice.
     */

    const voices =
      window.speechSynthesis
        .getVoices();

    const preferredVoice =
      voices.find(
        (voice) =>
          voice.lang
            ?.toLowerCase()
            .startsWith(
              utterance.lang
                .toLowerCase()
                .split("-")[0]
            )
      );

    if (preferredVoice) {
      utterance.voice =
        preferredVoice;
    }


    utterance.onend = () => {
      setHasListened(true);
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setHasListened(true);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(
      utterance
    );
  }


  /* ========================================================
     PLAY SONG
     ======================================================== */

  async function playSong() {
    if (isPlaying) {
      stopSong();
      return;
    }

    setRecordingError("");
    setIsPlaying(true);


    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;


    /*
     * Browser does not support
     * Web Audio.
     */

    if (!AudioContext) {
      speakLyrics();
      listenToSong();
      return;
    }


    try {
      const context =
        new AudioContext();

      audioContextRef.current =
        context;


      if (
        context.state ===
        "suspended"
      ) {
        await context.resume();
      }


      const arrangement =
        createSongArrangement(
          genre,
          songSeed + targets.length
        );

      const notes = arrangement.melody;
      const beat = 60 / style.bpm;
      const noteDuration = beat * 0.78;
      const start = context.currentTime + 0.05;
      const musicVolume = 0.035;

      arrangement.chords.forEach((chord, index) => {
        chord.forEach((frequency, chordIndex) => {
          playNote(
            context,
            frequency,
            start + index * beat + chordIndex * 0.05,
            beat * 1.1,
            "triangle",
            musicVolume * (chordIndex === 0 ? 1.4 : 0.8),
            {
              attack: 0.07,
              release: 0.22,
              secondWave: "sine",
              secondRatio: 1.25,
              secondVolume: 0.18,
            }
          );
        });
      });

      notes.forEach((frequency, index) => {
        playNote(
          context,
          frequency,
          start + index * beat,
          noteDuration,
          style.wave,
          musicVolume * 1.6,
          {
            attack: 0.03,
            release: 0.12,
            detune: index % 2 === 0 ? -4 : 8,
            secondWave: "triangle",
            secondRatio: 1.5,
            secondVolume: 0.2,
          }
        );
      });

      arrangement.xylophone.forEach((frequency, index) => {
        if (index % 2 === 0) {
          playNote(
            context,
            frequency,
            start + index * beat + 0.04,
            beat * 0.7,
            "triangle",
            musicVolume * 1.3,
            {
              attack: 0.01,
              release: 0.09,
              secondWave: "sine",
              secondRatio: 2,
              secondVolume: 0.12,
            }
          );
        }
      });

      arrangement.violin.forEach((frequency, index) => {
        if (index % 3 !== 0) {
          playNote(
            context,
            frequency,
            start + index * beat + 0.14,
            beat * 0.9,
            "sine",
            musicVolume * 1.2,
            {
              attack: 0.08,
              release: 0.18,
              vibrato: 4,
              secondWave: "triangle",
              secondRatio: 1.8,
              secondVolume: 0.16,
            }
          );
        }
      });

      arrangement.bass.forEach((frequency, index) => {
        if (index % 2 === 0) {
          playNote(
            context,
            frequency,
            start + index * beat,
            beat * 1.7,
            "sine",
            musicVolume * 1.5,
            {
              attack: 0.05,
              release: 0.25,
              secondWave: "triangle",
              secondRatio: 1.2,
              secondVolume: 0.1,
            }
          );
        }
      });

      /*
       * Start the lyrics before the full music so the voice
       * sits on top as the lead layer.
       */

      speakLyrics();


      /*
       * +10 XP once when
       * listening starts.
       */

      listenToSong();


      /*
       * Safety timer.
       */

      const duration =
        notes.length * beat +
        2;

      const timer =
        setTimeout(() => {
          setIsPlaying(false);

          if (
            audioContextRef.current
          ) {
            audioContextRef.current
              .close()
              .catch(() => {});

            audioContextRef.current =
              null;
          }
        }, duration * 1000);

      timersRef.current.push(
        timer
      );

    } catch (error) {
      console.error(
        "Song playback error:",
        error
      );

      /*
       * Still speak the lyrics
       * if audio generation fails.
       */

      speakLyrics();

      listenToSong();
    }
  }


  /* ========================================================
     NEW SONG
     ======================================================== */

  function generateNewSong() {
    stopSong();

    setSongSeed(
      (previous) =>
        previous + 1
    );

    setHasListened(false);
    setHasSung(false);
    setRecordingError("");
  }


  /* ========================================================
     RECORDING
     ======================================================== */

  async function startRecording() {
    setRecordingError("");

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices
        .getUserMedia
    ) {
      setRecordingError(
        "Your browser does not support microphone recording."
      );

      return;
    }


    try {
      const stream =
        await navigator.mediaDevices
          .getUserMedia({
            audio: true,
          });


      let options = {};

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm"
        )
      ) {
        options = {
          mimeType:
            "audio/webm",
        };
      }


      const recorder =
        new MediaRecorder(
          stream,
          options
        );

      mediaRecorderRef.current =
        recorder;

      audioChunksRef.current =
        [];


      recorder.ondataavailable =
        (event) => {
          if (
            event.data &&
            event.data.size > 0
          ) {
            audioChunksRef.current.push(
              event.data
            );
          }
        };


      recorder.onstop = () => {
        stream
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );


        const recordedBlob =
          new Blob(
            audioChunksRef.current,
            {
              type:
                recorder.mimeType ||
                "audio/webm",
            }
          );


        console.log(
          "Melodic Voice singing recording:",
          recordedBlob
        );


        if (!hasSung) {
          singSong();
          setHasSung(true);
        }

        setIsRecording(false);
      };


      recorder.onerror = (
        event
      ) => {
        console.error(
          "Recording error:",
          event
        );

        stream
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        setIsRecording(false);

        setRecordingError(
          "Something went wrong while recording. Please try again."
        );
      };


      recorder.start();

      setIsRecording(true);

    } catch (error) {
      console.error(
        "Microphone error:",
        error
      );

      setIsRecording(false);

      if (
        error?.name ===
        "NotAllowedError"
      ) {
        setRecordingError(
          "Microphone access was blocked. Please allow microphone access in Chrome."
        );
      } else if (
        error?.name ===
        "NotFoundError"
      ) {
        setRecordingError(
          "No microphone was found."
        );
      } else {
        setRecordingError(
          "We couldn't start the microphone. Please try again."
        );
      }
    }
  }


  function stopRecording() {
    const recorder =
      mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !==
        "inactive"
    ) {
      recorder.stop();
    }
  }


  async function handleSing() {
    if (isRecording) {
      stopRecording();
      return;
    }

    if (hasSung) {
      return;
    }

    await startRecording();
  }


  /* ========================================================
     CLEANUP
     ======================================================== */

  useEffect(() => {
    return () => {
      timersRef.current.forEach(
        (timer) =>
          clearTimeout(timer)
      );

      if (
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }

      if (
        audioContextRef.current
      ) {
        audioContextRef.current
          .close()
          .catch(() => {});
      }

      const recorder =
        mediaRecorderRef.current;

      if (
        recorder &&
        recorder.state !==
          "inactive"
      ) {
        recorder.stop();
      }
    };
  }, []);


  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <main className="ai-songs">

      {/* ==================================================
          HEADER
          ================================================== */}

      <header className="songs-header">

        <div className="songs-header-top">

          <Link
            to="/"
            className="home-button"
          >
            ← Home
          </Link>

          <div
            className="songs-music-icon"
            aria-hidden="true"
          >
            🎵
          </div>

        </div>

        <h1>
          Your AI Song
        </h1>

        <p>
          A personalized song made
          around all the sounds and
          words you are practising.
        </p>

      </header>


      {/* ==================================================
          SONG CARD
          ================================================== */}

      <section className="personalized-song-card">

        <div className="song-badge">
          ✨ MADE FOR{" "}
          {childName.toUpperCase()}
        </div>


        <h2>
          Practice the “
          {targetLabel}
          ” sounds
        </h2>


        <p className="song-description">
          {genre} • Your practice
          words are built into the song.
        </p>


        {/* ================================================
            TARGETS
            ================================================ */}

        <div className="target-section">

          <h3>
            🎯 Sounds to practise
          </h3>

          <div className="target-list">
            {targets.map(
              (target) => (
                <span
                  key={target}
                  className="target-chip"
                >
                  {target}
                </span>
              )
            )}
          </div>

        </div>


        {/* ================================================
            PRACTICE WORDS
            ================================================ */}

        <div className="practice-words-section">

          <h3>
            🎯 Practice Words
          </h3>

          <p className="practice-help">
            These words practise all
            of your speech targets.
          </p>

          <div className="practice-word-list">

            {practiceWords.map(
              (word) => (
                <span
                  key={word}
                  className="practice-word"
                >
                  {word}
                </span>
              )
            )}

          </div>

        </div>


        {/* ================================================
            AUDIO VISUAL
            ================================================ */}

        <div
          className={`audio-visual ${
            isPlaying
              ? "playing"
              : ""
          }`}
          aria-hidden="true"
        >
          <div className="audio-bar" />
          <div className="audio-bar" />
          <div className="audio-bar" />
          <div className="audio-bar" />
          <div className="audio-bar" />
          <div className="audio-bar" />
          <div className="audio-bar" />
        </div>


        <p className="listen-first-message">

          🔊{" "}

          {isPlaying
            ? "Listen to your personalized song..."
            : "Press the button to hear your song"}

        </p>


        {/* ================================================
            HEAR SONG
            ================================================ */}

        <button
          type="button"
          className={`listen-button ${
            isPlaying
              ? "playing"
              : ""
          }`}
          onClick={playSong}
        >

          {isPlaying
            ? "⏹ Stop Song"
            : "▶ Hear My Song"}

        </button>


        <button
          type="button"
          className="new-song-button"
          onClick={
            generateNewSong
          }
        >
          ✨ New AI Song
        </button>


        <p className="xp-note">
          🎧 Listening to the song
          = <strong>+10 XP</strong>
        </p>


        {/* ================================================
            SING
            ================================================ */}

        <section className="sing-section">

          <h3>
            🎤 Ready to sing?
          </h3>

          <p>
            Listen first, then sing
            along using the practice words.
          </p>


          <button
            type="button"
            className={`sing-button ${
              isRecording
                ? "recording"
                : ""
            } ${
              hasSung
                ? "completed"
                : ""
            }`}
            onClick={handleSing}
            disabled={hasSung}
          >

            {hasSung
              ? "✓ Singing Complete • +20 XP"
              : isRecording
              ? "⏹ Stop Singing"
              : "🎤 Sing With Me"}

          </button>


          {isRecording && (
            <p className="recording-message">
              🎤 I'm listening!
              <br />
              Sing the practice words
              with me.
            </p>
          )}


          {!isRecording &&
            !hasSung && (
              <p className="listen-first-message">
                🎵 Sing along with your
                personalized song and practise
                the highlighted words.
              </p>
            )}


          {hasSung && (
            <p className="success-message">
              🌟 Amazing, {childName}!
              <br />
              You completed your singing
              practice and earned{" "}
              <strong>20 XP</strong>.
            </p>
          )}


          {recordingError && (
            <p className="recording-error">
              ⚠️ {recordingError}
            </p>
          )}

        </section>


        {/* ================================================
            PARENT LYRICS
            ================================================ */}

        <details className="parent-lyrics">

          <summary>
            👨‍👩‍👧 Parent: View Song Lyrics
          </summary>

          <div className="lyrics-box">

            <h3>
              Song Lyrics
            </h3>

            {lyrics.map(
              (line, index) => (
                <p
                  key={`${line}-${index}`}
                >
                  {line}
                </p>
              )
            )}

          </div>

        </details>

      </section>

    </main>
  );
}