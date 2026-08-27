import { Home, User, Mic, BookOpen, Music, BarChart3, Heart, Users, Settings } from "lucide-react";

const items = [
  ["Home", Home],
  ["Child Profile", User],
  ["Speech Assessment", Mic],
  ["AI Stories", BookOpen],
  ["AI Songs", Music],
  ["Progress", BarChart3],
  ["Health", Heart],
  ["Parents Corner", Users],
  ["Settings", Settings],
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-72 flex-col rounded-3xl bg-white p-6 shadow-sm">

      <div className="flex items-center gap-3 mb-10">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl">
          🎙️
        </div>

        <div>
          <h2 className="font-extrabold text-xl text-slate-900">Melodic Voice</h2>
          <p className="text-sm text-violet-500">AI Coach</p>
        </div>
      </div>

      <nav className="space-y-2 flex-1">

        {items.map(([name, Icon], i) => (
          <button
            key={name}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 transition ${
              i === 0
                ? "bg-violet-100 text-violet-700"
                : "hover:bg-slate-50 text-slate-600"
            }`}
          >
            <Icon size={20}/>
            {name}
          </button>
        ))}

      </nav>

      <div className="mt-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-500 p-5 text-white">

        <div className="text-5xl mb-3">🤖</div>

        <h4 className="font-bold mb-2">Practice every day!</h4>

        <p className="text-sm text-indigo-100">
          Tiny adventures create big speaking confidence.
        </p>

      </div>

    </aside>
  );
}