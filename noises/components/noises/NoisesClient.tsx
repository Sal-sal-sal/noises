'use client';
import { useState } from "react";
import { NoiseId } from "./types";
import NoiseCanvas from "./NoiseCanvas";
import NoiseSelector from "./NoiseSelector";

export default function NoisesClient() {
  const [active, setActive] = useState<NoiseId>("domain");

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* WebGL background */}
      <NoiseCanvas activeNoise={active} />

      {/* Dark overlay */}
      <div className="fixed inset-0 z-10 bg-black/40 pointer-events-none" />

      {/* Orbital selector */}
      <NoiseSelector active={active} onChange={setActive} />

      {/* Footer */}
      <footer className="fixed bottom-6 w-full z-30 text-center font-mono text-[10px] tracking-[0.25em] text-white/15 pointer-events-none">
        WEBGL · GLSL FRAGMENT SHADER · REALTIME
      </footer>
    </div>
  );
}
