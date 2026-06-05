export default function StoreTeaser({ compact = false }) {
  if (compact) {
    return (
      <div className="dark-ctx rounded-lg bg-night felt-grain border border-divider p-7 mb-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-1">
          <h2 className="font-display font-bold text-2xl text-heading leading-tight">Cues, chalk & cases — built for the break.</h2>
          <p className="text-body text-[14.5px] mt-2">Get notified when the SnookerPK store launches.</p>
        </div>
        <div className="flex gap-2.5 w-full sm:w-auto">
          <input className="input" placeholder="your@email.com" />
          <button className="btn btn-brass whitespace-nowrap">Notify me</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-ctx rounded-lg overflow-hidden relative bg-night felt-grain border border-divider flex flex-col justify-between p-7">
      <div className="relative">
        <span className="badge bg-brass-tint text-brass-700 mb-4"><span className="dot" />Store · coming soon</span>
        <h2 className="font-display font-bold text-2xl text-heading leading-tight">
          Cues, chalk & cases —<br />built for the break.
        </h2>
        <p className="text-body text-[14.5px] mt-3 max-w-xs">
          The SnookerPK store launches soon with pro equipment from trusted Pakistani retailers.
        </p>
      </div>
      <div className="relative flex gap-2.5 mt-6">
        <input className="input" placeholder="Email me at launch" />
        <button className="btn btn-brass whitespace-nowrap">Notify me</button>
      </div>
    </div>
  );
}
