import { useNavigate } from "react-router-dom";
import { useMelodic } from "../context/MelodicContext";
import together from "../assets/together.png";

export default function HeroBanner() {
  const navigate = useNavigate();
  const { child, startJourney } = useMelodic();

  const handleStart = () => {
    if (!child.started) {
      startJourney();
    }
    navigate("/story");
  };

  return (
    <section
      onClick={handleStart}
      className="relative overflow-hidden rounded-[34px] bg-gradient-to-r from-[#ECE9FF] via-[#DDEBFF] to-[#CFE6FF] p-8 md:p-10 cursor-pointer hover:scale-[1.01] transition"
    >
      <div className="grid lg:grid-cols-2 items-center gap-8">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full bg-white/70 px-4 py-2 text-sm text-violet-600">
            ✨ {child.started ? "Welcome back" : "Level 1"}
          </div>

          <h1 className="text-5xl font-black leading-tight text-slate-900">
            Every word you say makes you{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
              stronger!
            </span>
          </h1>

          <p className="mt-5 max-w-md text-lg text-slate-600">
            Fun stories and songs that help children build speech confidence.
          </p>

          <div className="mt-8">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
              className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-7 py-4 text-white font-semibold shadow-lg"
            >
              ▶ {child.started ? "Continue Learning" : "Start My Journey"}
            </button>
          </div>
        </div>

        <div className="relative flex justify-center">
          <img
            src={together}
            alt="Melodic Voice characters"
            className="max-h-[380px] w-auto object-contain"
          />

          <div className="absolute top-6 left-4 text-4xl animate-bounce">🎵</div>
          <div className="absolute top-20 right-16 text-3xl animate-pulse">⭐</div>
          <div className="absolute bottom-20 left-8 text-3xl">✨</div>
        </div>
      </div>

      <div className="absolute right-6 top-6 rounded-3xl bg-white p-5 shadow-lg w-44">
        <p className="text-sm text-slate-500">Today's Streak</p>

        <div className="mt-2 text-5xl font-black text-slate-900">
          {child.streak}
        </div>

        <p className="text-slate-500">Days 🔥</p>
      </div>
    </section>
  );
}