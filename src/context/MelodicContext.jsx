import { createContext, useContext, useState } from "react";

const MelodicContext = createContext();

export const useMelodic = () => useContext(MelodicContext);

export function MelodicProvider({ children }) {
  const [child, setChild] = useState({
    name: "Arjun",
    avatar: "boy",
    level: 1,
    xp: 0,
    started: false,
    streak: 0,
    dailyScore: 0
  });

  const [goals, setGoals] = useState({
    story: false,
    words: false,
    song: false
  });

  const addXP = (amount) => {
    setChild((prev) => ({
      ...prev,
      xp: Math.min(prev.xp + amount, 500),
      dailyScore: prev.dailyScore + amount
    }));
  };

  const startJourney = () =>
    setChild((prev) => ({ ...prev, started: true }));

  const completeGoal = (goal) =>
    setGoals((prev) => ({ ...prev, [goal]: true }));

  return (
    <MelodicContext.Provider
      value={{
        child,
        goals,
        addXP,
        startJourney,
        completeGoal
      }}
    >
      {children}
    </MelodicContext.Provider>
  );
}