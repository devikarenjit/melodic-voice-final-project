import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ProgressContext = createContext();

const DEFAULT_PROGRESS = {
  xp: 0,

  streak: 0,

  started: false,

  lastActiveDate: null,

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

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPreviousDateKey(date = new Date()) {
  const previous = new Date(date);

  previous.setDate(
    previous.getDate() - 1
  );

  return getLocalDateKey(previous);
}

function getDayDifferenceInDays(fromKey, toKey) {
  if (!fromKey || !toKey) {
    return 0;
  }

  const fromDate = new Date(`${fromKey}T00:00:00`);
  const toDate = new Date(`${toKey}T00:00:00`);

  const diffMs = toDate.getTime() - fromDate.getTime();

  return Math.round(diffMs / 86400000);
}

export function ProgressProvider({
  children,
}) {
  const [progress, setProgress] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "melodic-progress"
        );

      if (saved) {
        try {
          const parsed =
            JSON.parse(saved);

          return {
            ...DEFAULT_PROGRESS,
            ...parsed,

            dailyGoals: {
              ...DEFAULT_PROGRESS.dailyGoals,
              ...(parsed.dailyGoals || {}),
            },
          };
        } catch {
          return DEFAULT_PROGRESS;
        }
      }

      return DEFAULT_PROGRESS;
    });

  /*
   * Save progress.
   */
  useEffect(() => {
    localStorage.setItem(
      "melodic-progress",
      JSON.stringify(progress)
    );
  }, [progress]);

  /*
   * Update the streak whenever the app
   * becomes active.
   *
   * Same day:
   *   keep the streak.
   *
   * Yesterday:
   *   increase the streak by 1.
   *
   * Older than yesterday:
   *   start a new streak at 1.
   */
  const recordDailyActivity =
    () => {
      const today =
        getLocalDateKey();

      setProgress(
        (previous) => {
          if (
            previous.lastActiveDate ===
            today
          ) {
            return {
              ...previous,
              started: true,
            };
          }

          const yesterday =
            getPreviousDateKey();

          const dayGap =
            previous.lastActiveDate
              ? getDayDifferenceInDays(
                  previous.lastActiveDate,
                  today
                )
              : 0;

          let newStreak = 1;

          if (
            previous.lastActiveDate ===
            yesterday
          ) {
            newStreak =
              (previous.streak || 0) +
              1;
          }

          if (dayGap > 1) {
            newStreak = 1;
          }

          return {
            ...previous,

            streak: newStreak,

            lastActiveDate: today,

            lastPracticeDate: today,

            started: true,
          };
        }
      );
    };

  /*
   * Mark today's activity when the app
   * is used.
   */
  useEffect(() => {
    recordDailyActivity();

    // Only when provider first loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Reset daily goals when a new day begins.
   */
  useEffect(() => {
    const today =
      getLocalDateKey();

    if (
      progress.lastPracticeDate &&
      progress.lastPracticeDate !==
        today
    ) {
      setProgress(
        (previous) => ({
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
        })
      );
    }
  }, [
    progress.lastPracticeDate,
  ]);

  useEffect(() => {
    const today = getLocalDateKey();

    if (
      progress.lastActiveDate &&
      getDayDifferenceInDays(
        progress.lastActiveDate,
        today
      ) > 1
    ) {
      setProgress((previous) => ({
        ...previous,
        streak: 0,
      }));
    }
  }, [progress.lastActiveDate]);

  /*
   * Notification permission.
   */
  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission ===
        "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  /*
   * Reminder.
   */
  useEffect(() => {
    const timer =
      setInterval(() => {
        const now = new Date();

        const currentTime =
          `${String(
            now.getHours()
          ).padStart(2, "0")}:${String(
            now.getMinutes()
          ).padStart(2, "0")}`;

        const today =
          getLocalDateKey();

        const hasNotPracticedToday =
          progress.lastPracticeDate !==
          today;

        if (
          currentTime ===
            progress.reminderTime &&
          hasNotPracticedToday &&
          "Notification" in window &&
          Notification.permission ===
            "granted"
        ) {
          new Notification(
            "Melodic Voice Reminder",
            {
              body:
                "Time to practise! Open Melodic Voice and complete your goals.",
              icon: "/favicon.ico",
            }
          );
        }
      }, 60000);

    return () =>
      clearInterval(timer);
  }, [
    progress.reminderTime,
    progress.lastPracticeDate,
  ]);

  /*
   * Level.
   */
  const level =
    Math.floor(progress.xp / 500) +
    1;

  /*
   * ---------------- STORIES ----------------
   */

  const listenToStory = () => {
    const today =
      getLocalDateKey();

    setProgress(
      (previous) => {
        const listenGoal = {
          ...previous.dailyGoals
            .listenStory,
        };

        if (
          listenGoal.current <
          listenGoal.target
        ) {
          listenGoal.current += 1;
        }

        const previousDate =
          previous.lastActiveDate;
        const dayGap =
          previousDate
            ? getDayDifferenceInDays(
                previousDate,
                today
              )
            : 0;

        let newStreak =
          previous.streak || 0;

        if (previousDate === today) {
          newStreak = previous.streak || 0;
        } else if (
          previousDate ===
          getPreviousDateKey()
        ) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        if (dayGap > 1) {
          newStreak = 1;
        }

        return {
          ...previous,

          xp:
            previous.xp + 20,

          streak: newStreak,

          started: true,

          lastActiveDate: today,

          lastPracticeDate: today,

          dailyGoals: {
            ...previous.dailyGoals,

            listenStory:
              listenGoal,
          },
        };
      }
    );
  };

  /*
   * ---------------- AI SONGS ----------------
   */

  const listenToSong = () => {
    const today =
      getLocalDateKey();

    setProgress(
      (previous) => {
        const previousDate = previous.lastActiveDate;
        const dayGap = previousDate
          ? getDayDifferenceInDays(previousDate, today)
          : 0;

        const nextStreak =
          previousDate === today
            ? previous.streak || 0
            : previousDate === getPreviousDateKey()
              ? (previous.streak || 0) + 1
              : dayGap > 1
                ? 1
                : 1;

        return {
          ...previous,

          xp:
            previous.xp + 10,

          streak: nextStreak,

          started: true,

          lastActiveDate: today,

          lastPracticeDate: today,
        };
      }
    );
  };

  const singSong = () => {
    const today =
      getLocalDateKey();

    setProgress(
      (previous) => {
        const singGoal = {
          ...previous.dailyGoals
            .singSong,
        };

        if (
          singGoal.current <
          singGoal.target
        ) {
          singGoal.current += 1;
        }

        const previousDate = previous.lastActiveDate;
        const dayGap = previousDate
          ? getDayDifferenceInDays(previousDate, today)
          : 0;

        const nextStreak =
          previousDate === today
            ? previous.streak || 0
            : previousDate === getPreviousDateKey()
              ? (previous.streak || 0) + 1
              : dayGap > 1
                ? 1
                : 1;

        return {
          ...previous,

          xp:
            previous.xp + 20,

          streak: nextStreak,

          started: true,

          lastActiveDate: today,

          lastPracticeDate: today,

          dailyGoals: {
            ...previous.dailyGoals,

            singSong:
              singGoal,
          },
        };
      }
    );
  };

  /*
   * ---------------- PRACTICE ----------------
   */

  const practiceWords = (
    minutes
  ) => {
    const today =
      getLocalDateKey();

    setProgress(
      (previous) => {
        const practiceGoal = {
          ...previous.dailyGoals
            .practiceMinutes,
        };

        const remaining =
          practiceGoal.target -
          practiceGoal.current;

        const toAdd = Math.min(
          minutes,
          remaining
        );

        practiceGoal.current +=
          toAdd;

        const previousDate = previous.lastActiveDate;
        const dayGap = previousDate
          ? getDayDifferenceInDays(previousDate, today)
          : 0;

        const nextStreak =
          previousDate === today
            ? previous.streak || 0
            : previousDate === getPreviousDateKey()
              ? (previous.streak || 0) + 1
              : dayGap > 1
                ? 1
                : 1;

        return {
          ...previous,

          xp:
            previous.xp +
            minutes * 2,

          streak: nextStreak,

          started: true,

          lastActiveDate: today,

          lastPracticeDate: today,

          dailyGoals: {
            ...previous.dailyGoals,

            practiceMinutes:
              practiceGoal,
          },
        };
      }
    );
  };

  /*
   * Hear a practice word:
   * +10 XP
   */
  const hearPracticeWord =
    () => {
      const today =
        getLocalDateKey();

      setProgress(
        (previous) => {
          const previousDate = previous.lastActiveDate;
          const dayGap = previousDate
            ? getDayDifferenceInDays(previousDate, today)
            : 0;

          const nextStreak =
            previousDate === today
              ? previous.streak || 0
              : previousDate === getPreviousDateKey()
                ? (previous.streak || 0) + 1
                : dayGap > 1
                  ? 1
                  : 1;

          return {
            ...previous,

            xp:
              previous.xp + 10,

            streak: nextStreak,

            started: true,

            lastActiveDate: today,

            lastPracticeDate: today,
          };
        }
      );
    };

  /*
   * Say a difficult word correctly:
   * +15 XP
   */
  const practiceSpeechWord =
    () => {
      const today =
        getLocalDateKey();

      setProgress(
        (previous) => {
          const previousDate = previous.lastActiveDate;
          const dayGap = previousDate
            ? getDayDifferenceInDays(previousDate, today)
            : 0;

          const nextStreak =
            previousDate === today
              ? previous.streak || 0
              : previousDate === getPreviousDateKey()
                ? (previous.streak || 0) + 1
                : dayGap > 1
                  ? 1
                  : 1;

          return {
            ...previous,

            xp:
              previous.xp + 15,

            streak: nextStreak,

            started: true,

            lastActiveDate: today,

            lastPracticeDate: today,
          };
        }
      );
    };

  /*
   * ---------------- JOURNEY ----------------
   */

  const startJourney = () => {
    recordDailyActivity();
  };

  /*
   * ---------------- REMINDER ----------------
   */

  const setReminderTime =
    (time) => {
      setProgress(
        (previous) => ({
          ...previous,

          reminderTime: time,
        })
      );
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
  const context =
    useContext(
      ProgressContext
    );

  if (!context) {
    throw new Error(
      "useProgress must be used inside ProgressProvider"
    );
  }

  return context;
}