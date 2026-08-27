import { createContext, useContext, useState, useEffect } from "react";

const ProgressContext = createContext();

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("melodic-progress");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // If saved data is corrupted, use the default progress.
      }
    }

    return {
      xp: 0,
      streak: 1,
      started: false,

      dailyGoals: {
        practiceMinutes: {
          current: 0,
          target: 15,
        },
        listenStory: {
          current: 0,
          target: 1,
        },
        singSong: {
          current: 0,
          target: 1,
        },
      },

      reminderTime: "17:00",
      lastPracticeDate: null,
    };
  });

  // Save progress whenever it changes
  useEffect(() => {
    localStorage.setItem("melodic-progress", JSON.stringify(progress));
  }, [progress]);

  // Request notification permission
  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  // Reminder notification
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      const currentTime = `${String(now.getHours()).padStart(
        2,
        "0"
      )}:${String(now.getMinutes()).padStart(2, "0")}`;

      const today = now.toISOString().split("T")[0];

      const hasNotPracticedToday =
        progress.lastPracticeDate !== today;

      if (
        currentTime === progress.reminderTime &&
        hasNotPracticedToday &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("Melodic Voice Reminder", {
          body: "Time to practice! Open the app and complete your goals.",
          icon: "/favicon.ico",
        });
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [progress.reminderTime, progress.lastPracticeDate]);

  // Reset daily goals when a new day starts
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    if (
      progress.lastPracticeDate &&
      progress.lastPracticeDate !== today
    ) {
      setProgress((prev) => ({
        ...prev,
        dailyGoals: {
          practiceMinutes: {
            current: 0,
            target: 15,
          },
          listenStory: {
            current: 0,
            target: 1,
          },
          singSong: {
            current: 0,
            target: 1,
          },
        },
      }));
    }
  }, [progress.lastPracticeDate]);

  // Calculate level from XP
  const level = Math.floor(progress.xp / 500) + 1;

  // Listen to a story
  const listenToStory = () => {
    const today = new Date().toISOString().split("T")[0];

    setProgress((prev) => {
      const newGoals = {
        ...prev.dailyGoals,
        listenStory: {
          ...prev.dailyGoals.listenStory,
        },
      };

      if (
        newGoals.listenStory.current <
        newGoals.listenStory.target
      ) {
        newGoals.listenStory.current += 1;
      }

      return {
        ...prev,
        xp: prev.xp + 20,
        started: true,
        lastPracticeDate: today,
        dailyGoals: newGoals,
      };
    });
  };

  // Listen to an AI song
  // Listening earns +10 XP but does NOT complete the singing goal.
  const listenToSong = () => {
    const today = new Date().toISOString().split("T")[0];

    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + 10,
      started: true,
      lastPracticeDate: today,
    }));
  };

  // Sing an AI song
  // Singing earns +20 XP and completes the daily singing goal.
  const singSong = () => {
    const today = new Date().toISOString().split("T")[0];

    setProgress((prev) => {
      const newGoals = {
        ...prev.dailyGoals,
        singSong: {
          ...prev.dailyGoals.singSong,
        },
      };

      if (
        newGoals.singSong.current <
        newGoals.singSong.target
      ) {
        newGoals.singSong.current += 1;
      }

      return {
        ...prev,
        xp: prev.xp + 20,
        started: true,
        lastPracticeDate: today,
        dailyGoals: newGoals,
      };
    });
  };

  // Practice words
  const practiceWords = (minutes) => {
    const today = new Date().toISOString().split("T")[0];

    setProgress((prev) => {
      const newGoals = {
        ...prev.dailyGoals,
        practiceMinutes: {
          ...prev.dailyGoals.practiceMinutes,
        },
      };

      const remaining =
        newGoals.practiceMinutes.target -
        newGoals.practiceMinutes.current;

      const toAdd = Math.min(minutes, remaining);

      newGoals.practiceMinutes.current += toAdd;

      return {
        ...prev,
        xp: prev.xp + minutes * 2,
        started: true,
        lastPracticeDate: today,
        dailyGoals: newGoals,
      };
    });
  };

  // Start the child's learning journey
  const startJourney = () => {
    setProgress((prev) => ({
      ...prev,
      started: true,
    }));
  };

  // Change reminder time
  const setReminderTime = (time) => {
    setProgress((prev) => ({
      ...prev,
      reminderTime: time,
    }));
  };

  return (
    <ProgressContext.Provider
      value={{
        ...progress,
        level,
        listenToStory,
        listenToSong,
        singSong,
        practiceWords,
        startJourney,
        setReminderTime,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);

  if (!ctx) {
    throw new Error(
      "useProgress must be used inside ProgressProvider"
    );
  }

  return ctx;
}