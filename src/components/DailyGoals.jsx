import { useMelodic } from "../context/MelodicContext";

export default function DailyGoals() {
  const { goals } = useMelodic();

  return (
    <div className="goals-card">
      <h3>Today's Goals</h3>

      <p>{goals.story ? "✅" : "⬜"} Listen to Story</p>
      <p>{goals.words ? "✅" : "⬜"} Practice Words</p>
      <p>{goals.song ? "✅" : "⬜"} Sing Song</p>
    </div>
  );
}