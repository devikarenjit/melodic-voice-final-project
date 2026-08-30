import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useOnboarding } from "../context/OnboardingContext";
import { useProgress } from "../context/ProgressContext";

import "./AISongs.css";

/*
  ============================================================
  MELODIC VOICE - AI SONGS
  ============================================================

  Purpose:
  - Reads the child's difficult sound/letter from onboarding.
  - Selects practice words related to that challenge.
  - Creates personalized lyrics.
  - Creates a simple melody in the browser.
  - Speaks the lyrics aloud so a young child does not need
    to read.
  - Allows the child to sing using the microphone.
  - Records the singing during the practice session.
  - Awards XP after singing is completed.

  Example:

  Child challenge: S

  Practice words:
  snake
  snail
  sun
  song
  star
  school

  The song then repeatedly practices those words.
*/


/* ============================================================
   PRACTICE WORD BANKS
   ============================================================ */

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


/* ============================================================
   LETTER WORD BANK
   ============================================================ */

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


/* ============================================================
   MUSIC STYLES
   ============================================================ */

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


/* ============================================================
   HELPERS
   ============================================================ */

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}


function getFirstValue(value) {
  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return String(value)
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)[0] || "";
}


/* ============================================================
   FIND CHILD'S MAIN SPEECH CHALLENGE
   ============================================================ */

function getPracticeChallenge(data) {
  const difficultSounds = Array.isArray(
    data?.difficultSounds
  )
    ? data.difficultSounds
    : [];

  const firstSound =
    difficultSounds.find(Boolean);

  if (firstSound) {
    return normalize(firstSound);
  }

  const difficultWord =
    getFirstValue(data?.difficultWords);

  if (difficultWord) {
    return normalize(difficultWord);
  }

  return "s";
}


/* ============================================================
   FIND PRACTICE WORDS
   ============================================================ */

function getPracticeWords(challenge) {
  const normalizedChallenge =
    normalize(challenge);

  /*
    Exact sound match.
  */

  if (
    SOUND_WORD_BANK[
      normalizedChallenge
    ]
  ) {
    return SOUND_WORD_BANK[
      normalizedChallenge
    ];
  }


  /*
    Exact letter match.
  */

  if (
    normalizedChallenge.length === 1 &&
    LETTER_WORD_BANK[
      normalizedChallenge
    ]
  ) {
    return LETTER_WORD_BANK[
      normalizedChallenge
    ];
  }


  /*
    If a word was entered,
    use its first letter.
  */

  const firstLetter =
    normalizedChallenge.charAt(0);

  if (
    LETTER_WORD_BANK[firstLetter]
  ) {
    return LETTER_WORD_BANK[
      firstLetter
    ];
  }


  /*
    Safe fallback.
  */

  return SOUND_WORD_BANK.s;
}


/* ============================================================
   SELECT SIX UNIQUE WORDS
   ============================================================ */

function selectWords(words) {
  return [
    ...new Set(words),
  ].slice(0, 6);
}


/* ============================================================
   CREATE PERSONALIZED LYRICS
   ============================================================ */

function createLyrics({
  challenge,
  words,
  genre,
  childName,
  seed = 0,
}) {
  const name =
    childName || "friend";

  const word1 =
    words[0] || challenge;

  const word2 =
    words[1] || word1;

  const word3 =
    words[2] || word1;

  const word4 =
    words[3] || word2;

  const sparkleLine =
    seed % 2 === 0
      ? `${name} bounces and sings, hooray!`
      : `${name} sways and sings, hello day!`;


  /* Lullaby */

  if (genre === "Lullaby") {
    return [
      `Goodnight ${word1}, soft and slow, low and slow`,
      `${name}, close your eyes and dream in a glow`,
      `${word2} and ${word3}, twinkle, twinkle bright`,
      `${sparkleLine}`,
    ];
  }


  /* Animal Songs */

  if (genre === "Animal Songs") {
    return [
      `${word1}, ${word1}, hop and play`,
      `${word2}, ${word2}, sing all day`,
      `${word3} and ${word4}, clap, clap, hooray!`,
      `${sparkleLine}`,
    ];
  }


  /* Action Songs */

  if (genre === "Action Songs") {
    return [
      `${word1}, ${word1}, jump up high`,
      `${word2}, ${word2}, touch the sky`,
      `Clap for ${word3}, stomp for ${word4}, stomp, stomp, wow!`,
      `${sparkleLine}`,
    ];
  }


  /* Dance Songs */

  if (genre === "Dance Songs") {
    return [
      `${word1}, ${word2}, dance with me`,
      `${word3}, ${word4}, one, two, three`,
      `Turn around and wiggle, wiggle, sway`,
      `${sparkleLine}`,
    ];
  }


  /* Space Songs */

  if (genre === "Space Songs") {
    return [
      `${word1} is zooming like a star`,
      `${word2} is soaring very far`,
      `${word3} is shining in the night`,
      `${sparkleLine}`,
    ];
  }


  /* Nursery Rhymes */

  if (genre === "Nursery Rhymes") {
    return [
      `${word1}, ${word1}, sing with me`,
      `${word2} sounds happy as can be`,
      `${word3}, ${word4}, here we go`,
      `${sparkleLine}`,
    ];
  }


  /* Default - Learning Songs */

  return [
    `${word1}, ${word1}, sing and sway`,
    `${word2}, ${word2}, hooray, hooray!`,
    `${word3}, ${word4}, say them strong`,
    `${sparkleLine}`,
  ];
}


