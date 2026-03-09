'use client';
import { useState } from "react";
import { NOISE_TYPES, NoiseId } from "./types";

const RADIUS = 170;

interface Props {
  active: NoiseId;
  onChange: (id: NoiseId) => void;
}

export default function NoiseSelector({ active, onChange }: Props) {
  const [hovering, setHovering] = useState<NoiseId | null>(null);
  const count = NOISE_TYPES.length;
  const current = NOISE_TYPES.find((n) => n.id === active)!;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">

      {/* Outer decorative rings */}
      <div
        className="absolute rounded-full border border-red-700/10 pointer-events-none"
        style={{ width: RADIUS * 2 + 140, height: RADIUS * 2 + 140 }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: RADIUS * 2 + 80,
          height: RADIUS * 2 + 80,
          border: "1px dashed rgba(220,38,38,0.08)",
        }}
      />

      {/* Orbital buttons */}
      {NOISE_TYPES.map((n, i) => {
        const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
        const x = Math.cos(angle) * RADIUS;
        const y = Math.sin(angle) * RADIUS;
        const isActive = n.id === active;
        const isHover = hovering === n.id;

        return (
          <button
            key={n.id}
            onMouseEnter={() => setHovering(n.id)}
            onMouseLeave={() => setHovering(null)}
            onClick={() => onChange(n.id)}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
            className={[
              "pointer-events-auto flex flex-col items-center gap-0.5 px-4 py-2.5 rounded",
              "border backdrop-blur-md transition-all duration-200 cursor-pointer",
              "font-mono tracking-widest text-[11px] font-bold whitespace-nowrap min-w-[90px]",
              isActive
                ? "border-red-600 bg-red-700/20 text-red-500 shadow-[0_0_24px_rgba(220,38,38,0.3)]"
                : isHover
                ? "border-white/20 bg-red-900/10 text-red-400/80"
                : "border-white/10 bg-black/60 text-white/40",
            ].join(" ")}
          >
            {n.label.toUpperCase()}
            <span
              className={[
                "text-[9px] tracking-wide font-normal",
                isActive ? "text-red-400/70" : "text-white/20",
              ].join(" ")}
            >
              {n.desc}
            </span>
          </button>
        );
      })}

      {/* Center label */}
      <div className="flex flex-col items-center gap-2 pointer-events-none select-none">
        <span className="text-red-600/60 font-mono tracking-[0.35em] text-[10px]">
          ACTIVE
        </span>
        <span
          className="font-mono font-black text-white leading-none tracking-tight"
          style={{
            fontSize: "clamp(22px, 4vw, 38px)",
            textShadow: "0 0 40px rgba(220,38,38,0.7)",
          }}
        >
          {current.label.toUpperCase()}
        </span>
        <span className="font-mono text-[11px] tracking-[0.2em] text-white/30 uppercase">
          {current.desc}
        </span>

        {/* Pulse dot */}
        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.8)] animate-pulse" />
      </div>
    </div>
  );
}
