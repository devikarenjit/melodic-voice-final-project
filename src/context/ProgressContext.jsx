import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ProgressContext = createContext();

const DEFAULT_PROGRESS = {
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

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem(
      "melodic-progress"
    );

    if (saved) {
      try {
        return {
          ...DEFAULT_PROGRESS,
          ...JSON.parse(saved),
        };
      } catch {
        return DEFAULT_PROGRESS;
      }
    }

    return DEFAULT_PROGRESS;
  });

  /* Save progress */
  useEffect(() => {
    localStorage.setItem(
      "melodic-progress",
      JSON.stringify(progress)
    );
  }, [progress]);

  /* Notification permission */
  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  /* Reminder */
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      const currentTime = `${String(
        now.getHours()
      ).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

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
          body:
            "Time to practice! Open Melodic Voice and complete your goals.",
          icon: "/favicon.ico",
        });
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [
    progress.reminderTime,
    progress.lastPracticeDate,
  ]);

  /* Daily reset */
  useEffect(() => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    if (
      progress.lastPracticeDate &&
      progress.lastPracticeDate !== today
    ) {
      setProgress((previous) => ({
        ...previous,

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

  const level =
    Math.floor(progress.xp / 500) + 1;

  /* ---------------- STORIES ---------------- */

  const listenToStory = () => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    setProgress((previous) => {
      const listenGoal = {
        ...previous.dailyGoals.listenStory,
      };

      if (
        listenGoal.current <
        listenGoal.target
      ) {
        listenGoal.current += 1;
      }

      return {
        ...previous,

        xp: previous.xp + 20,

        started: true,

        lastPracticeDate: today,

        dailyGoals: {
          ...previous.dailyGoals,

          listenStory: listenGoal,
        },
      };
    });
  };

  /* ---------------- AI SONGS ---------------- */

  const listenToSong = () => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    setProgress((previous) => ({
      ...previous,

      xp: previous.xp + 10,

      started: true,

      lastPracticeDate: today,
    }));
  };

  const singSong = () => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    setProgress((previous) => {
      const singGoal = {
        ...previous.dailyGoals.singSong,
      };

      if (
        singGoal.current <
        singGoal.target
      ) {
        singGoal.current += 1;
      }

      return {
        ...previous,

        xp: previous.xp + 20,

        started: true,

        lastPracticeDate: today,

        dailyGoals: {
          ...previous.dailyGoals,

          singSong: singGoal,
        },
      };
    });
  };

  /* ---------------- PRACTICE MINUTES ---------------- */

  const practiceWords = (minutes) => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    setProgress((previous) => {
      const practiceGoal = {
        ...previous.dailyGoals.practiceMinutes,
      };

      const remaining =
        practiceGoal.target -
        practiceGoal.current;

      const toAdd = Math.min(
        minutes,
        remaining
      );

      practiceGoal.current += toAdd;

      return {
        ...previous,

        xp: previous.xp + minutes * 2,

        started: true,

        lastPracticeDate: today,

        dailyGoals: {
          ...previous.dailyGoals,

          practiceMinutes: practiceGoal,
        },
      };
    });
  };

  /* ---------------- NEW SPEECH XP ---------------- */

  /*
   * Child hears an AI-generated practice word.
   *
   * +10 XP
   */
  const hearPracticeWord = () => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    setProgress((previous) => ({
      ...previous,

      xp: previous.xp + 10,

      started: true,

      lastPracticeDate: today,
    }));
  };

  /*
   * Child says the difficult word correctly.
   *
   * +15 XP
   */
  const practiceSpeechWord = () => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    setProgress((previous) => ({
      ...previous,

      xp: previous.xp + 15,

      started: true,

      lastPracticeDate: today,
    }));
  };

  /* ---------------- JOURNEY ---------------- */

  const startJourney = () => {
    setProgress((previous) => ({
      ...previous,
      started: true,
    }));
  };

  /* ---------------- REMINDER ---------------- */

  const setReminderTime = (time) => {
    setProgress((previous) => ({
      ...previous,
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

        hearPracticeWord,

        practiceSpeechWord,

        startJourney,

        setReminderTime,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(
    ProgressContext
  );

  if (!context) {
    throw new Error(
      "useProgress must be used inside ProgressProvider"
    );
  }

  return context;
}