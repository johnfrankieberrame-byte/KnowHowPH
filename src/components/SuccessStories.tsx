import { ArrowUpRight, CheckCircle2, ChevronRight, Quote, Zap } from "lucide-react";

interface Story {
  initials: string;
  tint: string;
  quote: string;
  name: string;
  employer: string;
  from: string;
  to: string;
}

const stories: Story[] = [
  {
    initials: "MR",
    tint: "from-emerald-500 to-emerald-700",
    quote:
      "“I was answering telco complaints for three years. A TESDA-recognized data analytics course and six months of practice got me a ₱20k jump into a role I actually enjoy.”",
    name: "Marielle R.",
    employer: "Fintech startup, Makati",
    from: "BPO Agent",
    to: "Data Analyst",
  },
  {
    initials: "JD",
    tint: "from-blue-500 to-blue-700",
    quote:
      "“Five years as a general VA taught me operations. Specializing in Shopify store management turned freelance gigs into a real e-commerce management career.”",
    name: "Jerome D.",
    employer: "DTC brand, remote (AU client)",
    from: "Freelance VA",
    to: "E-commerce Manager",
  },
  {
    initials: "AC",
    tint: "from-amber-500 to-amber-700",
    quote:
      "“Ten years at the branch counter taught me the regulatory side cold. A compliance certification was the missing piece to move into fintech.”",
    name: "Angeli C.",
    employer: "Digital bank, BGC",
    from: "Bank Teller",
    to: "Fintech Compliance",
  },
];

export default function SuccessStories() {
  return (
    <section className="bg-zinc-900 py-24 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <Zap size={12} /> Proof of Concept
          </div>
          <h2 className="font-serif text-4xl font-bold sm:text-5xl">
            Real Career Pivots. Data-Driven Results.
          </h2>
          <div className="mt-5 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-emerald-400">
            1,200+ Transitions Tracked
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <div key={story.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-4 flex items-center gap-3">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${story.tint} text-sm font-bold text-white`}
                >
                  {story.initials}
                </span>
                <Quote className="ml-auto text-emerald-500 opacity-50" size={32} />
              </div>

              <p className="text-sm text-zinc-300">{story.quote}</p>

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{story.name}</p>
                  <p className="text-xs text-zinc-500">{story.employer}</p>
                </div>
                <ArrowUpRight size={16} className="text-zinc-500" />
              </div>

              <div className="mt-5 flex items-center gap-2">
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
                  From: {story.from}
                </span>
                <ChevronRight size={12} className="animate-pulse text-emerald-500" />
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                  To: {story.to}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                <CheckCircle2 size={10} /> Verified Transition
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
