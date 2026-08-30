import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <nav className="main-navigation">
      <Link
        to="/"
        className="navigation-logo"
        aria-label="Go to Melodic Voice homepage"
      >
        <span className="navigation-logo-icon">
          🎵
        </span>

        <span>
          <strong>Melodic Voice</strong>
          <small>The Gift of Connection</small>
        </span>
      </Link>

      <div className="navigation-links">
        <Link to="/child-profile">
          Child Profile
        </Link>

        <Link to="/speech-assessment">
          Speech Assessment
        </Link>

        <Link to="/ai-stories">
          AI Stories
        </Link>

        <Link to="/ai-songs">
          AI Songs
        </Link>

        <Link to="/progress">
          Progress
        </Link>

        <Link to="/health">
          Health
        </Link>
      </div>
    </nav>
  );
}