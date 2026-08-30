import { Link, useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { useProgress } from "../context/ProgressContext";
import {
  Settings,
  BookOpen,
  Mic2,
  Music2,
  ArrowRight,
} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const { data } = useOnboarding();
  const { xp, level, streak, started, startJourney } = useProgress();
  const navigate = useNavigate();

  const isGirl = data.gender === "girl";

  const selectedProfileArt = data.profileArt || (isGirl ? "👧" : "🧒");

  const avatarImage = isGirl
    ? "/images/Girl.png"
    : "/images/Boy.png";

  const heroImage = isGirl
    ? "/images/palace.png"
    : "/images/together.png";

  const handleContinue = () => {
    if (!started) {
      startJourney();
    }

    navigate("/continue");
  };

  const cards = [
    {
      title: "Speech Assessment",
      description:
        "Check speaking skills and see progress.",
      icon: Mic2,
      route: "/speech-assessment",
      color: "lilac",
    },
    {
      title: "AI Stories",
      description:
        "Hear stories built around practice sounds and words.",
      icon: BookOpen,
      route: "/ai-stories",
      color: "blush",
    },
    {
      title: "AI Songs",
      description:
        "Listen and sing songs made for practice words.",
      icon: Music2,
      route: "/ai-songs",
      color: "sky",
    },
  ];

  return (
    <div className="dashboard">

      {/* ================= HEADER ================= */}

      <header className="dash-header">

        <div className="dash-brand-row">
          <Link to="/" className="dash-brand" aria-label="Go to homepage">
            <span className="dash-brand-icon">🎵</span>
            <div>
              <strong>Melodic Voice</strong>
              <small>The Gift of Connection</small>
            </div>
          </Link>
        </div>

        <div className="dash-topbar">

          <div className="dash-profile">

            {data.profileArt ? (
              <div className="dash-avatar dash-avatar--emoji" aria-label="Selected profile art">
                {selectedProfileArt}
              </div>
            ) : (
              <img
                src={avatarImage}
                alt="Child avatar"
                className="dash-avatar"
              />
            )}

            <div>
              <strong>
                {data.firstName || "Child"}
              </strong>

              <small>
                ⭐ Level {level}
              </small>
            </div>

          </div>

          <button
            className="dash-settings"
            onClick={() => navigate("/settings")}
            aria-label="Open settings"
          >
            <Settings size={22} />
          </button>

        </div>

        {/* XP BAR */}

        <div className="dash-xp-bar">

          <div className="xp-text">

            <span>
              {xp % 500} / 500 XP
            </span>

            <span className="xp-level">
              Level {level}
            </span>

          </div>

          <div
            className="xp-progress"
            aria-label={`${xp % 500} of 500 XP`}
          >

            <div
              className="xp-fill"
              style={{
                width: `${(xp % 500) / 5}%`,
              }}
            />

          </div>

        </div>

      </header>

      {/* ================= HERO ================= */}

      <section
        className={`dash-hero ${
          isGirl
            ? "dash-hero--girl"
            : "dash-hero--boy"
        }`}
        style={{
          backgroundImage: `url("${heroImage}")`,
        }}
      >

        <div className="hero-overlay" />

        <div className="hero-content">

          <span className="hero-kicker">
            ✨{" "}
            {started
              ? "Welcome back!"
              : "Your speech adventure starts here"}
          </span>

          <h1>
            {isGirl
              ? "Your voice is pure magic"
              : "Every word you say makes you stronger"}
          </h1>

          <p>
            Fun stories, songs and activities
            made around your speech practice.
          </p>

          <button
            className="hero-button primary"
            onClick={handleContinue}
          >

            <span>🎯</span>

            {started
              ? "Continue"
              : "Start My Journey"}

            <ArrowRight size={18} />

          </button>

        </div>

      </section>

      {/* ================= STREAK ================= */}

      <div className="dash-streak">

        <span className="streak-icon">
          🔥
        </span>

        <div>

          <strong>
            {streak} Day
            {streak === 1 ? "" : "s"} Streak
          </strong>

          <small>
            Keep your speaking adventure going!
          </small>

        </div>

      </div>

      {/* ================= QUICK ACTIVITIES ================= */}

      <section
        className="dash-cards"
        aria-label="Quick activities"
      >

        {cards.map((card) => {

          const Icon = card.icon;

          return (
            <button
              type="button"
              key={card.title}
              className={`dash-card dash-card--${card.color}`}
              onClick={() => navigate(card.route)}
            >

              <div className="card-icon">
                <Icon size={28} />
              </div>

              <h3>
                {card.title}
              </h3>

              <p>
                {card.description}
              </p>

              <span className="card-arrow">
                <ArrowRight size={18} />
              </span>

            </button>
          );

        })}

      </section>

      {/* ================= TODAY'S GOALS ================= */}

      <section className="dash-goals">

        <div className="goals-title">

          <span>🎯</span>

          <strong>
            Today's Goals
          </strong>

        </div>

        {/* Speaking */}

        <div className="goal-row">

          <span>
            Practice Speaking
          </span>

          <span className="goal-progress">
            15 / 15 min
          </span>

          <div className="goal-bar">

            <div
              className="goal-fill"
              style={{
                width: "100%",
              }}
            />

          </div>

        </div>

        {/* Story */}

        <div className="goal-row">

          <span>
            Listen to a Story
          </span>

          <span className="goal-progress">
            1 / 1
          </span>

          <div className="goal-bar">

            <div
              className="goal-fill goal-fill--story"
              style={{
                width: "100%",
              }}
            />

          </div>

        </div>

        {/* Song */}

        <div className="goal-row">

          <span>
            Sing a Song
          </span>

          <span className="goal-progress">
            0 / 1
          </span>

          <div className="goal-bar">

            <div
              className="goal-fill goal-fill--song"
              style={{
                width: "0%",
              }}
            />

          </div>

        </div>

      </section>

    </div>
  );
}