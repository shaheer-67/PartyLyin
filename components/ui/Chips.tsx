"use client";

interface ChipsProps {
  opts: string[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Horizontal scrollable chip selector used for filter options.
 */
export function Chips({ opts, value, onChange }: ChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((opt) => (
        <button
          key={opt}
          className="chip whitespace-nowrap"
          aria-pressed={opt === value}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
