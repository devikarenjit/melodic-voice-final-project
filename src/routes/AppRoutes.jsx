import {
  Link,
  Routes,
  Route,
} from "react-router-dom";

import App from "../App";

import Dashboard from "../pages/Dashboard";
import HealthCheck from "../pages/HealthCheck";
import AIChat from "../pages/AIChat";
import AIStories from "../pages/AIStories";
import AISongs from "../pages/AISongs";
import Continue from "../pages/Continue";
import Settings from "../pages/Settings";
import SpeechAssessment from "../pages/SpeechAssessment";


function Placeholder({ title }) {

  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
      }}
    >

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#4f46e5", fontWeight: 700 }}>🏠 Home</Link>
      </div>

      <h1>
        {title}
      </h1>

      <p>
        Placeholder page
      </p>

    </div>
  );
}


export default function AppRoutes() {

  return (

    <Routes>

      {/* Home / Onboarding */}

      <Route
        path="/"
        element={<App />}
      />


      {/* Dashboard */}

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />


      {/* Priority 1:
          Continue Activity Selection */}

      <Route
        path="/continue"
        element={<Continue />}
      />


      {/* Other pages */}

      <Route
        path="/health"
        element={<HealthCheck />}
      />


      <Route
        path="/chat"
        element={<AIChat />}
      />


      <Route
        path="/child-profile"
        element={
          <Placeholder
            title="Child Profile"
          />
        }
      />


      <Route
        path="/speech-assessment"
        element={<SpeechAssessment />}
      />


      {/* AI Stories */}

      <Route
        path="/ai-stories"
        element={<AIStories />}
      />


      {/* AI Songs */}

      <Route
        path="/ai-songs"
        element={<AISongs />}
      />


      {/* Settings */}

      <Route
        path="/settings"
        element={<Settings />}
      />

    </Routes>

  );
}