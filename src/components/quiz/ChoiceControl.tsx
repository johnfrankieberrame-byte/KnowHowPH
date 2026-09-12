interface ChoiceControlProps {
  choices: string[];
  value: string | undefined;
  onChange: (value: string) => void;
}

export default function ChoiceControl({ choices, value, onChange }: ChoiceControlProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {choices.map((choice) => {
        const active = value === choice;
        return (
          <button
            key={choice}
            type="button"
            onClick={() => onChange(choice)}
            className={`rounded-xl border p-4 text-left font-semibold transition-all ${
              active
                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-300"
            }`}
          >
            {choice}
          </button>
        );
      })}
    </div>
  );
}