/* ============================================================
   MELODY
   ============================================================ */

function createNoteSequence(genre, seed = 0) {
  const baseMelodies = {
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

  const melody = baseMelodies[genre] || baseMelodies["Learning Songs"];
  const rotation = seed % melody.length;

  return melody
    .slice(rotation)
    .concat(melody.slice(0, rotation))
    .map((note, index) =>
      index % 2 === 0 ? note * (1 + (seed % 3) * 0.02) : note
    );
}


/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function AISongs() {

  const { data } =
    useOnboarding();

  const {
    listenToSong,
    singSong,
  } = useProgress();


  /* ----------------------------------------------------------
     Playback state
     ---------------------------------------------------------- */

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false);

  const [
    hasListened,
    setHasListened,
  ] = useState(false);


  /* ----------------------------------------------------------
     Singing state
     ---------------------------------------------------------- */

  const [
    hasSung,
    setHasSung,
  ] = useState(false);

  const [
    songSeed,
    setSongSeed,
  ] = useState(0);

  const [
    isRecording,
    setIsRecording,
  ] = useState(false);

  const [
    recordingError,
    setRecordingError,
  ] = useState("");


  /* ----------------------------------------------------------
     Audio references
     ---------------------------------------------------------- */

  const audioContextRef =
    useRef(null);

  const timersRef =
    useRef([]);

  const mediaRecorderRef =
    useRef(null);

  const audioChunksRef =
    useRef([]);


  /* ----------------------------------------------------------
     Child information
     ---------------------------------------------------------- */

  const childName =
    data?.firstName || "friend";

  const genre =
    data?.songGenre ||
    "Learning Songs";


  /* ----------------------------------------------------------
     Speech challenge
     ---------------------------------------------------------- */

  const challenge =
    useMemo(
      () =>
        getPracticeChallenge(data),
      [data]
    );


  /* ----------------------------------------------------------
     Practice words
     ---------------------------------------------------------- */

  const practiceWords =
    useMemo(
      () =>
        selectWords(
          getPracticeWords(
            challenge
          )
        ),
      [challenge]
    );


  /* ----------------------------------------------------------
     Music style
     ---------------------------------------------------------- */

  const style =
    GENRE_STYLES[genre] ||
    GENRE_STYLES[
      "Learning Songs"
    ];


  /* ----------------------------------------------------------
     Lyrics
     ---------------------------------------------------------- */

  const lyrics =
    useMemo(
      () =>
        createLyrics({
          challenge,
          words: practiceWords,
          genre,
          childName,
          seed: songSeed,
        }),
      [
        challenge,
        practiceWords,
        genre,
        childName,
        songSeed,
      ]
    );


  /* ==========================================================
     STOP SONG
     ========================================================== */

  function stopSong() {

    timersRef.current.forEach(
      (timer) => {
        clearTimeout(timer);
      }
    );

    timersRef.current = [];


    /*
      Stop text-to-speech.
    */

    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }


    /*
      Close Web Audio context.
    */

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


  /* ==========================================================
     PLAY ONE NOTE
     ========================================================== */

  function playNote(
    context,
    frequency,
    startTime,
    duration,
    wave
  ) {

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();


    oscillator.type = wave;

    oscillator.frequency.setValueAtTime(
      frequency,
      startTime
    );


    /*
      Gentle fade in.
    */

    gain.gain.setValueAtTime(
      0.0001,
      startTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.16,
      startTime + 0.03
    );


    /*
      Gentle fade out.
    */

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      startTime + duration
    );


    oscillator.connect(gain);

    gain.connect(
      context.destination
    );


    oscillator.start(startTime);

    oscillator.stop(
      startTime + duration
    );
  }


  /* ==========================================================
     SPEAK LYRICS
     ========================================================== */

  function speakLyrics() {

    if (
      !("speechSynthesis" in window)
    ) {
      return;
    }


    const fullLyrics =
      lyrics.join(". ");


    const utterance =
      new SpeechSynthesisUtterance(
        fullLyrics
      );


    /*
      Child-friendly speaking speed.
    */

    utterance.rate = 0.82;

    utterance.pitch = 1.12;

    utterance.volume = 1;


    /*
      Mark the song as completed
      when the spoken lyrics finish.
    */

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


  /* ==========================================================
     PLAY SONG
     ========================================================== */

  async function playSong() {

    /*
      If already playing,
      stop the current song.
    */

    if (isPlaying) {
      stopSong();
      return;
    }


    setRecordingError("");

    setIsPlaying(true);


    /*
      Browser AudioContext.
    */

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;


    if (!AudioContext) {

      /*
        Fallback:
        still speak the lyrics.
      */

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


      const notes =
        createNoteSequence(
          genre,
          songSeed
        );


      const beatDuration =
        60 / style.bpm;


      const noteDuration =
        beatDuration * 0.82;


      const startTime =
        context.currentTime +
        0.05;


      /*
        Play melody.
      */

      notes.forEach(
        (frequency, index) => {

          playNote(
            context,
            frequency,
            startTime +
              index *
                beatDuration,
            noteDuration,
            style.wave
          );

        }
      );


      /*
        Start speaking the lyrics
        at the same time.
      */

      speakLyrics();


      /*
        Award listening XP once.
      */

      listenToSong();


      /*
        Safety timer in case
        speech synthesis does not
        fire its onend event.
      */

      const melodyDuration =
        notes.length *
          beatDuration +
        1;


      const timer =
        setTimeout(() => {

          setHasListened(true);

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

        }, melodyDuration * 1000);


      timersRef.current.push(
        timer
      );

    } catch (error) {

      console.error(
        "Song playback error:",
        error
      );


      /*
        If Web Audio fails,
        use speech as fallback.
      */

      speakLyrics();

      listenToSong();

    }
  }


  /* ==========================================================
     START MICROPHONE RECORDING
     ========================================================== */

  async function startRecording() {

    setRecordingError("");


    /*
      Check browser support.
    */

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      setRecordingError(
        "Your browser does not support microphone recording."
      );

      return;
    }


    try {

      /*
        Ask the child/parent
        for microphone permission.
      */

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          }
        );


      /*
        Choose a supported
        recording format.
      */

      let options = {};

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm"
        )
      ) {
        options = {
          mimeType: "audio/webm",
        };
      } else if (
        MediaRecorder.isTypeSupported(
          "audio/mp4"
        )
      ) {
        options = {
          mimeType: "audio/mp4",
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


      /*
        Save incoming audio.
      */

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


      /*
        When recording stops.
      */

      recorder.onstop = () => {

        /*
          Stop microphone tracks.
        */

        stream
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );


        /*
          Create the recorded
          audio file in memory.

          This is ready for future
          speech-analysis integration.
        */

        const mimeType =
          recorder.mimeType ||
          "audio/webm";


        const recordedBlob =
          new Blob(
            audioChunksRef.current,
            {
              type: mimeType,
            }
          );


        console.log(
          "Melodic Voice singing recording:",
          recordedBlob
        );


        /*
          Singing practice completed.
        */

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


      /*
        Begin recording.
      */

      recorder.start();


      setIsRecording(true);

    } catch (error) {

      console.error(
        "Microphone permission error:",
        error
      );


      setIsRecording(false);


      if (
        error?.name ===
        "NotAllowedError"
      ) {

        setRecordingError(
          "Microphone access was blocked. Please click the microphone icon in your browser address bar and allow access."
        );

      } else if (
        error?.name ===
        "NotFoundError"
      ) {

        setRecordingError(
          "No microphone was found. Please connect a microphone or headset."
        );

      } else {

        setRecordingError(
          "We couldn't start the microphone. Please try again."
        );

      }

    }
  }


  function generateNewSong() {
    setSongSeed((previous) => previous + 1);
    setHasSung(false);
    setHasListened(false);
    setIsPlaying(false);
    setRecordingError("");
    stopSong();
  }

  /* ==========================================================
     STOP MICROPHONE RECORDING
     ========================================================== */

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


  /* ==========================================================
     SING BUTTON
     ========================================================== */

  async function handleSing() {

    setRecordingError("");


    /*
      If already recording,
      clicking the button stops it.
    */

    if (isRecording) {

      stopRecording();

      return;
    }


    /*
      Do not allow another
      singing session after completion.
    */

    if (hasSung) {
      return;
    }


    /*
      Start microphone recording.
    */

    await startRecording();
  }


  /* ==========================================================
     CLEANUP
     ========================================================== */

  useEffect(() => {

    return () => {

      /*
        Stop song.
      */

      timersRef.current.forEach(
        (timer) => {
          clearTimeout(timer);
        }
      );


      /*
        Stop speech synthesis.
      */

      if (
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }


      /*
        Close audio context.
      */

      if (
        audioContextRef.current
      ) {

        audioContextRef.current
          .close()
          .catch(() => {});

      }


      /*
        Stop microphone if
        user leaves the page.
      */

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


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <main className="ai-songs">

      {/* -----------------------------------------------------
          Header
          ----------------------------------------------------- */}

      <header className="songs-header">

        <div
          className="songs-music-icon"
          aria-hidden="true"
        >
          🎵
        </div>


        <h1>
          Your AI Song
        </h1>


        <p>
          A personalized song made
          around the sound or letter
          you are practicing.
        </p>

      </header>


      {/* -----------------------------------------------------
          Main personalized card
          ----------------------------------------------------- */}

      <section className="personalized-song-card">

        {/* Badge */}

        <div className="song-badge">
          ✨ MADE FOR{" "}
          {childName.toUpperCase()}
        </div>


        {/* Practice challenge */}

        <h2>
          Practice the “
          {challenge}
          ” sound
        </h2>


        <p className="song-description">
          {genre} • Your practice
          words are built into the
          song.
        </p>


        {/* -------------------------------------------------
            Practice words
            ------------------------------------------------- */}

        <div className="practice-words">

          <div className="practice-words-title">
            🎯 Practice Words
          </div>


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


        {/* -------------------------------------------------
            Audio visualizer
            ------------------------------------------------- */}

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

        </div>


        {/* -------------------------------------------------
            Instruction
            ------------------------------------------------- */}

        <p className="listen-first-message">

          🔊{" "}
          {isPlaying
            ? "Listen to your personalized song..."
            : "Press the big button to hear your song"}

        </p>


        {/* -------------------------------------------------
            Hear My Song
            ------------------------------------------------- */}

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
          onClick={generateNewSong}
        >
          ✨ New AI Song
        </button>


        {/* Listening XP */}

        <p className="xp-note">

          🎧 Listening to the song
          = <strong>+10 XP</strong>

        </p>


        {/* -------------------------------------------------
            Singing section
            ------------------------------------------------- */}

        <section className="sing-section">

          <h3>
            🎤 Ready to sing?
          </h3>


          <p>
            Listen to the song first,
            then try the practice words
            yourself.
          </p>


          {/* Sing button */}

          <button
            type="button"
            className={`
              sing-button
              ${
                isRecording
                  ? "recording"
                  : ""
              }
              ${
                hasSung
                  ? "completed"
                  : ""
              }
            `}
            onClick={handleSing}
            disabled={hasSung}
          >

            {hasSung
              ? "✓ Singing Complete • +20 XP"
              : isRecording
              ? "⏹ Stop Singing"
              : "🎤 Sing With Me"}

          </button>


          {/* ------------------------------------------------
              Recording message
              ------------------------------------------------ */}

          {isRecording && (

            <p className="recording-message">

              🎤 I'm listening!

              <br />

              Sing the practice words
              with me.

            </p>

          )}


          {/* ------------------------------------------------
              Before recording
              ------------------------------------------------ */}

          {!isRecording &&
            !hasSung && (

              <p className="listen-first-message">

                🎵 Press "Sing With Me"
                and sing along with your
                personalized song.

              </p>

            )}


          {/* ------------------------------------------------
              Completed
              ------------------------------------------------ */}

          {hasSung && (

            <p className="success-message">

              🌟 Amazing,{" "}
              {childName}!

              <br />

              You completed your
              singing practice and
              earned <strong>20 XP</strong>.

            </p>

          )}


          {/* ------------------------------------------------
              Error
              ------------------------------------------------ */}

          {recordingError && (

            <p className="recording-error">

              ⚠️ {recordingError}

            </p>

          )}

        </section>


        {/* -------------------------------------------------
            Parent lyrics
            ------------------------------------------------- */}

        <details className="parent-lyrics">

          <summary>
            👨‍👩‍👧 Parent: View Song Words
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