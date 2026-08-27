import { useNavigate } from "react-router-dom";
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

  // Determine avatar based on gender
  const avatarImage =
    data.gender === "girl"
      ? "/images/Girl.png"
      : "/images/Boy.png";

  // Determine hero theme based on gender
  const heroTheme =
    data.gender === "girl"
      ? {
          greeting: "Your voice is pure magic",
          heroImage: "/images/palace.png",
          gradient: "linear-gradient(135deg, #ffe2f0, #e8e3ff 52%, #d8f1ff)",
        }
      : {
          greeting: "Every word you say makes you stronger",
          heroImage: "/images/together.png",
          gradient: "linear-gradient(135deg, #dce9ff, #d9e6ff 50%, #d7f4f0)",
        };

  // XP bar calculation
  const xpPercent = (xp % 500) / 5; // 0-100%

  const handleContinue = () => {
    if (!started) {
      startJourney();
    }
    navigate("/ai-stories");
  };

  const cards = [
    {
      title: "Speech Assessment",
      description: "Check your speaking skills and see how you're improving.",
      icon: Mic2,
      route: "/speech-assessment",
      color: "lilac",
    },
    {
      title: "AI Stories",
      description: "Magical stories created just for you to learn and enjoy.",
      icon: BookOpen,
      route: "/ai-stories",
      color: "blush",
    },
    {
      title: "AI Songs",
      description: "Fun songs to practice words, sounds and pronunciation.",
      icon: Music2,
      route: "/ai-songs",
      color: "sky",
    },
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-topbar">
          <div className="dash-profile">
            <img src={avatarImage} alt={data.firstName} className="dash-avatar" />
            <div>
              <strong>{data.firstName || "Child"}</strong>
              <small>⭐ Level {level}</small>
            </div>
          </div>
          <button
            className="dash-settings"
            onClick={() => navigate("/settings")}
            aria-label="Settings"
          >
            <Settings size={22} />
          </button>
        </div>

        {/* XP Bar */}
        <div className="dash-xp-bar">
          <div className="xp-text">
            <span>{xp % 500} / 500 XP</span>
            <span className="xp-level">Level {level}</span>
          </div>
          <div className="xp-progress">
            <div className="xp-fill" style={{ width: `${xpPercent}%` }}></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="dash-hero" style={{ background: heroTheme.gradient }}>
        <div className="hero-content">
          <h1>{heroTheme.greeting}</h1>
          <p>Fun stories, songs and activities to build your confidence.</p>
          <button className="hero-button primary" onClick={handleContinue}>
            <span>🎯</span>
            {started ? "Continue" : "Start My Journey"}
          </button>
        </div>
        <div className="hero-image">
          <img src={heroTheme.heroImage} alt="Hero" />
        </div>
      </section>

      {/* Streak Card */}
      <div className="dash-streak">
        <span className="streak-icon">🔥</span>
        <div>
          <strong>{streak} Days</strong>
          <small>Keep it up!</small>
        </div>
      </div>

      {/* Three Main Cards */}
      <section className="dash-cards">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <a
              href={card.route}
              key={card.title}
              className={`dash-card dash-card--${card.color}`}
            >
              <div className="card-icon">
                <Icon size={28} />
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <span className="card-arrow">
                <ArrowRight size={16} />
              </span>
            </a>
          );
        })}
      </section>

      {/* Goals Section */}
      <section className="dash-goals">
        <div className="goals-title">
          <span>🎯</span>
          <strong>Today's Goals</strong>
        </div>

        <div className="goal-row">
          <span>Practice Speaking</span>
          <span className="goal-progress">
            {Math.min(15, 15)} / 15 min
          </span>
          <div className="goal-bar">
            <div className="goal-fill" style={{ width: "100%" }}></div>
          </div>
        </div>

        <div className="goal-row">
          <span>Listen to a Story</span>
          <span className="goal-progress">{1} / 1</span>
          <div className="goal-bar">
            <div className="goal-fill goal-fill--story" style={{ width: "100%" }}></div>
          </div>
        </div>

        <div className="goal-row">
          <span>Sing a Song</span>
          <span className="goal-progress">{0} / 1</span>
          <div className="goal-bar">
            <div className="goal-fill goal-fill--song" style={{ width: "0%" }}></div>
          </div>
        </div>
      </section>
    </div>
  );
}