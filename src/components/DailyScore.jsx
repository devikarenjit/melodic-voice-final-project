import { useMelodic } from "../context/MelodicContext";

export default function DailyScore() {
  const { child } = useMelodic();

  return (
    <div className="score-card">
      <h3>Today's Performance</h3>

      <h1>{child.dailyScore}</h1>

      <p>Your own progress today.</p>
    </div>
  );
}