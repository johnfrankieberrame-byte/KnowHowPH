import { Frown, Meh, Smile, ThumbsDown, ThumbsUp } from "lucide-react";
import type { LikertValue } from "../../types";

const OPTIONS: { value: LikertValue; label: string; icon: typeof ThumbsUp; className: string }[] = [
  { value: 1, label: "Strongly Disagree", icon: ThumbsDown, className: "text-red-400" },
  { value: 2, label: "Disagree", icon: Frown, className: "text-orange-300" },
  { value: 3, label: "Neutral", icon: Meh, className: "text-zinc-300" },
  { value: 4, label: "Agree", icon: Smile, className: "text-emerald-300" },
  { value: 5, label: "Strongly Agree", icon: ThumbsUp, className: "text-emerald-400" },
];

interface LikertControlProps {
  value: LikertValue | undefined;
  onChange: (value: LikertValue) => void;
}

export default function LikertControl({ value, onChange }: LikertControlProps) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            title={option.label}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all sm:p-4 ${
              active
                ? "border-emerald-600 bg-emerald-50"
                : "border-zinc-200 bg-white hover:border-emerald-300"
            }`}
          >
            <Icon size={24} className={option.className} />
            <span className="hidden text-center text-[10px] font-medium text-zinc-500 sm:block">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
