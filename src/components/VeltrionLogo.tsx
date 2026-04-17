import { cn } from "@/lib/utils";

export function VeltrionLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Veltrion Systems"
      className={cn("text-primary", className)}
    >
      <defs>
        <linearGradient id="vlt-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#vlt-g)" />
      <path
        d="M8 10 L16 24 L24 10"
        fill="none"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="13" r="1.6" fill="white" />
    </svg>
  );
}
