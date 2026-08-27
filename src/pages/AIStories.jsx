import { useState } from "react";
import { useProgress } from "../context/ProgressContext";
import "./AIStories.css";

const STORIES = [
  {
    id: 1,
    title: "The Singing Fox",
    theme: "Fantasy",
    words: ["fox", "melody", "forest", "magic"],
  },
  {
    id: 2,
    title: "Luna's Journey",
    theme: "Adventure",
    words: ["moon", "star", "journey", "discover"],
  },
  {
    id: 3,
    title: "Sunshine & Rain",
    theme: "Nature",
    words: ["sun", "rain", "cloud", "rainbow"],
  },
];

export default function AIStories() {
  const { listenToStory } = useProgress();
  const [completed, setCompleted] = useState({});

  const handleListen = (storyId) => {
    if (!completed[storyId]) {
      listenToStory();
      setCompleted({ ...completed, [storyId]: true });
    }
  };

  return (
    <div className="ai-stories">
      <header className="stories-header">
        <h1>AI Stories</h1>
        <p>Magical stories created just for you to learn and enjoy.</p>
      </header>

      <section className="stories-grid">
        {STORIES.map((story) => (
          <div key={story.id} className="story-card">
            <div className="story-art">📖</div>
            <h3>{story.title}</h3>
            <p className="story-theme">{story.theme}</p>
            <p className="story-words">
              {story.words.join(" • ")}
            </p>
            <button
              className={`story-button ${completed[story.id] ? "completed" : ""}`}
              onClick={() => handleListen(story.id)}
              disabled={completed[story.id]}
            >
              {completed[story.id] ? (
                <>✓ Listened (+20 XP)</>
              ) : (
                <>▶ Listen</>
              )}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
