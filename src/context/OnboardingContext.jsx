import { createContext, useContext, useEffect, useState } from "react";

const OnboardingContext = createContext();

const DEFAULT_DATA = {
  // Child Profile
  firstName: "",
  lastName: "",
  dob: "",
  gender: "",
  primaryLanguage: "English",
  avatar: "",

  // Speech Information
  communication: "Speaking",
  difficultSounds: [],
  difficultWords: "",
  condition: "None",

  // Learning Preferences
  storyTheme: "Animals",
  songGenre: "Learning Songs",

  // Parent / Guardian
  guardianName: "",
  relationship: "",
  email: "",
  profileArt: "🌈",

  // Privacy & Consent
  consentRecording: false,
  consentAI: false,
  consentTerms: false,

  // Setup
  headsetConnected: false,
  micPermission: false,
  notifications: false,
  reminderTime: "16:00",

  // Learning Progress
  learningStarted: false,
  xp: 0,
  level: 1,
  dailyActions: {
    story: 0,
    words: 0,
    song: 0,
    speaking: 0,
  },
  dailyXp: 0,
  dailyScores: {},
  practiceDates: [],
};

export function OnboardingProvider({ children }) {
  // Current onboarding step
  const [step, setStep] = useState(0);

  // Load saved data
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("melodic-voice-profile");

    if (saved) {
      try {
        return {
          ...DEFAULT_DATA,
          ...JSON.parse(saved),
        };
      } catch {
        return {
          ...DEFAULT_DATA,
        };
      }
    }

    return {
      ...DEFAULT_DATA,
    };
  });

  // Save data whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "melodic-voice-profile",
      JSON.stringify(data)
    );
  }, [data]);

  // Update profile
  const updateData = (updates) => {
    setData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Record practice activity
  const recordPractice = (type, points) => {
    const today = new Date().toISOString().slice(0, 10);

    setData((prev) => {
      const safeDailyActions = {
        story: 0,
        words: 0,
        song: 0,
        speaking: 0,
        ...(prev.dailyActions || {}),
      };

      const safeDailyScores = {
        ...(prev.dailyScores || {}),
      };

      const safePracticeDates = Array.isArray(prev.practiceDates)
        ? prev.practiceDates
        : [];

      const xp = (prev.xp || 0) + points;
      const level = Math.floor(xp / 500) + 1;

      const dailyActions = {
        ...safeDailyActions,
        [type]: (safeDailyActions[type] || 0) + 1,
      };

      const dailyScores = {
        ...safeDailyScores,
        [today]: (safeDailyScores[today] || 0) + points,
      };

      const practiceDates = safePracticeDates.includes(today)
        ? safePracticeDates
        : [...safePracticeDates, today];

      return {
        ...prev,
        xp,
        level,
        dailyActions,
        dailyXp: dailyScores[today],
        dailyScores,
        practiceDates,
        learningStarted: true,
      };
    });
  };

  // Reset onboarding
  const resetOnboarding = () => {
    setStep(0);

    setData({
      ...DEFAULT_DATA,
      dailyActions: {
        story: 0,
        words: 0,
        song: 0,
        speaking: 0,
      },
      dailyScores: {},
      practiceDates: [],
    });

    localStorage.removeItem("melodic-voice-profile");
  };

  return (
    <OnboardingContext.Provider
      value={{
        step,
        setStep,
        data,
        updateData,
        recordPractice,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error(
      "useOnboarding must be used inside OnboardingProvider"
    );
  }

  return context;
}