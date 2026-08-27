import { useRef, useState } from "react";
import { useOnboarding } from "../../context/OnboardingContext";

export default function ChildProfile() {
  const { data, updateData } = useOnboarding();
  const fileInputRef = useRef(null);

  const [imageError, setImageError] = useState("");

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageError("");

    // Only allow image files.
    if (!file.type.startsWith("image/")) {
      setImageError("Please choose an image file.");
      return;
    }

    // Keep the MVP lightweight.
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Please choose an image smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateData({
        avatar: reader.result,
      });
    };

    reader.onerror = () => {
      setImageError("We couldn't upload that image. Please try again.");
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    updateData({
      avatar: "",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <h1>Child Profile</h1>

      <p className="subtitle">
        Let's personalize your child's learning journey.
      </p>

      {/* Avatar Upload */}
      <div className="form-group">
        <label>Child's Avatar</label>

        <div className="avatar-upload">
          <div className="avatar-preview">
            {data.avatar ? (
              <img
                src={data.avatar}
                alt="Uploaded child avatar preview"
              />
            ) : (
              <div className="avatar-placeholder" aria-hidden="true">
                👧
              </div>
            )}
          </div>

          <div className="avatar-upload-actions">
            <button
              type="button"
              className="avatar-upload-button"
              onClick={openFilePicker}
            >
              {data.avatar ? "Change Avatar" : "Upload Avatar"}
            </button>

            {data.avatar && (
              <button
                type="button"
                className="avatar-remove-button"
                onClick={handleRemoveAvatar}
              >
                Remove
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            hidden
          />

          <p className="avatar-help">
            Parents can upload a photo or a cartoon image.
          </p>

          {imageError && (
            <p className="avatar-error" role="alert">
              {imageError}
            </p>
          )}
        </div>
      </div>

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