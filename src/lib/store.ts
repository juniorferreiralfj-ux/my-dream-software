import { useSyncExternalStore } from "react";
import demoSlabPhoto from "@/assets/demo-slab.jpg";

export type Cut = {
  id: string;
  label: string;
  x: number; // mm
  y: number; // mm
  w: number; // mm
  h: number; // mm
  color: string;
};

export type LeftoverRect = { x: number; y: number; w: number; h: number };

export type Slab = {
  id: string;
  name: string;
  material: string;
  widthMm: number;
  heightMm: number;
  photo: string; // dataURL ou URL de asset
  createdAt: number;
  cuts: Cut[];
  leftover: LeftoverRect | null;
};

export type Leftover = {
  id: string;
  slabId: string;
  slabName: string;
  material: string;
  widthMm: number;
  heightMm: number;
  photo: string;
  createdAt: number;
  status: "disponivel" | "utilizada";
};

export type AppState = {
  slabs: Slab[];
  leftovers: Leftover[];
};

const STORAGE_KEY = "cortachapa-state-v1";

export const CUT_COLORS = [
  "#3b82f6",
  "#f97316",
  "#22c55e",
  "#eab308",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#ef4444",
];

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function seedState(): AppState {
  return {
    slabs: [
      {
        id: "demo",
        name: "Chapa 147-2",
        material: "Mármore Branco Paraná",
        widthMm: 3200,
        heightMm: 1900,
        photo: demoSlabPhoto,
        createdAt: Date.now(),
        cuts: [
          { id: uid(), label: "Pia cozinha", x: 60, y: 60, w: 1200, h: 600, color: CUT_COLORS[0]! },
          { id: uid(), label: "Bancada banho", x: 1360, y: 60, w: 900, h: 550, color: CUT_COLORS[1]! },
        ],
        leftover: { x: 2360, y: 60, w: 780, h: 1780 },
      },
    ],
    leftovers: [],
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    // ignore
  }
  const seeded = seedState();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  } catch {
    // ignore
  }
  return seeded;
}

let state: AppState | null = null;
const listeners = new Set<() => void>();

function getState(): AppState {
  if (!state) state = loadState();
  return state;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage cheio (foto grande) — mantém em memória
  }
}

export function updateState(updater: (s: AppState) => AppState) {
  state = updater(getState());
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function getSlab(id: string): Slab | undefined {
  return getState().slabs.find((s) => s.id === id);
}
