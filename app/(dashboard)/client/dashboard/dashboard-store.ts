"use client";

import { create } from "zustand";

type Tab = "overview" | "gigs" | "hired" | "messages" | "profile";

interface DashboardState {
  activeTab: Tab;
  setTab: (tab: Tab) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: "overview",
  setTab: (tab) => set({ activeTab: tab }),
}));
