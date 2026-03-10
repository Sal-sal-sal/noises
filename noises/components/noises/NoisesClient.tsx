'use client';
import { useState } from "react";
import { NoiseId } from "./types";
import NoiseCanvas from "./NoiseCanvas";
import NoiseSelector from "./NoiseSelector";

// hex → [r,g,b] в диапазоне 0.0–1.0 для WebGL
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

const PRESET_COLORS = [
  { label: "Red",    hex: "#ff2200" },
  { label: "Cyan",   hex: "#00ffcc" },
  { label: "Blue",   hex: "#2266ff" },
  { label: "Gold",   hex: "#ffaa00" },
  { label: "White",  hex: "#ffffff" },
  { label: "Violet", hex: "#aa44ff" },
];

export default function NoisesClient() {
  const [active, setActive]     = useState<NoiseId>("domain");
  const [colorHex, setColorHex] = useState("#ff2200");

  const color = hexToRgb(colorHex);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* WebGL фон — принимает цвет */}
      <NoiseCanvas activeNoise={active} color={color} />

      {/* Тёмный оверлей */}
      <div className="fixed inset-0 z-10 bg-black/40 pointer-events-none" />

      {/* Орбитальный селектор */}
      <NoiseSelector active={active} onChange={setActive} />

      {/* Color picker — снизу по центру */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3">
        {/* Пресеты */}
        <div className="flex gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => setColorHex(c.hex)}
              title={c.label}
              className="w-6 h-6 rounded-full border-2 transition-all duration-150 hover:scale-110"
              style={{
                backgroundColor: c.hex,
                borderColor: colorHex === c.hex ? "#fff" : "transparent",
                boxShadow: colorHex === c.hex ? `0 0 10px ${c.hex}` : "none",
              }}
            />
          ))}
        </div>

        {/* Нативный color input */}
        <div className="flex items-center gap-2">
          <label className="font-mono text-[10px] tracking-widest text-white/30 uppercase">
            Color
          </label>
          <input
            type="color"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
            style={{ padding: 0 }}
          />
          <span className="font-mono text-[10px] tracking-wider text-white/30 uppercase">
            {colorHex}
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-2 w-full z-30 text-center font-mono text-[9px] tracking-[0.25em] text-white/10 pointer-events-none">
        WEBGL · GLSL FRAGMENT SHADER · REALTIME
      </footer>
    </div>
  );
}