import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Music2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useOnboarding } from "../context/OnboardingContext";
import "./Continue.css";

export default function Continue() {
  const navigate = useNavigate();

  const { data } = useOnboarding();

  const childName =
    data?.firstName || "friend";

  return (
    <main className="continue-page">

      {/* Back */}

      <button
        className="continue-back"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>


      {/* Header */}

      <section className="continue-header">

        <div className="continue-sparkle">
          ✨
        </div>

        <h1>
          What would you like to do?
        </h1>

        <p>
          Hi {childName}! Choose a fun activity
          to practice your special sounds and words.
        </p>

      </section>


      {/* Options */}

      <section className="continue-options">

        {/* SONG */}

        <button
          className="continue-option continue-option--song"
          onClick={() => navigate("/ai-songs")}
        >

          <div className="continue-icon">
            <Music2 size={48} />
          </div>

          <div className="continue-option-content">

            <span className="continue-label">
              🎵 AI SONGS
            </span>

            <h2>
              Sing with your practice words!
            </h2>

            <p>
              Listen to a personalized song
              with words chosen for the sounds
              you are practicing.
            </p>

          </div>

          <span className="continue-action">
            Play my song
            <ArrowRight size={20} />
          </span>

        </button>


        {/* STORIES */}

        <button
          className="continue-option continue-option--story"
          onClick={() => navigate("/ai-stories")}
        >

          <div className="continue-icon">
            <BookOpen size={48} />
          </div>

          <div className="continue-option-content">

            <span className="continue-label">
              📖 AI STORIES
            </span>

            <h2>
              Hear a story made for you!
            </h2>

            <p>
              Listen to a playful story that
              repeats your practice sounds
              and words naturally.
            </p>

          </div>

          <span className="continue-action">
            Hear my story
            <ArrowRight size={20} />
          </span>

        </button>

      </section>

    </main>
  );
}