import { useOnboarding } from "../../context/OnboardingContext";

const profileOptions = [
  { emoji: "🌈", label: "Rainbow" },
  { emoji: "🦊", label: "Fox" },
  { emoji: "🐻", label: "Bear" },
  { emoji: "🚀", label: "Rocket" },
  { emoji: "🎵", label: "Music" },
  { emoji: "🌟", label: "Star" },
  { emoji: "🧁", label: "Cake" },
  { emoji: "🦄", label: "Unicorn" },
];

export default function ParentGuardian() {
  const { data, updateData } = useOnboarding();

  return (
    <>
      <h1>Parent / Guardian</h1>

      <p className="subtitle">
        We’ll use this info to keep the account safe and cheerful.
      </p>

      <div className="form-group">
        <label>Choose a fun profile picture *</label>

        <div
          className="profile-art-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          {profileOptions.map((option) => {
            const selected = data.profileArt === option.emoji;

            return (
              <button
                key={option.emoji}
                type="button"
                onClick={() => updateData({ profileArt: option.emoji })}
                style={{
                  border: selected ? "2px solid #5b4ae7" : "1px solid #e6e0ff",
                  background: selected ? "#f3f0ff" : "#fff",
                  borderRadius: "18px",
                  padding: "16px 8px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  minHeight: "112px",
                  boxShadow: selected ? "0 10px 22px rgba(91, 74, 231, 0.12)" : "0 7px 18px rgba(50, 40, 85, 0.05)",
                }}
              >
                <span style={{ fontSize: "32px" }}>{option.emoji}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#443d5d" }}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <label>Guardian Name *</label>
      <input
        type="text"
        value={data.guardianName || ""}
        onChange={(e) => updateData({ guardianName: e.target.value })}
      />

      <label>Relationship *</label>
      <select
        value={data.relationship || ""}
        onChange={(e) => updateData({ relationship: e.target.value })}
      >
        <option value="">Select</option>
        <option>Mother</option>
        <option>Father</option>
        <option>Guardian</option>
        <option>Grandparent</option>
        <option>Other</option>
      </select>

      <label>Email *</label>
      <input
        type="email"
        value={data.email || ""}
        onChange={(e) => updateData({ email: e.target.value })}
      />

      <label>Phone Number *</label>
      <input
        type="tel"
        value={data.phone || ""}
        onChange={(e) => updateData({ phone: e.target.value })}
      />
    </>
  );
}