import { useOnboarding } from "../../context/OnboardingContext";

export default function ChildProfile() {
  const { data, updateData } = useOnboarding();

  return (
    <>
      <h1>Child Profile</h1>

      <p className="subtitle">
        Let's personalize your child's learning journey.
      </p>

      {/* First Name */}
      <div className="form-group">
        <label htmlFor="first-name">First Name</label>

        <input
          id="first-name"
          type="text"
          placeholder="First Name"
          value={data.firstName}
          onChange={(e) =>
            updateData({
              firstName: e.target.value,
            })
          }
        />
      </div>

      {/* Last Name */}
      <div className="form-group">
        <label htmlFor="last-name">
          Last Name (Optional)
        </label>

        <input
          id="last-name"
          type="text"
          placeholder="Last Name"
          value={data.lastName}
          onChange={(e) =>
            updateData({
              lastName: e.target.value,
            })
          }
        />
      </div>

      {/* Gender */}
      <div className="form-group">
        <label>Child's Gender</label>

        <div
          className="radio-group"
          role="radiogroup"
          aria-label="Child's gender"
        >
          <label className="radio-option">
            <input
              type="radio"
              name="gender"
              value="girl"
              checked={data.gender === "girl"}
              onChange={(e) =>
                updateData({
                  gender: e.target.value,
                })
              }
            />

            Girl
          </label>

          <label className="radio-option">
            <input
              type="radio"
              name="gender"
              value="boy"
              checked={data.gender === "boy"}
              onChange={(e) =>
                updateData({
                  gender: e.target.value,
                })
              }
            />

            Boy
          </label>
        </div>
      </div>

      {/* Date of Birth */}
      <div className="form-group">
        <label htmlFor="date-of-birth">
          Date of Birth
        </label>

        <input
          id="date-of-birth"
          type="date"
          value={data.dob}
          onChange={(e) =>
            updateData({
              dob: e.target.value,
            })
          }
        />
      </div>

      {/* Primary Language */}
      <div className="form-group">
        <label htmlFor="primary-language">
          Primary Language
        </label>

        <select
          id="primary-language"
          value={data.primaryLanguage}
          onChange={(e) =>
            updateData({
              primaryLanguage: e.target.value,
            })
          }
        >
          <option>English</option>
          <option>Malayalam</option>
          <option>Arabic</option>
        </select>
      </div>
    </>
  );
}