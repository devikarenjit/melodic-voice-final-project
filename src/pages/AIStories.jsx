import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { useProgress } from "../context/ProgressContext";
import "./AIStories.css";

const FALLBACK_STORIES = [
  {
    id: 1,
    title: "The Rainbow Rabbit",
    theme: "Adventure",
    icon: "🐰",
    description:
      "A curious rabbit follows a rainbow through a magical forest.",
    content:
      "A little rabbit ran through a bright forest. The rabbit saw a rainbow over the river. It raced past a red rocket and smiled when it reached the rainbow.",
  },
  {
    id: 2,
    title: "The Rocket Race",
    theme: "Space Adventure",
    icon: "🚀",
    description:
      "A brave explorer takes a rocket ride across the stars.",
    content:
      "A brave explorer climbed into a rocket. The rocket raced around a red moon and flew past a sparkling star. The explorer laughed as the rocket returned home.",
  },
  {
    id: 3,
    title: "The Roaring River",
    theme: "Nature",
    icon: "🌈",
    description:
      "A magical river leads to a rainbow hidden behind the hills.",
    content:
      "A little river ran between green hills. A rabbit followed the river and heard a gentle roar. At the end of the path, a beautiful rainbow appeared.",
  },
];

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim();
}

function getTargetLabel(target) {
  if (!target) {
    return "your speech sound";
  }

  return `"${target}"`;
}

function extractDifficultyTokens(value) {
  const raw = String(value || "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/,/g, " ")
    .replace(/\+/g, " ")
    .replace(/\band\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();

  if (!raw) {
    return [];
  }

  return [
    ...new Set(
      raw
        .split(/\s+/)
        .filter(Boolean)
        .map((token) => token.trim())
        .filter((token) => token.length > 0)
    ),
  ];
}

function buildFallbackPracticeWords(difficulty) {
  const baseWords = {
    x: ["fox", "box", "six", "mix", "taxi"],
    m: ["moon", "monkey", "mouse", "music", "milk"],
    r: ["rabbit", "rocket", "rainbow", "river", "roar"],
    s: ["sun", "snake", "star", "sock", "smile"],
    l: ["lion", "leaf", "little", "lamp", "love"],
    sh: ["ship", "shell", "shine", "shark", "shoe"],
    ch: ["chair", "cheese", "chicken", "cherry", "cheese"],
    th: ["three", "thumb", "think", "this", "thunder"],
    k: ["kite", "king", "cake", "cookie", "kangaroo"],
    g: ["garden", "goat", "gift", "giraffe", "green"],
    f: ["fish", "fox", "flower", "frog", "fun"],
    b: ["ball", "baby", "banana", "boat", "book"],
    p: ["pig", "pizza", "panda", "puppy", "play"],
  };

  const tokens = extractDifficultyTokens(difficulty);

  const selected = [];

  for (const token of tokens) {
    const words = baseWords[token] || [];

    words.forEach((word) => {
      if (!selected.includes(word)) {
        selected.push(word);
      }
    });
  }

  if (selected.length >= 8) {
    return selected.slice(0, 8);
  }

  for (const words of Object.values(baseWords)) {
    words.forEach((word) => {
      if (!selected.includes(word)) {
        selected.push(word);
      }
    });

    if (selected.length >= 8) {
      return selected.slice(0, 8);
    }
  }

  return [
    "fox",
    "box",
    "moon",
    "music",
    "rabbit",
    "rocket",
    "sun",
    "star",
  ];
}

function buildFallbackStories({ childName, difficulty, theme, language }) {
  const practiceWords = buildFallbackPracticeWords(difficulty);
  const safeTheme = theme || "Adventure";
  const safeName = childName || "friend";
  const safeLanguage = language || "English";

  const storySeeds = [
    {
      title: `${safeName}'s Rainbow Trail`,
      icon: "🌈",
      description: `A bright adventure full of ${practiceWords[0]} and ${practiceWords[1]} energy.`,
      content: `One morning, ${safeName} woke up to a glowing sky and a little ${practiceWords[0]} bouncing in the grass. The trail sparkled with ${practiceWords[2]} and tiny ${practiceWords[3]} sounds. ${safeName} followed the path through a dreamy garden, laughed at a bouncing ${practiceWords[4]}, and reached a warm hill where the rainbow danced in the air. The world felt magical, and ${safeName} smiled while singing, ${practiceWords[5]} and ${practiceWords[6]} together.`,
    },
    {
      title: "The Moonbeam Rocket",
      icon: "🚀",
      description: `A playful space journey filled with ${practiceWords[2]} and ${practiceWords[7]} wonder.`,
      content: `A brave little explorer named ${safeName} climbed into a shiny rocket and whispered, “Let’s zoom into the sky!” The rocket floated past a giant ${practiceWords[4]} and a moon bright as a ${practiceWords[6]}. ${safeName} laughed as the stars twinkled like tiny ${practiceWords[1]} lights. Soon the rocket drifted over a silver cloud, and the crew sang a happy tune with ${practiceWords[3]} and ${practiceWords[5]} in the air.`,
    },
    {
      title: "The Storybook Garden",
      icon: "🌼",
      description: `A cozy garden adventure where ${practiceWords[0]} and ${practiceWords[7]} help ${safeName} find joy.`,
      content: `In a secret garden, ${safeName} heard a soft rustle near the flowers. A tiny ${practiceWords[0]} peeped out from a bush, and a cheerful ${practiceWords[2]} hopped across the path. The garden was full of bright leaves, dancing bees, and smiling stones. ${safeName} followed the path until a little door appeared. Behind it was a cozy reading nook with ${practiceWords[5]} stories, ${practiceWords[4]} laughter, and the sweetest ${practiceWords[6]} breeze.`,
    },
  ];

  return {
    practiceWords,
    stories: storySeeds.map((story, index) => ({
      id: Date.now() + index,
      title: story.title,
      theme: safeTheme,
      icon: story.icon,
      description: story.description,
      content: story.content,
    })),
    language: safeLanguage,
  };
}

/*
 * Extract the text returned by the Gemini streaming endpoint.
 */
function extractAIText(rawText) {
  const text = String(rawText || "");

  const matches = [
    ...text.matchAll(
      /"text"\s*:\s*"((?:\\.|[^"\\])*)"/g
    ),
  ];

  if (matches.length > 0) {
    return matches
      .map((match) => {
        try {
          return JSON.parse(`"${match[1]}"`);
        } catch {
          return match[1];
        }
      })
      .join("");
  }

  return text;
}

