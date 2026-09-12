import { useEffect, useState } from "react";

const skills = [
  { name: "Data Analytics", growth: 42 },
  { name: "Cloud Architecture", growth: 38 },
  { name: "Digital Marketing", growth: 25 },
  { name: "Cybersecurity", growth: 22 },
  { name: "UI/UX Design", growth: 18 },
];

const maxGrowth = Math.max(...skills.map((s) => s.growth));

export default function TrendingSkills() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h3 className="mb-5 font-bold text-zinc-900">Trending Skills</h3>
      <div className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.name}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-700">{skill.name}</span>
              <span className="font-bold text-emerald-600">+{skill.growth}% YoY</span>
            </div>
            <div className="h-2.5 rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                style={{ width: animated ? `${(skill.growth / maxGrowth) * 100}%` : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
