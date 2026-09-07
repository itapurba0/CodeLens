"use client";

interface TechDebtScoreProps {
  score: number;
}

export function TechDebtScore({ score }: TechDebtScoreProps) {
  const color =
    score >= 80 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";
  const label =
    score >= 80 ? "Healthy" : score >= 50 ? "Needs Work" : "Critical";

  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-500"
        />
      </svg>
      <div className="text-center -mt-[100px]">
        <span className="text-4xl font-bold" style={{ color }}>
          {score}
        </span>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
