'use client';
import { useRef } from "react";
import { NoiseId } from "./types";
import { useWebGL } from "./useWebGL";

interface Props {
  activeNoise: NoiseId;
  color: [number, number, number];
}

export default function NoiseCanvas({ activeNoise, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useWebGL(canvasRef, activeNoise, color);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 w-full h-full"
    />
  );
}