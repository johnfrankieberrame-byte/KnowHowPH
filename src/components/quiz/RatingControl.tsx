interface RatingControlProps {
  value: number | undefined;
  onChange: (value: number) => void;
}

export default function RatingControl({ value, onChange }: RatingControlProps) {
  return (
    <div className="flex justify-center gap-3">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex h-12 w-12 items-center justify-center rounded-xl border text-lg font-bold transition-all ${
              active
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-emerald-600 hover:text-emerald-600"
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
