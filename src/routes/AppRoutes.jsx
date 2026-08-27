import { Routes, Route } from "react-router-dom";
import App from "../App";
import Dashboard from "../pages/Dashboard";
import HealthCheck from "../pages/HealthCheck";
import AIChat from "../pages/AIChat";
import AIStories from "../pages/AIStories";
import AISongs from "../pages/AISongs";
import Settings from "../pages/Settings";

function Placeholder({ title }) {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>{title}</h1>
      <p>Placeholder page</p>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/health" element={<HealthCheck />} />
      <Route path="/chat" element={<AIChat />} />
      <Route path="/child-profile" element={<Placeholder title="Child Profile" />} />
      <Route path="/speech-assessment" element={<Placeholder title="Speech Assessment" />} />
      <Route path="/ai-stories" element={<AIStories />} />
      <Route path="/ai-songs" element={<AISongs />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}