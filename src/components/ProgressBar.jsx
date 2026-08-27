import { useOnboarding } from "../context/OnboardingContext";

export default function ProgressBar() {
  const { step } = useOnboarding();

  const total = 6;
  const percent = ((step + 1) / total) * 100;

  return (
    <>
      <p className="progress-text">
        Step {step + 1} of {total}
      </p>

      <div className="progress">
        <div
          className="progress-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </>
  );
}