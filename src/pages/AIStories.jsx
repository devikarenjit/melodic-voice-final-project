import { useEffect, useMemo, useState } from "react";
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
      "A little rabbit ran through the bright forest. The rabbit saw a rainbow over the river. It raced past a red rocket and roared with joy when it reached the rainbow.",
  },
  {
    id: 2,
    title: "The Rocket Race",
    theme: "Space Adventure",
    icon: "🚀",
    description:
      "A brave little explorer takes a rocket ride across the stars.",
    content:
      "A brave explorer climbed into a rocket. The rocket raced around the red moon and flew past a sparkling star. The explorer laughed and shouted as the rocket returned home.",
  },
  {
    id: 3,
    title: "The Roaring River",
    theme: "Nature",
    icon: "🌈",
    description:
      "A magical river leads to a rainbow hidden behind the hills.",
    content:
      "A little river ran between green hills. A rabbit followed the river and heard a gentle roar. At the end of the path, a beautiful rainbow appeared in the sky.",
  },
];

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim();
}

function containsTargetSound(word, target) {
  if (!target) return true;

  const cleanWord = normalize(word);
  const cleanTarget = normalize(target);

  if (!cleanTarget) return true;

  return cleanWord.includes(cleanTarget);
}

function getTargetLabel(target) {
  if (!target) return "your special sound";

  return `"${target}"`;
}