/*
 * Find JSON inside the AI response.
 */
function parseAIJson(rawText) {
  const aiText = extractAIText(rawText)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const arrayStart = aiText.indexOf("[");
  const arrayEnd = aiText.lastIndexOf("]");

  if (
    arrayStart !== -1 &&
    arrayEnd !== -1 &&
    arrayEnd > arrayStart
  ) {
    return JSON.parse(
      aiText.slice(arrayStart, arrayEnd + 1)
    );
  }

  const objectStart = aiText.indexOf("{");
  const objectEnd = aiText.lastIndexOf("}");

  if (
    objectStart !== -1 &&
    objectEnd !== -1 &&
    objectEnd > objectStart
  ) {
    return JSON.parse(
      aiText.slice(objectStart, objectEnd + 1)
    );
  }

  throw new Error("No JSON returned by AI");
}

/*
 * Send one request to the AI.
 *
 * The AI generates:
 *  - practice words
 *  - three stories
 *
 * This guarantees that the practice words are actually
 * used inside the stories.
 */
async function requestAIStories({
  childName,
  difficulty,
  theme,
  language,
}) {
  const response = await fetch(
    "http://localhost:3001/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `
Create a personalized speech-practice activity for a child.

Child name: ${childName}
Speech target: ${difficulty}
Preferred story theme: ${theme}
Language: ${language}

FIRST create exactly 8 child-friendly practice words.

The practice words MUST:
- directly relate to the child's speech target
- contain the target sound, letter, or pattern
- be appropriate for the child's age
- be familiar and understandable to a young child
- NOT be the target letter by itself
- NOT be a generic pre-made word bank

Then create exactly 3 genuinely different short children's stories.

VERY IMPORTANT:
- The 8 practice words must appear naturally in ALL THREE stories.
- Do not create three copies of the same story.
- Each story must have a different plot and setting.
- Each title must describe the actual story.
- Titles must be different from each other.
- Use simple, playful language.
- Repeat the practice words naturally.
- Do not mention "speech therapy" inside the children's story.
- Do not make the story about pronunciation.
- The story should simply be fun while naturally containing the practice words.

Return ONLY valid JSON.

Use exactly this structure:

{
  "practiceWords": [
    "word1",
    "word2",
    "word3",
    "word4",
    "word5",
    "word6",
    "word7",
    "word8"
  ],
  "stories": [
    {
      "title": "Unique title",
      "theme": "Adventure",
      "icon": "🐰",
      "description": "One short sentence.",
      "content": "The complete short story."
    },
    {
      "title": "Different title",
      "theme": "Adventure",
      "icon": "🚀",
      "description": "One short sentence.",
      "content": "A completely different story."
    },
    {
      "title": "Another different title",
      "theme": "Adventure",
      "icon": "🌈",
      "description": "One short sentence.",
      "content": "Another completely different story."
    }
  ]
}
            `,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `AI server returned ${response.status}`
    );
  }

  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("AI response stream unavailable");
  }

  const decoder = new TextDecoder();
  let rawText = "";

  while (true) {
    const { done, value } =
      await reader.read();

    if (done) {
      break;
    }

    rawText += decoder.decode(value, {
      stream: true,
    });
  }

  return parseAIJson(rawText);
}

export default function AIStories() {
  const { data } = useOnboarding();

  const {
    xp,
    listenToStory,
    hearPracticeWord,
    practiceSpeechWord,
  } = useProgress();

  const childName =
    data?.firstName?.trim() ||
    data?.childName?.trim() ||
    "You";

  const difficulty =
    data?.difficultWords?.trim() ||
    data?.difficultSounds?.join(", ") ||
    data?.speechSound?.trim() ||
    data?.practiceSound?.trim() ||
    "x and m";

  const theme =
    data?.storyTheme ||
    data?.theme ||
    "Adventure";

  const language =
    data?.primaryLanguage ||
    "English";

  const [stories, setStories] =
    useState(FALLBACK_STORIES);

  const [practiceWords, setPracticeWords] =
    useState([]);

  const [heardStories, setHeardStories] =
    useState({});

  const [playingStory, setPlayingStory] =
    useState(null);

  const [selectedStory, setSelectedStory] =
    useState(null);

  const [selectedWord, setSelectedWord] =
    useState(null);

  const [heardWords, setHeardWords] =
    useState({});

  const [correctWords, setCorrectWords] =
    useState({});

  const [isListening, setIsListening] =
    useState(false);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [showPractice, setShowPractice] =
    useState(false);

  /*
   * Generate both stories AND their practice words.
   */
  const generateNewStories = async () => {
    setIsGenerating(true);
    setMessage("");
    setShowPractice(false);

    try {
      const result = await requestAIStories({
        childName,
        difficulty,
        theme,
        language,
      });

      if (
        !result ||
        !Array.isArray(result.stories) ||
        result.stories.length < 3
      ) {
        throw new Error(
          "AI did not return three stories"
        );
      }

      if (
        !Array.isArray(result.practiceWords) ||
        result.practiceWords.length < 5
      ) {
        throw new Error(
          "AI did not return enough practice words"
        );
      }

      const cleanedWords =
        result.practiceWords
          .filter(
            (word) =>
              typeof word === "string" &&
              word.trim().length > 1
          )
          .map((word) =>
            word.trim().toLowerCase()
          )
          .filter(
            (word, index, array) =>
              array.indexOf(word) === index
          )
          .slice(0, 8);

      if (cleanedWords.length < 5) {
        throw new Error(
          "Not enough valid AI practice words"
        );
      }

      const cleanedStories =
        result.stories
          .slice(0, 3)
          .map((story, index) => ({
            id: Date.now() + index,
            title:
              story.title ||
              `A New Adventure ${index + 1}`,
            theme:
              story.theme || theme,
            icon:
              story.icon ||
              ["🐰", "🚀", "🌈"][index],
            description:
              story.description ||
              "A new adventure made especially for you.",
            content:
              story.content || "",
          }));

      setPracticeWords(cleanedWords);
      setStories(cleanedStories);

      setHeardStories({});
      setHeardWords({});
      setCorrectWords({});
      setSelectedStory(null);
      setSelectedWord(null);
      setPlayingStory(null);

      setMessage(
        "✨ Your new stories are ready! Listen to a story first."
      );
    } catch (error) {
      console.error(
        "AI story generation failed:",
        error
      );

      const fallback = buildFallbackStories({
        childName,
        difficulty,
        theme,
        language,
      });

      setPracticeWords(fallback.practiceWords);
      setStories(fallback.stories);
      setMessage(
        "✨ Personalized stories were created from your child's speech target while the AI service reconnects."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateNewStories();

    // Generate once when this page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Hear a complete story.
   */
  const hearStory = (story) => {
    if (
      !("speechSynthesis" in window)
    ) {
      setMessage(
        "Speech playback is not supported in this browser."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        story.content
      );

    utterance.rate = 0.85;
    utterance.pitch = 1.05;

    if (
      language.toLowerCase() ===
      "malayalam"
    ) {
      utterance.lang = "ml-IN";
    } else {
      utterance.lang = "en-US";
    }

    utterance.onstart = () => {
      setPlayingStory(story.id);
    };

    utterance.onend = () => {
      setPlayingStory(null);

      /*
       * Practice section appears only after
       * the story has finished being heard.
       */
      setShowPractice(true);
    };

    utterance.onerror = () => {
      setPlayingStory(null);
    };

    window.speechSynthesis.speak(
      utterance
    );

    /*
     * Story XP is awarded only once.
     */
    if (!heardStories[story.id]) {
      listenToStory();

      setHeardStories((previous) => ({
        ...previous,
        [story.id]: true,
      }));
    }

    setSelectedStory(story);

    /*
     * Also reveal practice after clicking Hear.
     * This makes the UI responsive even if the
     * browser finishes speech very quickly.
     */
    setShowPractice(true);

    setMessage(
      "🎧 Listen carefully! Your practice words will appear below."
    );
  };

  /*
   * Stop story playback.
   */
  const stopStory = () => {
    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    setPlayingStory(null);
  };

  /*
   * Hear one practice word.
   */
  const hearWord = (word) => {
    if (
      !("speechSynthesis" in window)
    ) {
      setMessage(
        "Speech playback is not supported in this browser."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(word);

    utterance.rate = 0.75;
    utterance.pitch = 1.1;

    utterance.lang =
      language.toLowerCase() ===
      "malayalam"
        ? "ml-IN"
        : "en-US";

    window.speechSynthesis.speak(
      utterance
    );

    setSelectedWord(word);

    /*
     * +10 XP for hearing the practice word,
     * only once per word.
     */
    if (!heardWords[word]) {
      hearPracticeWord();

      setHeardWords((previous) => ({
        ...previous,
        [word]: true,
      }));
    }

    setMessage(
      `🎧 Listen, then say "${word}".`
    );
  };

  /*
   * Say a practice word into the microphone.
   */
  const sayWord = (word) => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessage(
        "Speech recognition is not supported in this browser. Please use Chrome."
      );
      return;
    }

    setSelectedWord(word);
    setIsListening(true);

    setMessage(
      `🎤 Listening... say "${word}".`
    );

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      language.toLowerCase() ===
      "malayalam"
        ? "ml-IN"
        : "en-US";

    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      const spoken =
        event.results[0][0].transcript;

      const spokenClean =
        normalize(spoken);

      const targetClean =
        normalize(word);

      /*
       * Exact word match or the word appears
       * inside the spoken result.
       */
      const correct =
        spokenClean === targetClean ||
        spokenClean.includes(
          targetClean
        );

      if (correct) {
        /*
         * +15 XP for a correct spoken word.
         *
         * Only awarded once per word.
         */
        if (!correctWords[word]) {
          practiceSpeechWord();

          setCorrectWords((previous) => ({
            ...previous,
            [word]: true,
          }));
        }

        setMessage(
          `🌟 Great job! You said "${word}" correctly! +15 XP`
        );
      } else {
        setMessage(
          `I heard "${spoken}". Nice try! Let's try "${word}" again.`
        );
      }
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      if (
        event.error ===
        "not-allowed"
      ) {
        setMessage(
          "🎤 Please allow microphone access to practise speaking."
        );
      } else {
        setMessage(
          `I couldn't hear "${word}" clearly. Please try again.`
        );
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error(error);
      setIsListening(false);
    }
  };

  const totalSpeechXP =
    Object.keys(heardWords).length *
      10 +
    Object.keys(correctWords).length *
      15;

  return (
    <div className="ai-stories-page">

      {/* ================= HEADER ================= */}

      <header className="stories-topbar">
        <Link
          to="/"
          className="melodic-logo"
          aria-label="Go to Melodic Voice homepage"
        >
          <span className="melodic-logo-icon">
            🎵
          </span>

          <span className="melodic-logo-text">
            <strong>
              Melodic Voice
            </strong>

            <small>
              The Gift of Connection
            </small>
          </span>
        </Link>

        <div className="xp-pill">
          ⭐ {xp} XP
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="stories-container">

        {/* INTRO */}

        <section className="stories-intro">

          <div className="book-icon">
            📖
          </div>

          <h1>
            AI Stories
          </h1>

          <p>
            New stories made especially for{" "}
            <strong>
              {childName}
            </strong>
            .
          </p>

          <div className="practice-target">
            🎯 Practising{" "}
            {getTargetLabel(
              difficulty
            )}
          </div>

          <button
            type="button"
            className="new-stories-button"
            onClick={
              generateNewStories
            }
            disabled={
              isGenerating
            }
          >
            ✨{" "}
            {isGenerating
              ? "Creating your stories..."
              : "Create New AI Stories"}
          </button>

        </section>

        {/* CHILD INFO */}

        <section className="child-info-card">

          <div>
            <span>👧</span>
            <small>Child</small>
            <strong>
              {childName}
            </strong>
          </div>

          <div>
            <span>🎯</span>
            <small>
              Speech target
            </small>
            <strong>
              {getTargetLabel(
                difficulty
              )}
            </strong>
          </div>

          <div>
            <span>🌈</span>
            <small>Theme</small>
            <strong>
              {theme}
            </strong>
          </div>

        </section>

        {/* MESSAGE */}

        {message && (
          <div
            className="stories-message"
            role="status"
            aria-live="polite"
          >
            {message}
          </div>
        )}

        {/* INSTRUCTION */}

        <div className="listen-instruction">
          🎧{" "}
          <strong>
            Listen first
          </strong>

          <span>
            Hear a story, then practise the
            difficult words from it.
          </span>
        </div>

        {/* ================= STORIES ================= */}

        <section className="stories-grid">

          {stories.map(
            (story, index) => {

              const isPlaying =
                playingStory ===
                story.id;

              const hasHeard =
                heardStories[
                  story.id
                ];

              return (
                <article
                  key={story.id}
                  className={`story-card ${
                    selectedStory?.id ===
                    story.id
                      ? "selected"
                      : ""
                  }`}
                >

                  <div className="story-number">
                    Story {index + 1}
                  </div>

                  <div className="story-icon">
                    {story.icon}
                  </div>

                  <h2>
                    {story.title}
                  </h2>

                  <div className="story-theme">
                    {story.theme}
                  </div>

                  <p className="story-description">
                    {story.description}
                  </p>

                  <div className="story-target">
                    🎯{" "}
                    {getTargetLabel(
                      difficulty
                    )}
                  </div>

                  <div className="story-actions">

                    <button
                      type="button"
                      className="hear-story-button"
                      onClick={() =>
                        hearStory(
                          story
                        )
                      }
                    >
                      {isPlaying
                        ? "🔊 Playing..."
                        : "▶ Hear Story"}
                    </button>

                    {isPlaying && (
                      <button
                        type="button"
                        className="stop-story-button"
                        onClick={
                          stopStory
                        }
                      >
                        ■ Stop
                      </button>
                    )}

                  </div>

                  {hasHeard && (
                    <div className="story-xp">
                      ✓ Story heard · +20 XP
                    </div>
                  )}

                  <details className="parent-story">
                    <summary>
                      👨‍👩‍👧 Parent view: Read story
                    </summary>

                    <p>
                      {story.content}
                    </p>
                  </details>

                </article>
              );
            }
          )}

        </section>

        {/* ================= PRACTICE ================= */}

        {showPractice && (
          <section className="practice-section">

            <div className="practice-header">
              <div className="practice-icon">
                🎤
              </div>

              <div>
                <h2>
                  Let's Practise!
                </h2>

                <p>
                  These words came from the
                  story you just heard.
                </p>
              </div>
            </div>

            <div className="practice-target-box">
              <span>
                Today's speech target
              </span>

              <strong>
                {getTargetLabel(
                  difficulty
                )}
              </strong>
            </div>

            <div className="practice-word-grid">

              {practiceWords.map(
                (word, index) => {

                  const heard =
                    heardWords[word];

                  const correct =
                    correctWords[word];

                  return (
                    <div
                      key={word}
                      className={`practice-word-card ${
                        selectedWord ===
                        word
                          ? "active"
                          : ""
                      } ${
                        correct
                          ? "correct"
                          : ""
                      }`}
                    >

                      <div className="word-number">
                        {index + 1}
                      </div>

                      <div className="practice-word">
                        {word}
                      </div>

                      <button
                        type="button"
                        className="hear-word-button"
                        onClick={() =>
                          hearWord(
                            word
                          )
                        }
                      >
                        🔊 Hear
                      </button>

                      <button
                        type="button"
                        className="say-word-button"
                        onClick={() =>
                          sayWord(
                            word
                          )
                        }
                        disabled={
                          isListening &&
                          selectedWord ===
                            word
                        }
                      >
                        🎤{" "}
                        {isListening &&
                        selectedWord ===
                          word
                          ? "Listening..."
                          : "Say It"}
                      </button>

                      <div className="word-xp">
                        +10 XP listening
                        <br />
                        +15 XP if correct
                      </div>

                      {heard && (
                        <div className="heard-badge">
                          ✓ Heard
                        </div>
                      )}

                      {correct && (
                        <div className="correct-badge">
                          🌟 Correct!
                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>

            {/* XP SUMMARY */}

            <div className="speech-xp-summary">

              <div>
                <span>
                  🎧 Words heard
                </span>

                <strong>
                  +
                  {Object.keys(
                    heardWords
                  ).length * 10}{" "}
                  XP
                </strong>
              </div>

              <div>
                <span>
                  🎤 Correct words
                </span>

                <strong>
                  +
                  {Object.keys(
                    correctWords
                  ).length * 15}{" "}
                  XP
                </strong>
              </div>

              <div className="total-xp">
                <span>
                  ✨ Speech XP
                </span>

                <strong>
                  +{totalSpeechXP} XP
                </strong>
              </div>

            </div>

            <p className="parent-note">
              👨‍👩‍👧 Speech recognition provides
              an approximate practice result.
              It is an encouraging learning activity,
              not a clinical speech assessment.
            </p>

          </section>
        )}

        {/* PRACTICE HIDDEN MESSAGE */}

        {!showPractice && (
          <section className="practice-coming">
            <div>
              🎧
            </div>

            <h2>
              Practice Words Come Next
            </h2>

            <p>
              Listen to a story first.
              Then the AI-generated words
              from that story will appear here.
            </p>
          </section>
        )}

      </main>
    </div>
  );
}