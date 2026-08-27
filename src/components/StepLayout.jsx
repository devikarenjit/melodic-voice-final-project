import ProgressBar from "./ProgressBar";
import ChildProfile from "../pages/onboarding/ChildProfile";
import SpeechInfo from "../pages/onboarding/SpeechInfo";
import LearningPreferences from "../pages/onboarding/LearningPreferences";
import ParentGuardian from "../pages/onboarding/ParentGuardian";
import PrivacyConsent from "../pages/onboarding/PrivacyConsent";
import Dashboard from "../pages/Dashboard";
import { useOnboarding } from "../context/OnboardingContext";

export default function StepLayout() {
  const { step, setStep, data } = useOnboarding();

  const canContinue = () => {
    switch (step) {
      case 0:
        return data.firstName?.trim() && data.gender && data.dob && data.primaryLanguage;

      case 1:
        return data.communication && data.difficultWords?.trim();

      case 2:
        return data.storyTheme && data.songGenre;

      case 3:
        return (
          data.guardianName?.trim() &&
          data.relationship &&
          data.email?.trim()
        );

      case 4:
        return (
          data.consentRecording &&
          data.consentAI &&
          data.consentTerms
        );

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canContinue()) return;

    if (step === 4) {
      setStep(5);
    } else {
      setStep(step + 1);
    }
  };

  if (step === 5) {
    return <Dashboard />;
  }

  return (
    <div className="page">
      <div className="card">

        <ProgressBar />

        {step === 0 && <ChildProfile />}
        {step === 1 && <SpeechInfo />}
        {step === 2 && <LearningPreferences />}
        {step === 3 && <ParentGuardian />}
        {step === 4 && <PrivacyConsent />}

        <div className="buttons">
          {step > 0 && (
            <button
              className="secondary"
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={!canContinue()}
          >
            {step === 4 ? "Finish Setup" : "Continue"}
          </button>
        </div>

      </div>
    </div>
  );
}