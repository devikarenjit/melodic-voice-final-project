import { useOnboarding } from "../../context/OnboardingContext";

export default function PrivacyConsent() {
  const { data, updateData } = useOnboarding();

  return (
    <>
      <h1>Privacy & Consent</h1>

      <p className="subtitle">
        Please review these permissions before creating your child's account.
      </p>

      <div className="consent-card">

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={data.consentRecording}
            onChange={(e) =>
              updateData({ consentRecording: e.target.checked })
            }
          />
          <span>I consent to recording my child's speech for assessment.</span>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={data.consentAI}
            onChange={(e) =>
              updateData({ consentAI: e.target.checked })
            }
          />
          <span>I consent to AI analyzing my child's speech.</span>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={data.consentTerms}
            onChange={(e) =>
              updateData({ consentTerms: e.target.checked })
            }
          />
          <span>I agree to the Terms of Service and Privacy Policy.</span>
        </label>

      </div>
    </>
  );
}