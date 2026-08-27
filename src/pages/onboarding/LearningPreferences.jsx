import { useOnboarding } from "../../context/OnboardingContext";

export default function LearningPreferences() {
  const { data, updateData } = useOnboarding();

  return (
    <>
      <h1>Learning Preferences</h1>

      <p className="subtitle">
        Choose the types of stories and songs your child enjoys most.
      </p>

      <div className="form-group">
        <label>Favorite Story Theme *</label>

        <select
          value={data.storyTheme || ""}
          onChange={(e) => updateData({ storyTheme: e.target.value })}
        >
          <option value="">Select a theme</option>
          <option>Fantasy</option>
          <option>Adventure</option>
          <option>Animals</option>
          <option>Space</option>
          <option>Dinosaurs</option>
          <option>Princess</option>
          <option>Superheroes</option>
          <option>Educational</option>
        </select>
      </div>

      <div className="form-group">
        <label>Favorite Music Genre *</label>

        <select
          value={data.songGenre || ""}
          onChange={(e) => updateData({ songGenre: e.target.value })}
        >
          <option value="">Select a music genre</option>
          <option>Nursery Rhymes</option>
          <option>Lullaby</option>
          <option>Action Songs</option>
          <option>Learning Songs</option>
          <option>Dance Songs</option>
          <option>Animal Songs</option>
          <option>Space Songs</option>
        </select>
      </div>
    </>
  );
}