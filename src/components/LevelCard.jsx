import { useMelodic } from "../context/MelodicContext";

export default function LevelCard() {
  const { child } = useMelodic();

  return (
    <div className="level-card">
      <h3>Level {child.level}</h3>

      <span>{child.level === 1 ? "Not Yet" : "Yet"}</span>

      <p>🔥 {child.streak} Day Streak</p>
    </div>
  );
}