function extractJsonPayload(rawText) {
  const cleaned = String(rawText || "")
    .replace(/event:\s*.*\n/g, "")
    .replace(/data:\s*/g, "")
    .trim();

  if (!cleaned) return "";

  const textMatches = [
    ...cleaned.matchAll(/"text"\s*:\s*"((?:\\.|[^"\\])*)"/g),
  ];

  const textPayload = textMatches
    .map((match) => {
      try {
        return JSON.parse(`"${match[1]}"`);
      } catch {
        return match[1];
      }
    })
    .join("");

  if (textPayload) {
    const start = textPayload.indexOf("[");
    const end = textPayload.lastIndexOf("]");

    if (start !== -1 && end > start) {
      return textPayload.slice(start, end + 1);
    }

    return textPayload;
  }

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start !== -1 && end > start) {
    return cleaned.slice(start, end + 1);
  }

  return cleaned;
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

  const age = data?.age || data?.childAge || "your age";

  const difficulty =
    data?.difficultWords?.trim() ||
    data?.speechSound?.trim() ||
    data?.practiceSound?.trim() ||
    "r";

  const theme = data?.storyTheme || "Adventure";

  const [stories, setStories] = useState(FALLBACK_STORIES);
  const [selectedStory, setSelectedStory] = useState(null);
  const [heardStories, setHeardStories] = useState({});
  const [playingStory, setPlayingStory] = useState(null);
  const [practiceWords, setPracticeWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [heardWords, setHeardWords] = useState({});
  const [correctWords, setCorrectWords] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  /*
   * Generate the practice words through the AI server.
   * There is intentionally NO hard-coded word bank here.
   */
  const generatePracticeWords = async () => {
    try {
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `
Create 8 child-friendly speech practice words.

Child age: ${age}
Difficult sound, letter, or speech target: ${difficulty}
Language: ${data?.primaryLanguage || "English"}

Rules:
- Every word must genuinely contain the difficult target.
- Use words appropriate for the child's age.
- Prefer concrete, familiar words a young child can understand.
- Do not simply repeat the target letter by itself.
- Do not return a word bank from memory.
- Generate the words specifically for this child.
- Return ONLY a JSON array of 8 strings.
Example format:
["rabbit","rainbow","rocket","river","roar","rain","robot","red"]
              `,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("No AI response stream");
      }

      const decoder = new TextDecoder();
      let rawText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        rawText += decoder.decode(value, {
          stream: true,
        });
      }

      /*
       * Gemini SSE can contain multiple data chunks.
       * Extract text fields as safely as possible.
       */
      const generatedText = extractJsonPayload(rawText);

      if (!generatedText || !generatedText.includes("[")) {
        throw new Error("AI did not return a word list");
      }

      const parsed = JSON.parse(generatedText);

      const validWords = parsed
        .filter(
          (word) =>
            typeof word === "string" &&
            word.trim().length > 1 &&
            containsTargetSound(word, difficulty)
        )
        .map((word) => word.trim().toLowerCase())
        .filter(
          (word, index, array) =>
            array.indexOf(word) === index
        )
        .slice(0, 8);

      if (validWords.length >= 5) {
        setPracticeWords(validWords);
      }
    } catch (error) {
      console.error("AI practice-word generation failed:", error);

      /*
       * We deliberately do NOT insert a hard-coded word bank.
       * If AI is unavailable, show a helpful message instead.
       */
      setPracticeWords([]);
      setMessage(
        "Your AI practice words could not be generated right now. Make sure the AI server is running."
      );
    }
  };

  /*
   * Generate different stories through AI.
   */
  const generateStories = async () => {
    setIsGenerating(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `
Create exactly 3 genuinely different children's stories.

Child name: ${childName}
Child age: ${age}
Speech target: ${difficulty}
Preferred theme: ${theme}

Important:
- Each story must have a completely different plot.
- Do NOT create the same story with different titles.
- Use simple language appropriate for the child's age.
- Naturally include words containing the speech target.
- Do not make the speech target itself the only practice.
- Each story should be short enough for a child to listen to.
- Give each story a unique title related to its actual content.

Return ONLY valid JSON in this format:

[
  {
    "title": "Unique title",
    "theme": "Theme",
    "icon": "emoji",
    "description": "One sentence description",
    "content": "Short story"
  },
  {
    "title": "Different unique title",
    "theme": "Theme",
    "icon": "emoji",
    "description": "One sentence description",
    "content": "Different short story"
  },
  {
    "title": "Another unique title",
    "theme": "Theme",
    "icon": "emoji",
    "description": "One sentence description",
    "content": "Another different short story"
  }
]
              `,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Story generation failed");
      }

      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("No story stream");
      }

      const decoder = new TextDecoder();
      let rawText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        rawText += decoder.decode(value, {
          stream: true,
        });
      }

      const generatedText = extractJsonPayload(rawText);

      if (!generatedText || !generatedText.includes("[")) {
        throw new Error("AI did not return stories");
      }

      const parsedStories = JSON.parse(generatedText);

      if (
        Array.isArray(parsedStories) &&
        parsedStories.length >= 3
      ) {
        setStories(
          parsedStories.slice(0, 3).map((story, index) => ({
            id: index + 1,
            title: story.title,
            theme: story.theme || theme,
            icon: story.icon || ["🐰", "🚀", "🌈"][index],
            description: story.description,
            content: story.content,
          }))
        );
      }
    } catch (error) {
      console.error("AI story generation failed:", error);

      setMessage(
        "The AI could not create new stories right now. Showing the saved stories instead."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateStories();
    generatePracticeWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const targetWords = useMemo(
    () =>
      practiceWords.filter((word) =>
        containsTargetSound(word, difficulty)
      ),
    [practiceWords, difficulty]
  );

  /*
   * Speak a story using the browser's speech synthesis.
   */
  const hearStory = (story) => {
    if (!("speechSynthesis" in window)) {
      setMessage("Speech playback is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      story.content
    );

    utterance.rate = 0.85;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      setPlayingStory(story.id);
    };

    utterance.onend = () => {
      setPlayingStory(null);
    };

    utterance.onerror = () => {
      setPlayingStory(null);
    };

    window.speechSynthesis.speak(utterance);

    /*
     * Story XP is awarded only once per story.
     */
    if (!heardStories[story.id]) {
      listenToStory();
      setHeardStories((previous) => ({
        ...previous,
        [story.id]: true,
      }));
    }

    setSelectedStory(story);
    setMessage(
      "Great listening! Now practise the difficult words from the story."
    );
  };

  const stopStory = () => {
    window.speechSynthesis.cancel();
    setPlayingStory(null);
  };

  /*
   * Hear an individual AI-generated practice word.
   * +10 XP the first time the child hears that word.
   */
  const hearWord = (word) => {
    if (!("speechSynthesis" in window)) {
      setMessage("Speech playback is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);

    utterance.rate = 0.75;
    utterance.pitch = 1.1;

    window.speechSynthesis.speak(utterance);

    setSelectedWord(word);

    if (!heardWords[word]) {
      hearPracticeWord();
      setHeardWords((previous) => ({
        ...previous,
        [word]: true,
      }));
    }

    setMessage(`Listen carefully, then say "${word}".`);
  };

  /*
   * Speech recognition.
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
    setMessage(`Listening... say "${word}".`);

    const recognition = new SpeechRecognition();

    recognition.lang =
      data?.primaryLanguage === "Malayalam"
        ? "ml-IN"
        : "en-US";

    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      const spokenClean = normalize(spoken);
      const targetClean = normalize(word);

      const correct =
        spokenClean === targetClean ||
        spokenClean.includes(targetClean);

      if (correct) {
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
          `I heard "${spoken}". Nice try! Say "${word}" again.`
        );
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      if (event.error === "not-allowed") {
        setMessage(
          "Please allow microphone access so you can practise speaking."
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

    recognition.start();
  };

  return (
    <div className="ai-stories-page">
      {/* HOME / LOGO HEADER */}
      <header className="stories-topbar">
        <Link to="/" className="melodic-logo" aria-label="Go to homepage">
          <span className="melodic-logo-icon">🎵</span>

          <span>
            <strong>Melodic Voice</strong>
            <small>The Gift of Connection</small>
          </span>
        </Link>

        <div className="xp-pill">
          ⭐ {xp} XP
        </div>
      </header>

      <main className="stories-container">
        <section className="stories-intro">
          <div className="book-icon">📖</div>

          <h1>AI Stories</h1>

          <p>
            New stories made especially for{" "}
            <strong>{childName}</strong>.
          </p>

          <div className="practice-target">
            🎯 Practising {getTargetLabel(difficulty)}
          </div>

          <button
            className="new-stories-button"
            onClick={() => {
              generateStories();
              generatePracticeWords();
            }}
            disabled={isGenerating}
          >
            ✨ {isGenerating ? "Creating..." : "Create New AI Stories"}
          </button>
        </section>

        <section className="child-info-card">
          <div>
            <span>👧</span>
            <small>Child</small>
            <strong>{childName}</strong>
          </div>

          <div>
            <span>🎂</span>
            <small>Age</small>
            <strong>{age}</strong>
          </div>

          <div>
            <span>🎯</span>
            <small>Speech target</small>
            <strong>{getTargetLabel(difficulty)}</strong>
          </div>

          <div>
            <span>🌈</span>
            <small>Theme</small>
            <strong>{theme}</strong>
          </div>
        </section>

        {message && (
          <div className="stories-message">
            {message}
          </div>
        )}

        <div className="listen-instruction">
          🎧 <strong>Listen first</strong>
          <span>
            Hear a story, then practise the difficult words below.
          </span>
        </div>

        {/* STORIES */}
        <section className="stories-grid">
          {stories.map((story, index) => {
            const isPlaying = playingStory === story.id;
            const hasHeard = heardStories[story.id];

            return (
              <article
                key={story.id}
                className={`story-card ${
                  selectedStory?.id === story.id
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

                <h2>{story.title}</h2>

                <div className="story-theme">
                  {story.theme}
                </div>

                <p className="story-description">
                  {story.description}
                </p>

                <div className="story-target">
                  🎯 {getTargetLabel(difficulty)}
                </div>

                <div className="story-actions">
                  <button
                    className="hear-story-button"
                    onClick={() =>
                      isPlaying
                        ? stopStory()
                        : hearStory(story)
                    }
                  >
                    {isPlaying
                      ? "■ Stop"
                      : hasHeard
                      ? "🔊 Hear Again"
                      : "▶ Hear Story"}
                  </button>
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

                  <p>{story.content}</p>
                </details>
              </article>
            );
          })}
        </section>

        {/* PRACTICE WORDS */}
        <section className="practice-card">
          <div className="practice-heading">
            <div className="practice-microphone">
              🎤
            </div>

            <div>
              <h2>Let's Practise!</h2>
              <p>
                Listen to each word, then say it aloud.
              </p>
            </div>
          </div>

          <div className="practice-target-box">
            <span>Today's speech target</span>
            <strong>{getTargetLabel(difficulty)}</strong>
          </div>

          {targetWords.length === 0 ? (
            <div className="practice-loading">
              <div className="loading-dot">✨</div>
              <strong>AI is creating your practice words...</strong>
              <p>
                The words will be chosen specifically for
                your speech target and age.
              </p>
            </div>
          ) : (
            <div className="practice-word-grid">
              {targetWords.map((word, index) => {
                const heard = heardWords[word];
                const correct = correctWords[word];

                return (
                  <div
                    key={word}
                    className={`practice-word-card ${
                      selectedWord === word
                        ? "active"
                        : ""
                    } ${
                      correct ? "correct" : ""
                    }`}
                  >
                    <div className="word-number">
                      {index + 1}
                    </div>

                    <div className="practice-word">
                      {word}
                    </div>

                    <button
                      className="hear-word-button"
                      onClick={() => hearWord(word)}
                    >
                      🔊 Hear
                    </button>

                    <button
                      className="say-word-button"
                      onClick={() => sayWord(word)}
                      disabled={isListening}
                    >
                      🎤 Say It
                    </button>

                    <div className="word-xp">
                      <span>+10 XP hearing</span>
                      <span>+15 XP correct</span>
                    </div>

                    {heard && (
                      <div className="heard-status">
                        ✓ Heard · +10 XP
                      </div>
                    )}

                    {correct && (
                      <div className="correct-status">
                        🌟 Correct · +15 XP
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="practice-total">
            <div>
              <span>⭐ Total Speech XP</span>
              <strong>{xp} XP</strong>
            </div>

            <p>
              Keep practising! Every word you hear and say
              helps build confidence.
            </p>
          </div>
        </section>

        <section className="parent-note">
          <strong>👨‍👩‍👧 Parent note</strong>

          <p>
            Practice words are generated by AI according to
            the child's age and speech target. They are
            selected from the story/practice context rather
            than being a fixed word bank.
          </p>

          <small>
            Speech recognition provides an approximate
            practice result. This is a learning activity,
            not a clinical speech assessment.
          </small>
        </section>
      </main>
    </div>
  );
}