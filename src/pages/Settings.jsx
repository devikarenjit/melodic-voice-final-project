import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { useProgress } from "../context/ProgressContext";
import { ArrowLeft } from "lucide-react";
import "./Settings.css";

export default function Settings() {
  const navigate = useNavigate();
  const { data, updateData } = useOnboarding();
  const { reminderTime, setReminderTime } = useProgress();

  const handleSave = () => {
    navigate("/dashboard");
  };

  return (
    <div className="settings">
      <header className="settings-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h1>Settings</h1>
      </header>

      <form className="settings-form">
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
            placeholder="Child's first name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            value={data.gender}
            onChange={(e) => updateData({ gender: e.target.value })}
          >
            <option value="">Select gender</option>
            <option value="girl">Girl</option>
            <option value="boy">Boy</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="reminderTime">Daily Reminder Time</label>
          <input
            id="reminderTime"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
          />
        </div>

        <button type="button" className="save-button" onClick={handleSave}>
          Save & Continue
        </button>
      </form>
    </div>
  );
}
