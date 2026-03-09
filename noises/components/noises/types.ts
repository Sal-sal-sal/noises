export type NoiseId = "white" | "perlin" | "worley" | "fbm" | "domain" | "ridged";

export interface NoiseType {
  id: NoiseId;
  label: string;
  desc: string;
}

export const NOISE_TYPES: NoiseType[] = [
  { id: "white",  label: "White",       desc: "Random pixels"     },
  { id: "perlin", label: "Perlin",      desc: "Smooth organic"    },
  { id: "worley", label: "Worley",      desc: "Cellular / voronoi"},
  { id: "fbm",    label: "FBM",         desc: "Fractal brownian"  },
  { id: "domain", label: "Domain Warp", desc: "Topological flow"  },
  { id: "ridged", label: "Ridged",      desc: "Sharp ridges"      },
];
