import { useNavigate } from "react-router-dom";

export default function FeatureCard({
  title,
  text,
  image,
  route,
  color
}) {
  const navigate = useNavigate();

  return (
    <div
      className="feature-card"
      style={{ background: color }}
      onClick={() => navigate(route)}
    >
      <img src={image} alt={title} />

      <h3>{title}</h3>

      <p>{text}</p>
    </div>
  );
}