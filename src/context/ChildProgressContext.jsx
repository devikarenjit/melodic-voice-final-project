import { createContext, useContext, useState } from "react";

const ChildProgressContext = createContext();

export function ChildProgressProvider({ children }) {
  const [progress, setProgress] = useState({
    hasStarted: false,
    level: 1,
    xp: 0,
    xpNeeded: 500,
    streak: 0,
    dailyScore: 0,
    lessonsCompleted: [],
    dailyGoals: {
      speech: 0,
      story: false,
      song: false,
    },
  });

  const startJourney = () => {
    setProgress((prev) => ({
      ...prev,
      hasStarted: true,
    }));
  };

  const addXP = (amount) => {
    setProgress((prev) => ({
      ...prev,
      xp: Math.min(prev.xp + amount, prev.xpNeeded),
      dailyScore: prev.dailyScore + amount,
    }));
  };

  return (
    <ChildProgressContext.Provider
      value={{ progress, startJourney, addXP, setProgress }}
    >
      {children}
    </ChildProgressContext.Provider>
  );
}

export function useChildProgress() {
  return useContext(ChildProgressContext);
}