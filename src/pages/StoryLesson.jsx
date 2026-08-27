import { useNavigate } from "react-router-dom";
import { useMelodic } from "../context/MelodicContext";

export default function StoryLesson() {
  const navigate = useNavigate();
  const { addXP, completeGoal } = useMelodic();

  const finishStory = () => {
    addXP(20);
    completeGoal("story");
    navigate("/practice");
  };

  return (
    <div className="lesson-page">
      <h1>The Magical Moon</h1>

      <p>
        Sam found a magical moon glowing above the forest...
      </p>

      <button onClick={finishStory}>
        Finish Story (+20 XP)
      </button>
    </div>
  );
}