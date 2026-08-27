export default function BottomStats() {
  return (
    <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">

      <div className="grid gap-6 md:grid-cols-4">

        <div>
          <div className="text-3xl">🎯</div>
          <h4 className="font-bold mt-2">Daily Goals</h4>
          <p className="text-slate-500">Keep the streak alive.</p>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span>Practice</span>
            <span>10/15 min</span>
          </div>

          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full w-2/3 bg-violet-500 rounded-full"/>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span>Story</span>
            <span>1/1</span>
          </div>

          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full w-full bg-green-500 rounded-full"/>
          </div>
        </div>

        <div className="rounded-2xl bg-yellow-50 p-4">
          <div className="text-3xl">🎁</div>
          <h4 className="font-bold mt-2">12 Stars</h4>
          <p className="text-slate-500">Rewards earned</p>
        </div>

      </div>

    </section>
  );
}