import { useMelodic } from "../context/MelodicContext";

export default function XPBar() {
  const { child } = useMelodic();

  return (
    <div className="xp-card">
      <p>⭐ You're doing great!</p>

      <div className="xp-track">
        <div
          className="xp-fill"
          style={{ width: `${(child.xp / 500) * 100}%` }}
        />
      </div>

      <strong>{child.xp}/500 XP</strong>
    </div>
  );
}