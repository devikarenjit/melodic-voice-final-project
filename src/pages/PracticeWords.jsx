import { useNavigate } from "react-router-dom";
import { useMelodic } from "../context/MelodicContext";

export default function PracticeWords() {
  const navigate = useNavigate();
  const { addXP, completeGoal } = useMelodic();

  const finishPractice = () => {
    addXP(30);
    completeGoal("words");
    navigate("/song");
  };

  return (
    <div className="lesson-page">
      <h1>Practice Your Words</h1>

      <ul>
        <li>Moon</li>
        <li>Magical</li>
        <li>Glow</li>
      </ul>

      <button onClick={finishPractice}>
        Finished (+30 XP)
      </button>
    </div>
  );
}