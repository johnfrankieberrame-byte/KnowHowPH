import { useEffect, useState } from "react";

interface ProofEvent {
  id: number;
  text: string;
  timestamp: number;
}

const EVENT_POOL = [
  "J.M. transitioned to UX Designer",
  "A.C. secured role as Cloud Engineer",
  "S.T. negotiated +₱15k Salary",
  "R.P. landed a Data Analyst role",
  "K.V. completed a TESDA welding certification",
  "L.D. moved from BPO Agent to Team Leader",
  "N.G. started freelancing as a Virtual Assistant",
  "C.F. was hired as a Digital Marketing Specialist",
];

function relativeTime(timestamp: number, now: number): string {
  const diffSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (diffSeconds < 60) return "just now";
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function LiveProofFeed() {
  const [events, setEvents] = useState<ProofEvent[]>(() => {
    const now = Date.now();
    return [
      { id: 1, text: "J.M. transitioned to UX Designer", timestamp: now - 2 * 60 * 1000 },
      { id: 2, text: "A.C. secured role as Cloud Engineer", timestamp: now - 15 * 60 * 1000 },
      { id: 3, text: "S.T. negotiated +₱15k Salary", timestamp: now - 60 * 60 * 1000 },
    ];
  });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const spawn = setInterval(() => {
      const text = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
      setEvents((prev) => [{ id: Date.now(), text, timestamp: Date.now() }, ...prev].slice(0, 5));
    }, 9000);
    return () => clearInterval(spawn);
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600">Live Proof</h3>
      </div>
      <ul className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className="flex items-center justify-between text-sm">
            <span className="text-zinc-700">{event.text}</span>
            <span className="shrink-0 pl-3 text-xs text-zinc-400">{relativeTime(event.timestamp, now)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
